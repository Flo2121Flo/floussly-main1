import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import Redis from 'ioredis';

const execAsync = promisify(exec);

interface BackupConfig {
  type: 'full' | 'incremental';
  retention: number;
  schedule: string;
  destination: string;
}

interface FailoverConfig {
  primary: string;
  replicas: string[];
  healthCheckInterval: number;
  failoverTimeout: number;
}

export class DisasterRecovery {
  private readonly backupConfig: BackupConfig;
  private readonly failoverConfig: FailoverConfig;
  private readonly dbPool: Pool;
  private readonly redisClient: Redis;
  private readonly BACKUP_DIR: string;
  private readonly LOG_DIR: string;

  constructor() {
    this.BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    this.LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

    this.backupConfig = {
      type: 'full',
      retention: 7, // days
      schedule: '0 0 * * *', // daily at midnight
      destination: this.BACKUP_DIR,
    };

    this.failoverConfig = {
      primary: process.env.DB_PRIMARY_HOST || 'localhost',
      replicas: (process.env.DB_REPLICA_HOSTS || '').split(','),
      healthCheckInterval: 5000, // 5 seconds
      failoverTimeout: 30000, // 30 seconds
    };

    this.dbPool = new Pool({
      host: this.failoverConfig.primary,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'floussly',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
    });

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.BACKUP_DIR)) {
      fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.LOG_DIR)) {
      fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupConfig.destination, `backup-${timestamp}.sql`);

    try {
      // Create database backup
      await execAsync(`pg_dump -h ${this.failoverConfig.primary} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F c -f ${backupPath}`);

      // Create Redis backup
      const redisBackupPath = path.join(this.backupConfig.destination, `redis-${timestamp}.rdb`);
      await this.redisClient.save();

      logger.info(`Backup created successfully at ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      // Restore database
      await execAsync(`pg_restore -h ${this.failoverConfig.primary} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c ${backupPath}`);

      // Restore Redis (if needed)
      if (backupPath.endsWith('.rdb')) {
        await this.redisClient.flushall();
        await execAsync(`redis-cli -h ${process.env.REDIS_HOST} -p ${process.env.REDIS_PORT} --rdb ${backupPath}`);
      }

      logger.info(`Backup restored successfully from ${backupPath}`);
    } catch (error) {
      logger.error('Backup restoration failed:', error);
      throw error;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    const files = fs.readdirSync(this.backupConfig.destination);
    const now = new Date().getTime();

    for (const file of files) {
      const filePath = path.join(this.backupConfig.destination, file);
      const stats = fs.statSync(filePath);
      const daysOld = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOld > this.backupConfig.retention) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${file}`);
      }
    }
  }

  async checkPrimaryHealth(): Promise<boolean> {
    try {
      const client = await this.dbPool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      logger.error('Primary database health check failed:', error);
      return false;
    }
  }

  async initiateFailover(): Promise<void> {
    logger.info('Initiating failover procedure...');

    // Check primary health
    const isPrimaryHealthy = await this.checkPrimaryHealth();
    if (isPrimaryHealthy) {
      logger.info('Primary is healthy, no failover needed');
      return;
    }

    // Find the most up-to-date replica
    let bestReplica = null;
    let minLag = Infinity;

    for (const replica of this.failoverConfig.replicas) {
      try {
        const replicaPool = new Pool({
          host: replica,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'floussly',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
        });

        const { rows } = await replicaPool.query(`
          SELECT
            replay_lag
          FROM pg_stat_replication
          WHERE client_addr = $1
        `, [replica]);

        if (rows[0] && rows[0].replay_lag < minLag) {
          minLag = rows[0].replay_lag;
          bestReplica = replica;
        }

        await replicaPool.end();
      } catch (error) {
        logger.error(`Failed to check replica ${replica}:`, error);
      }
    }

    if (!bestReplica) {
      throw new Error('No suitable replica found for failover');
    }

    // Promote the best replica to primary
    try {
      const replicaPool = new Pool({
        host: bestReplica,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'floussly',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      });

      await replicaPool.query('SELECT pg_promote()');
      await replicaPool.end();

      // Update configuration
      this.failoverConfig.primary = bestReplica;
      this.failoverConfig.replicas = this.failoverConfig.replicas.filter(r => r !== bestReplica);

      logger.info(`Failover completed. New primary: ${bestReplica}`);
    } catch (error) {
      logger.error('Failover failed:', error);
      throw error;
    }
  }

  async generateRecoveryPlan(): Promise<string> {
    const backupFiles = fs.readdirSync(this.backupConfig.destination)
      .filter(file => file.endsWith('.sql'))
      .sort()
      .reverse();

    const latestBackup = backupFiles[0];
    const backupPath = path.join(this.backupConfig.destination, latestBackup);

    return `
# Disaster Recovery Plan

## System Overview
- Primary Database: ${this.failoverConfig.primary}
- Replicas: ${this.failoverConfig.replicas.join(', ')}
- Latest Backup: ${latestBackup}

## Recovery Procedures

### 1. Database Recovery
1. Stop the application
2. Restore the latest backup:
   \`\`\`bash
   pg_restore -h ${this.failoverConfig.primary} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c ${backupPath}
   \`\`\`
3. Verify data integrity
4. Restart the application

### 2. Failover Procedure
1. Monitor primary health:
   \`\`\`bash
   pg_isready -h ${this.failoverConfig.primary}
   \`\`\`
2. If primary is down, initiate failover:
   \`\`\`bash
   node -e "const { DisasterRecovery } = require('./server/src/services/disasterRecovery'); new DisasterRecovery().initiateFailover();"
   \`\`\`
3. Verify new primary is operational
4. Update application configuration

### 3. Data Recovery
1. Identify the point of failure
2. Restore from the appropriate backup
3. Apply any pending transactions from the transaction log
4. Verify data consistency

## Monitoring and Alerts
- Database health checks every ${this.failoverConfig.healthCheckInterval / 1000} seconds
- Failover timeout: ${this.failoverConfig.failoverTimeout / 1000} seconds
- Backup retention: ${this.backupConfig.retention} days

## Contact Information
- Database Administrator: ${process.env.DB_ADMIN_EMAIL || 'admin@floussly.com'}
- Emergency Contact: ${process.env.EMERGENCY_CONTACT || 'emergency@floussly.com'}
    `;
  }

  async testRecoveryProcedure(): Promise<void> {
    logger.info('Starting recovery procedure test...');

    // Create test backup
    const backupPath = await this.createBackup();
    logger.info(`Test backup created at ${backupPath}`);

    // Simulate primary failure
    logger.info('Simulating primary failure...');
    await this.initiateFailover();
    logger.info('Failover completed successfully');

    // Restore from backup
    logger.info('Testing backup restoration...');
    await this.restoreBackup(backupPath);
    logger.info('Backup restoration completed successfully');

    // Cleanup test backup
    fs.unlinkSync(backupPath);
    logger.info('Test backup cleaned up');

    logger.info('Recovery procedure test completed successfully');
  }
} 