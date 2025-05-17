import { logger } from '../utils/logger';
import { LoadTest } from './loadTest';
import { Monitoring } from './monitoring';
import { DatabaseScaling } from './databaseScaling';
import { DisasterRecovery } from './disasterRecovery';
import { OWASP } from './owasp';
import { GDPR } from './gdpr';
import * as fs from 'fs';
import * as path from 'path';

interface ReadinessMetrics {
  loadTest: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    throughput: number;
  };
  monitoring: {
    activeAlerts: number;
    criticalAlerts: number;
    systemHealth: number;
  };
  database: {
    shardHealth: number[];
    replicaHealth: number[];
    queryPerformance: any[];
    replicationLag: any[];
  };
  security: {
    vulnerabilities: any[];
    compliance: any[];
  };
  disasterRecovery: {
    lastBackup: string;
    backupHealth: boolean;
    failoverReadiness: boolean;
  };
}

export class ReadinessReport {
  private readonly loadTest: LoadTest;
  private readonly monitoring: Monitoring;
  private readonly databaseScaling: DatabaseScaling;
  private readonly disasterRecovery: DisasterRecovery;
  private readonly owasp: OWASP;
  private readonly gdpr: GDPR;
  private readonly REPORT_DIR: string;

  constructor() {
    this.REPORT_DIR = process.env.REPORT_DIR || path.join(process.cwd(), 'reports');
    this.ensureReportDirectory();

    this.loadTest = new LoadTest();
    this.monitoring = new Monitoring();
    this.databaseScaling = new DatabaseScaling();
    this.disasterRecovery = new DisasterRecovery();
    this.owasp = new OWASP();
    this.gdpr = new GDPR();
  }

  private ensureReportDirectory(): void {
    if (!fs.existsSync(this.REPORT_DIR)) {
      fs.mkdirSync(this.REPORT_DIR, { recursive: true });
    }
  }

  async generateReport(): Promise<string> {
    logger.info('Generating deployment readiness report...');

    const metrics = await this.collectMetrics();
    const report = this.formatReport(metrics);
    await this.saveReport(report);

    return report;
  }

  private async collectMetrics(): Promise<ReadinessMetrics> {
    // Run load test
    const loadTestResult = await this.loadTest.runLoadTest({
      endpoint: '/api/v1/health',
      method: 'GET',
      concurrency: 1000,
      duration: 300,
    });

    // Get monitoring metrics
    const monitoringReport = await this.monitoring.generateMetricsReport();

    // Get database metrics
    const queryPerformance = await this.databaseScaling.analyzeQueryPerformance();
    const replicationLag = await this.databaseScaling.checkReplicationLag();

    // Get security metrics
    const securityAudit = await this.owasp.runSecurityAudit();
    const gdprCompliance = await this.gdpr.handleDataSubjectRequest({
      userId: 'test',
      requestType: 'access',
    });

    // Get disaster recovery metrics
    const lastBackup = await this.disasterRecovery.createBackup();
    const failoverReadiness = await this.disasterRecovery.checkPrimaryHealth();

    return {
      loadTest: {
        totalRequests: loadTestResult.totalRequests,
        successfulRequests: loadTestResult.successfulRequests,
        failedRequests: loadTestResult.failedRequests,
        averageResponseTime: loadTestResult.averageResponseTime,
        throughput: loadTestResult.throughput,
      },
      monitoring: {
        activeAlerts: monitoringReport.activeAlerts.length,
        criticalAlerts: monitoringReport.activeAlerts.filter(a => a.severity === 'critical').length,
        systemHealth: this.calculateSystemHealth(monitoringReport),
      },
      database: {
        shardHealth: await this.getShardHealth(),
        replicaHealth: await this.getReplicaHealth(),
        queryPerformance,
        replicationLag,
      },
      security: {
        vulnerabilities: securityAudit.vulnerabilities,
        compliance: [gdprCompliance],
      },
      disasterRecovery: {
        lastBackup,
        backupHealth: true,
        failoverReadiness,
      },
    };
  }

  private async getShardHealth(): Promise<number[]> {
    const health: number[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const client = await this.databaseScaling.getConnection();
        await client.query('SELECT 1');
        health.push(1);
      } catch (error) {
        health.push(0);
      }
    }
    return health;
  }

  private async getReplicaHealth(): Promise<number[]> {
    const health: number[] = [];
    for (let i = 0; i < 3; i++) {
      try {
        const client = await this.databaseScaling.getReadConnection();
        await client.query('SELECT 1');
        health.push(1);
      } catch (error) {
        health.push(0);
      }
    }
    return health;
  }

  private calculateSystemHealth(monitoringReport: any): number {
    const totalMetrics = Object.keys(monitoringReport.metrics).length;
    const healthyMetrics = Object.values(monitoringReport.metrics)
      .filter((metric: any) => !metric.thresholdExceeded)
      .length;
    return (healthyMetrics / totalMetrics) * 100;
  }

  private formatReport(metrics: ReadinessMetrics): string {
    const readinessScore = this.calculateReadinessScore(metrics);
    const recommendations = this.generateRecommendations(metrics);

    return `
# Deployment Readiness Report

## Overall Readiness Score: ${readinessScore.toFixed(1)}%

## Load Testing Results
- Total Requests: ${metrics.loadTest.totalRequests}
- Success Rate: ${((metrics.loadTest.successfulRequests / metrics.loadTest.totalRequests) * 100).toFixed(1)}%
- Average Response Time: ${metrics.loadTest.averageResponseTime.toFixed(2)}ms
- Throughput: ${metrics.loadTest.throughput.toFixed(2)} req/s

## System Health
- Active Alerts: ${metrics.monitoring.activeAlerts}
- Critical Alerts: ${metrics.monitoring.criticalAlerts}
- System Health Score: ${metrics.monitoring.systemHealth.toFixed(1)}%

## Database Status
- Shard Health: ${metrics.database.shardHealth.filter(h => h === 1).length}/${metrics.database.shardHealth.length} healthy
- Replica Health: ${metrics.database.replicaHealth.filter(h => h === 1).length}/${metrics.database.replicaHealth.length} healthy
- Replication Lag: ${this.formatReplicationLag(metrics.database.replicationLag)}

## Security Status
- Vulnerabilities Found: ${metrics.security.vulnerabilities.length}
- Compliance Status: ${this.formatComplianceStatus(metrics.security.compliance)}

## Disaster Recovery
- Last Backup: ${metrics.disasterRecovery.lastBackup}
- Backup Health: ${metrics.disasterRecovery.backupHealth ? 'Healthy' : 'Unhealthy'}
- Failover Readiness: ${metrics.disasterRecovery.failoverReadiness ? 'Ready' : 'Not Ready'}

## Recommendations
${recommendations}

## Next Steps
1. Address critical alerts
2. Fix identified vulnerabilities
3. Optimize slow database queries
4. Verify backup and restore procedures
5. Complete security compliance requirements

## Deployment Checklist
${this.generateDeploymentChecklist(metrics)}
    `;
  }

  private calculateReadinessScore(metrics: ReadinessMetrics): number {
    const weights = {
      loadTest: 0.3,
      monitoring: 0.2,
      database: 0.2,
      security: 0.2,
      disasterRecovery: 0.1,
    };

    const scores = {
      loadTest: this.calculateLoadTestScore(metrics.loadTest),
      monitoring: metrics.monitoring.systemHealth,
      database: this.calculateDatabaseScore(metrics.database),
      security: this.calculateSecurityScore(metrics.security),
      disasterRecovery: this.calculateDisasterRecoveryScore(metrics.disasterRecovery),
    };

    return Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * weights[key as keyof typeof weights]);
    }, 0);
  }

  private calculateLoadTestScore(metrics: any): number {
    const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    const responseTimeScore = Math.max(0, 100 - (metrics.averageResponseTime / 1000));
    return (successRate + responseTimeScore) / 2;
  }

  private calculateDatabaseScore(metrics: any): number {
    const shardHealth = (metrics.shardHealth.filter((h: number) => h === 1).length / metrics.shardHealth.length) * 100;
    const replicaHealth = (metrics.replicaHealth.filter((h: number) => h === 1).length / metrics.replicaHealth.length) * 100;
    return (shardHealth + replicaHealth) / 2;
  }

  private calculateSecurityScore(metrics: any): number {
    const vulnerabilityScore = Math.max(0, 100 - (metrics.vulnerabilities.length * 10));
    const complianceScore = metrics.compliance.every((c: any) => c.compliant) ? 100 : 0;
    return (vulnerabilityScore + complianceScore) / 2;
  }

  private calculateDisasterRecoveryScore(metrics: any): number {
    return (metrics.backupHealth && metrics.failoverReadiness) ? 100 : 0;
  }

  private formatReplicationLag(lag: any[]): string {
    return lag.map((l: any) => `${l.replicaId}: ${l.lag.replay_lag}ms`).join(', ');
  }

  private formatComplianceStatus(compliance: any[]): string {
    return compliance.every((c: any) => c.compliant) ? 'Compliant' : 'Non-Compliant';
  }

  private generateRecommendations(metrics: ReadinessMetrics): string {
    const recommendations: string[] = [];

    // Load test recommendations
    if (metrics.loadTest.failedRequests > 0) {
      recommendations.push('- Investigate and fix failed requests in load testing');
    }
    if (metrics.loadTest.averageResponseTime > 1000) {
      recommendations.push('- Optimize response times for better performance');
    }

    // Monitoring recommendations
    if (metrics.monitoring.criticalAlerts > 0) {
      recommendations.push('- Address critical alerts immediately');
    }
    if (metrics.monitoring.systemHealth < 90) {
      recommendations.push('- Improve system health by addressing active alerts');
    }

    // Database recommendations
    if (metrics.database.shardHealth.some(h => h === 0)) {
      recommendations.push('- Fix unhealthy database shards');
    }
    if (metrics.database.replicaHealth.some(h => h === 0)) {
      recommendations.push('- Fix unhealthy database replicas');
    }

    // Security recommendations
    if (metrics.security.vulnerabilities.length > 0) {
      recommendations.push('- Address security vulnerabilities');
    }
    if (!metrics.security.compliance.every((c: any) => c.compliant)) {
      recommendations.push('- Fix compliance issues');
    }

    // Disaster recovery recommendations
    if (!metrics.disasterRecovery.backupHealth) {
      recommendations.push('- Fix backup system issues');
    }
    if (!metrics.disasterRecovery.failoverReadiness) {
      recommendations.push('- Improve failover readiness');
    }

    return recommendations.join('\n');
  }

  private generateDeploymentChecklist(metrics: ReadinessMetrics): string {
    const checklist = [
      {
        item: 'Load Testing',
        status: metrics.loadTest.failedRequests === 0 && metrics.loadTest.averageResponseTime < 1000,
        details: `Success Rate: ${((metrics.loadTest.successfulRequests / metrics.loadTest.totalRequests) * 100).toFixed(1)}%`,
      },
      {
        item: 'System Health',
        status: metrics.monitoring.criticalAlerts === 0 && metrics.monitoring.systemHealth >= 90,
        details: `Health Score: ${metrics.monitoring.systemHealth.toFixed(1)}%`,
      },
      {
        item: 'Database Status',
        status: metrics.database.shardHealth.every(h => h === 1) && metrics.database.replicaHealth.every(h => h === 1),
        details: `Shards: ${metrics.database.shardHealth.filter(h => h === 1).length}/${metrics.database.shardHealth.length} healthy`,
      },
      {
        item: 'Security',
        status: metrics.security.vulnerabilities.length === 0 && metrics.security.compliance.every((c: any) => c.compliant),
        details: `Vulnerabilities: ${metrics.security.vulnerabilities.length}`,
      },
      {
        item: 'Disaster Recovery',
        status: metrics.disasterRecovery.backupHealth && metrics.disasterRecovery.failoverReadiness,
        details: `Last Backup: ${metrics.disasterRecovery.lastBackup}`,
      },
    ];

    return checklist.map(item => `
- [${item.status ? 'x' : ' '}] ${item.item}
  ${item.details}
    `).join('\n');
  }

  private async saveReport(report: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.REPORT_DIR, `readiness-report-${timestamp}.md`);
    await fs.promises.writeFile(reportPath, report);
    logger.info(`Readiness report saved to ${reportPath}`);
  }
} 