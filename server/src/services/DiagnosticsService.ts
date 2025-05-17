import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { AuditService, AuditEventType } from './AuditService';
import { NotificationService } from './NotificationService';
import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Component status enum
export enum ComponentStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

// Component check interface
export interface ComponentCheck {
  name: string;
  status: ComponentStatus;
  details: any;
  lastChecked: Date;
}

// System metrics interface
export interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    connections: number;
    bytesIn: number;
    bytesOut: number;
  };
}

// Diagnostics service class
export class DiagnosticsService {
  private static instance: DiagnosticsService;
  private pool: Pool;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private cacheTTL: number = 300; // 5 minutes

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): DiagnosticsService {
    if (!DiagnosticsService.instance) {
      DiagnosticsService.instance = new DiagnosticsService();
    }
    return DiagnosticsService.instance;
  }

  // Run full system diagnostics
  public async runDiagnostics(): Promise<{
    components: ComponentCheck[];
    metrics: SystemMetrics;
    timestamp: Date;
  }> {
    try {
      // Check cache first
      const cached = await redis.get('system_diagnostics');
      if (cached) {
        return JSON.parse(cached);
      }

      // Run component checks
      const components = await this.checkComponents();

      // Get system metrics
      const metrics = await this.getSystemMetrics();

      const diagnostics = {
        components,
        metrics,
        timestamp: new Date()
      };

      // Cache the result
      await redis.set(
        'system_diagnostics',
        JSON.stringify(diagnostics),
        'EX',
        this.cacheTTL
      );

      // Log diagnostics results
      await this.logDiagnosticsResults(diagnostics);

      return diagnostics;
    } catch (error) {
      logger.error('Failed to run diagnostics', { error: error.message });
      throw error;
    }
  }

  // Check all system components
  private async checkComponents(): Promise<ComponentCheck[]> {
    const checks: ComponentCheck[] = [];

    try {
      // Check database
      checks.push(await this.checkDatabase());

      // Check Redis
      checks.push(await this.checkRedis());

      // Check file system
      checks.push(await this.checkFileSystem());

      // Check network
      checks.push(await this.checkNetwork());

      // Check security
      checks.push(await this.checkSecurity());

      // Check application logs
      checks.push(await this.checkLogs());

      return checks;
    } catch (error) {
      logger.error('Failed to check components', { error: error.message });
      throw error;
    }
  }

  // Check database health
  private async checkDatabase(): Promise<ComponentCheck> {
    try {
      const startTime = Date.now();
      const result = await this.pool.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      const status = responseTime < 100 ? ComponentStatus.HEALTHY :
                    responseTime < 500 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'database',
        status,
        details: {
          responseTime,
          connected: result.rowCount === 1,
          version: await this.getDatabaseVersion()
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('Database check failed', { error: error.message });
      return {
        name: 'database',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Check Redis health
  private async checkRedis(): Promise<ComponentCheck> {
    try {
      const startTime = Date.now();
      await redis.ping();
      const responseTime = Date.now() - startTime;

      const status = responseTime < 50 ? ComponentStatus.HEALTHY :
                    responseTime < 200 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'redis',
        status,
        details: {
          responseTime,
          connected: true,
          memory: await this.getRedisMemoryInfo()
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('Redis check failed', { error: error.message });
      return {
        name: 'redis',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Check file system
  private async checkFileSystem(): Promise<ComponentCheck> {
    try {
      const { stdout } = await execAsync('df -h /');
      const diskUsage = this.parseDiskUsage(stdout);

      const status = diskUsage.usage < 80 ? ComponentStatus.HEALTHY :
                    diskUsage.usage < 90 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'filesystem',
        status,
        details: {
          ...diskUsage,
          writable: await this.checkDirectoryWritable('/tmp')
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('File system check failed', { error: error.message });
      return {
        name: 'filesystem',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Check network
  private async checkNetwork(): Promise<ComponentCheck> {
    try {
      const { stdout } = await execAsync('netstat -an | grep ESTABLISHED | wc -l');
      const connections = parseInt(stdout.trim());

      const status = connections < 1000 ? ComponentStatus.HEALTHY :
                    connections < 5000 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'network',
        status,
        details: {
          connections,
          interfaces: os.networkInterfaces()
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('Network check failed', { error: error.message });
      return {
        name: 'network',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Check security
  private async checkSecurity(): Promise<ComponentCheck> {
    try {
      const securityIssues = await this.checkSecurityIssues();
      const status = securityIssues.length === 0 ? ComponentStatus.HEALTHY :
                    securityIssues.length < 3 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'security',
        status,
        details: {
          issues: securityIssues,
          sslExpiry: await this.checkSSLExpiry()
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('Security check failed', { error: error.message });
      return {
        name: 'security',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Check logs
  private async checkLogs(): Promise<ComponentCheck> {
    try {
      const logIssues = await this.checkLogIssues();
      const status = logIssues.length === 0 ? ComponentStatus.HEALTHY :
                    logIssues.length < 5 ? ComponentStatus.DEGRADED :
                    ComponentStatus.UNHEALTHY;

      return {
        name: 'logs',
        status,
        details: {
          issues: logIssues,
          size: await this.getLogSize()
        },
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error('Log check failed', { error: error.message });
      return {
        name: 'logs',
        status: ComponentStatus.UNHEALTHY,
        details: { error: error.message },
        lastChecked: new Date()
      };
    }
  }

  // Get system metrics
  private async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const cpuUsage = os.loadavg();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const { stdout: diskInfo } = await execAsync('df -B1 /');
      const diskUsage = this.parseDiskUsage(diskInfo);

      const { stdout: netInfo } = await execAsync('netstat -i');
      const networkStats = this.parseNetworkStats(netInfo);

      return {
        cpu: {
          usage: cpuUsage[0],
          load: cpuUsage,
          cores: os.cpus().length
        },
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          usage: (usedMem / totalMem) * 100
        },
        disk: {
          total: diskUsage.total,
          used: diskUsage.used,
          free: diskUsage.free,
          usage: diskUsage.usage
        },
        network: {
          connections: networkStats.connections,
          bytesIn: networkStats.bytesIn,
          bytesOut: networkStats.bytesOut
        }
      };
    } catch (error) {
      logger.error('Failed to get system metrics', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  private async getDatabaseVersion(): Promise<string> {
    const result = await this.pool.query('SELECT version()');
    return result.rows[0].version;
  }

  private async getRedisMemoryInfo(): Promise<any> {
    const info = await redis.info('memory');
    return this.parseRedisInfo(info);
  }

  private parseDiskUsage(output: string): any {
    const lines = output.trim().split('\n');
    const values = lines[1].split(/\s+/);
    const total = parseInt(values[1]);
    const used = parseInt(values[2]);
    const free = parseInt(values[3]);
    const usage = (used / total) * 100;

    return { total, used, free, usage };
  }

  private async checkDirectoryWritable(path: string): Promise<boolean> {
    try {
      const testFile = join(path, `.test-${Date.now()}`);
      await writeFile(testFile, 'test');
      await unlink(testFile);
      return true;
    } catch {
      return false;
    }
  }

  private async checkSecurityIssues(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Check SSL certificate expiry
      const sslExpiry = await this.checkSSLExpiry();
      if (sslExpiry < 30) {
        issues.push(`SSL certificate expires in ${sslExpiry} days`);
      }

      // Check for open ports
      const { stdout } = await execAsync('netstat -tuln');
      if (stdout.includes(':22')) {
        issues.push('SSH port is open');
      }

      // Check file permissions
      const { stdout: permCheck } = await execAsync('find /var/log -type f -perm -o+w');
      if (permCheck.trim()) {
        issues.push('Some log files are world-writable');
      }

      return issues;
    } catch (error) {
      logger.error('Failed to check security issues', { error: error.message });
      return ['Failed to complete security checks'];
    }
  }

  private async checkSSLExpiry(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `openssl x509 -enddate -noout -in ${config.SSL_CERT_PATH}`
      );
      const expiryDate = new Date(stdout.split('=')[1]);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry;
    } catch {
      return 0;
    }
  }

  private async checkLogIssues(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Check for error patterns in logs
      const { stdout } = await execAsync(
        'grep -i "error\\|exception\\|fail" /var/log/app.log | tail -n 100'
      );
      const errorLines = stdout.split('\n').filter(Boolean);

      if (errorLines.length > 0) {
        issues.push(`Found ${errorLines.length} error messages in logs`);
      }

      // Check log rotation
      const { stdout: logRotate } = await execAsync('ls -l /var/log/app.log*');
      if (logRotate.split('\n').length > 5) {
        issues.push('Log rotation may need attention');
      }

      return issues;
    } catch (error) {
      logger.error('Failed to check log issues', { error: error.message });
      return ['Failed to complete log checks'];
    }
  }

  private async getLogSize(): Promise<number> {
    try {
      const { stdout } = await execAsync('du -b /var/log/app.log');
      return parseInt(stdout.split('\t')[0]);
    } catch {
      return 0;
    }
  }

  private parseNetworkStats(output: string): any {
    const lines = output.trim().split('\n');
    const stats = {
      connections: 0,
      bytesIn: 0,
      bytesOut: 0
    };

    for (const line of lines) {
      if (line.includes('ESTABLISHED')) {
        stats.connections++;
      }
      if (line.includes('RX bytes')) {
        const match = line.match(/RX bytes:(\d+).*TX bytes:(\d+)/);
        if (match) {
          stats.bytesIn = parseInt(match[1]);
          stats.bytesOut = parseInt(match[2]);
        }
      }
    }

    return stats;
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\n');
    const memory: any = {};

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        memory.used = parseInt(line.split(':')[1]);
      }
      if (line.startsWith('used_memory_peak:')) {
        memory.peak = parseInt(line.split(':')[1]);
      }
      if (line.startsWith('used_memory_lua:')) {
        memory.lua = parseInt(line.split(':')[1]);
      }
    }

    return memory;
  }

  // Log diagnostics results
  private async logDiagnosticsResults(diagnostics: any): Promise<void> {
    try {
      // Log to audit trail
      await this.auditService.logEvent({
        eventType: AuditEventType.SYSTEM_DIAGNOSTICS,
        userId: 'system',
        details: diagnostics,
        severity: this.getOverallSeverity(diagnostics.components)
      });

      // Notify if any component is unhealthy
      const unhealthyComponents = diagnostics.components.filter(
        c => c.status === ComponentStatus.UNHEALTHY
      );

      if (unhealthyComponents.length > 0) {
        await this.notificationService.sendNotification('admin', {
          type: 'system_alert',
          title: 'System Health Alert',
          message: `Unhealthy components detected: ${unhealthyComponents.map(c => c.name).join(', ')}`,
          data: {
            components: unhealthyComponents,
            metrics: diagnostics.metrics
          }
        });
      }
    } catch (error) {
      logger.error('Failed to log diagnostics results', { error: error.message });
    }
  }

  // Get overall severity from component statuses
  private getOverallSeverity(components: ComponentCheck[]): string {
    if (components.some(c => c.status === ComponentStatus.UNHEALTHY)) {
      return 'high';
    }
    if (components.some(c => c.status === ComponentStatus.DEGRADED)) {
      return 'medium';
    }
    return 'low';
  }
} 