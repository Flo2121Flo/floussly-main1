import { logger } from '../utils/logger';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { config } from '../config/config';

interface ShardConfig {
  id: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface ReplicaConfig {
  id: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  shardId: number;
}

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
}

interface QueryPerformance {
  shardId: number;
  slowQueries: Array<{
    query: string;
    avgTime: number;
    count: number;
  }>;
}

interface ReplicationLag {
  replicaId: number;
  shardId: number;
  lag: number;
}

export class DatabaseScaling {
  private readonly shards: Map<number, Pool>;
  private readonly replicas: Map<number, Pool>;
  private readonly cache: Redis;

  constructor(
    shardConfigs: ShardConfig[],
    replicaConfigs: ReplicaConfig[],
    cacheConfig: CacheConfig
  ) {
    this.shards = new Map();
    this.replicas = new Map();
    this.cache = new Redis({
      host: cacheConfig.host,
      port: cacheConfig.port,
      password: cacheConfig.password,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true
    });

    this.initializeShards(shardConfigs);
    this.initializeReplicas(replicaConfigs);
  }

  private initializeShards(configs: ShardConfig[]): void {
    configs.forEach(config => {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        max: 20,
        idleTimeoutMillis: 30000
      });

      this.shards.set(config.id, pool);
    });
  }

  private initializeReplicas(configs: ReplicaConfig[]): void {
    configs.forEach(config => {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        max: 20,
        idleTimeoutMillis: 30000
      });

      this.replicas.set(config.id, pool);
    });
  }

  public getShardConnection(userId: string): Pool {
    const shardId = this.getShardId(userId);
    const shard = this.shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }
    return shard;
  }

  public getReplicaConnection(userId: string): Pool {
    const shardId = this.getShardId(userId);
    const replica = Array.from(this.replicas.values()).find(r => r['shardId'] === shardId);
    if (!replica) {
      throw new Error(`Replica for shard ${shardId} not found`);
    }
    return replica;
  }

  private getShardId(userId: string): number {
    // Simple hash-based sharding
    const hash = this.hashString(userId);
    return hash % this.shards.size;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  public async cacheData(key: string, data: any, ttl: number): Promise<void> {
    await this.cache.set(key, JSON.stringify(data), 'EX', ttl);
  }

  public async getCachedData<T>(key: string): Promise<T | null> {
    const data = await this.cache.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async invalidateCache(key: string): Promise<void> {
    await this.cache.del(key);
  }

  public async createIndexes(): Promise<void> {
    for (const [shardId, shard] of this.shards) {
      try {
        await shard.query(`
          CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
          CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
          CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
        `);
        logger.info(`Created indexes on shard ${shardId}`);
      } catch (error: any) {
        logger.error(`Failed to create indexes on shard ${shardId}`, { error: error.message });
      }
    }
  }

  public async analyzeQueryPerformance(): Promise<QueryPerformance[]> {
    const results: QueryPerformance[] = [];

    for (const [shardId, shard] of this.shards) {
      try {
        const { rows } = await shard.query(`
          SELECT query, avg_time, calls
          FROM pg_stat_statements
          WHERE avg_time > 1000
          ORDER BY avg_time DESC
          LIMIT 10
        `);

        results.push({
          shardId,
          slowQueries: rows.map(row => ({
            query: row.query,
            avgTime: parseFloat(row.avg_time),
            count: parseInt(row.calls)
          }))
        });
      } catch (error: any) {
        logger.error(`Failed to analyze query performance on shard ${shardId}`, { error: error.message });
      }
    }

    return results;
  }

  public async checkReplicationLag(): Promise<ReplicationLag[]> {
    const results: ReplicationLag[] = [];

    for (const [replicaId, replica] of this.replicas) {
      try {
        const { rows } = await replica.query(`
          SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) as lag
          FROM pg_stat_replication
        `);

        results.push({
          replicaId,
          shardId: replica['shardId'],
          lag: parseInt(rows[0].lag)
        });
      } catch (error: any) {
        logger.error(`Failed to check replication lag on replica ${replicaId}`, { error: error.message });
      }
    }

    return results;
  }

  public async generateScalingReport(): Promise<string> {
    const queryPerformance = await this.analyzeQueryPerformance();
    const replicationLag = await this.checkReplicationLag();

    const report = `
Database Scaling Report
=====================

Query Performance
----------------
${queryPerformance.map(shard => `
Shard ${shard.shardId}:
${shard.slowQueries.map(query => `
  Query: ${query.query}
  Average Time: ${query.avgTime}ms
  Execution Count: ${query.count}
`).join('\n')}
`).join('\n')}

Replication Lag
--------------
${replicationLag.map(replica => `
Replica ${replica.replicaId} (Shard ${replica.shardId}):
  Lag: ${replica.lag} bytes
`).join('\n')}

Recommendations
--------------
${this.generateRecommendations(queryPerformance, replicationLag)}
    `;

    return report;
  }

  private generateRecommendations(
    queryPerformance: QueryPerformance[],
    replicationLag: ReplicationLag[]
  ): string {
    const recommendations: string[] = [];

    // Analyze slow queries
    queryPerformance.forEach(shard => {
      shard.slowQueries.forEach(query => {
        if (query.avgTime > 5000) {
          recommendations.push(`Consider optimizing query on shard ${shard.shardId}: ${query.query}`);
        }
      });
    });

    // Analyze replication lag
    replicationLag.forEach(replica => {
      if (replica.lag > 1000000) { // 1MB lag
        recommendations.push(`High replication lag on replica ${replica.replicaId} (${replica.lag} bytes)`);
      }
    });

    return recommendations.join('\n');
  }
} 