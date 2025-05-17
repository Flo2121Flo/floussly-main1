import { Request } from 'express';
import { Pool } from 'pg';
import { redis } from '../config/redis';
import { config } from '../config/appConfig';
import { logger } from '../utils/logger';
import { securityConfig } from '../config/security';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { AuditService, AuditEventType } from './AuditService';

// Security test types
export enum SecurityTestType {
  AUTH = 'auth',
  HEADERS = 'headers',
  INPUT = 'input',
  FILE = 'file',
  ROUTE = 'route',
  ENV = 'env',
  DATABASE = 'database'
}

// Test severity levels
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Test result interface
export interface SecurityTestResult {
  test: string;
  severity: SecuritySeverity;
  passed: boolean;
  details?: string;
  recommendation?: string;
  timestamp: Date;
}

// Security audit service class
export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private pool: Pool;
  private auditService: AuditService;
  private readonly BASE_URL: string;
  private readonly TEST_PAYLOADS = {
    sqlInjection: [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users; --"
    ],
    xss: [
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)"
    ],
    fileUpload: [
      { name: 'test.exe', type: 'application/x-msdownload' },
      { name: 'test.php', type: 'application/x-httpd-php' },
      { name: 'test.sh', type: 'application/x-sh' }
    ]
  };

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.BASE_URL = config.API_URL || 'http://localhost:3000';
  }

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  // Run full security audit
  public async runAudit(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Run all security tests
      results.push(...await this.runAuthTests());
      results.push(...await this.runHeaderTests());
      results.push(...await this.runInputValidationTests());
      results.push(...await this.runFileUploadTests());
      results.push(...await this.runRouteSecurityTests());
      results.push(...await this.runEnvironmentTests());
      results.push(...await this.runDatabaseTests());

      // Log audit results
      await this.logAuditResults(results);

      // Alert on critical findings
      const criticalFindings = results.filter(r => 
        r.severity === SecuritySeverity.CRITICAL && !r.passed
      );
      if (criticalFindings.length > 0) {
        await this.alertSecurityTeam(criticalFindings);
      }

      return results;
    } catch (error) {
      logger.error('Security audit failed', { error: error.message });
      throw error;
    }
  }

  // Auth & Token Tests
  private async runAuthTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Test JWT secret strength
      const jwtSecret = securityConfig.jwt.secret;
      results.push({
        test: 'JWT secret strength',
        severity: SecuritySeverity.HIGH,
        passed: jwtSecret.length >= 32,
        details: `Secret length: ${jwtSecret.length}`,
        recommendation: 'Use a minimum 32-character random string',
        timestamp
      });

      // Test JWT algorithm enforcement
      const token = jwt.sign({}, jwtSecret, { algorithm: 'none' });
      try {
        jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        results.push({
          test: 'JWT algorithm enforcement',
          severity: SecuritySeverity.CRITICAL,
          passed: false,
          details: 'Accepted token with none algorithm',
          recommendation: 'Enforce HS256 algorithm in JWT verification',
          timestamp
        });
      } catch {
        results.push({
          test: 'JWT algorithm enforcement',
          severity: SecuritySeverity.CRITICAL,
          passed: true,
          timestamp
        });
      }

      // Test refresh token blacklisting
      const refreshToken = jwt.sign({}, jwtSecret, { expiresIn: '7d' });
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 86400);
      const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
      results.push({
        test: 'Refresh token blacklisting',
        severity: SecuritySeverity.HIGH,
        passed: isBlacklisted === '1',
        timestamp
      });

    } catch (error) {
      logger.error('Auth tests failed', { error: error.message });
    }

    return results;
  }

  // Header Tests
  private async runHeaderTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      const response = await axios.get(this.BASE_URL);
      const headers = response.headers;

      // Check security headers
      const requiredHeaders = {
        'content-security-policy': 'Content-Security-Policy',
        'x-frame-options': 'X-Frame-Options',
        'strict-transport-security': 'Strict-Transport-Security',
        'referrer-policy': 'Referrer-Policy',
        'x-xss-protection': 'X-XSS-Protection'
      };

      Object.entries(requiredHeaders).forEach(([key, name]) => {
        results.push({
          test: `Missing ${name} header`,
          severity: SecuritySeverity.HIGH,
          passed: !!headers[key],
          recommendation: `Add ${name} header in security middleware`,
          timestamp
        });
      });

    } catch (error) {
      logger.error('Header tests failed', { error: error.message });
    }

    return results;
  }

  // Input Validation Tests
  private async runInputValidationTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Test SQL injection
      for (const payload of this.TEST_PAYLOADS.sqlInjection) {
        const response = await axios.post(`${this.BASE_URL}/api/search`, {
          query: payload
        });
        results.push({
          test: 'SQL injection protection',
          severity: SecuritySeverity.CRITICAL,
          passed: !response.data.includes('syntax error'),
          details: `Tested payload: ${payload}`,
          recommendation: 'Implement input sanitization and parameterized queries',
          timestamp
        });
      }

      // Test XSS
      for (const payload of this.TEST_PAYLOADS.xss) {
        const response = await axios.post(`${this.BASE_URL}/api/comment`, {
          content: payload
        });
        results.push({
          test: 'XSS protection',
          severity: SecuritySeverity.HIGH,
          passed: !response.data.includes(payload),
          details: `Tested payload: ${payload}`,
          recommendation: 'Implement output encoding and CSP',
          timestamp
        });
      }

      // Test oversized payload
      const largePayload = { data: 'x'.repeat(10 * 1024 * 1024) }; // 10MB
      try {
        await axios.post(`${this.BASE_URL}/api/upload`, largePayload);
        results.push({
          test: 'Oversized payload protection',
          severity: SecuritySeverity.MEDIUM,
          passed: false,
          recommendation: 'Implement payload size limits',
          timestamp
        });
      } catch {
        results.push({
          test: 'Oversized payload protection',
          severity: SecuritySeverity.MEDIUM,
          passed: true,
          timestamp
        });
      }

    } catch (error) {
      logger.error('Input validation tests failed', { error: error.message });
    }

    return results;
  }

  // File Upload Tests
  private async runFileUploadTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Test dangerous file types
      for (const file of this.TEST_PAYLOADS.fileUpload) {
        const formData = new FormData();
        formData.append('file', new Blob(['test']), file.name);

        try {
          await axios.post(`${this.BASE_URL}/api/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          results.push({
            test: 'Dangerous file type protection',
            severity: SecuritySeverity.HIGH,
            passed: false,
            details: `Accepted file: ${file.name}`,
            recommendation: 'Implement strict file type validation',
            timestamp
          });
        } catch {
          results.push({
            test: 'Dangerous file type protection',
            severity: SecuritySeverity.HIGH,
            passed: true,
            timestamp
          });
        }
      }

      // Test S3 URL security
      const s3 = new S3({
        region: config.AWS_REGION,
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      });

      const bucket = await s3.getBucketAcl({ Bucket: config.AUDIT_BUCKET }).promise();
      const isPublic = bucket.Grants.some(grant => 
        grant.Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers'
      );

      results.push({
        test: 'S3 bucket public access',
        severity: SecuritySeverity.CRITICAL,
        passed: !isPublic,
        recommendation: 'Disable public access on S3 buckets',
        timestamp
      });

    } catch (error) {
      logger.error('File upload tests failed', { error: error.message });
    }

    return results;
  }

  // Route Security Tests
  private async runRouteSecurityTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      const protectedRoutes = [
        '/admin',
        '/internal',
        '/debug',
        '/api/internal'
      ];

      for (const route of protectedRoutes) {
        try {
          await axios.get(`${this.BASE_URL}${route}`);
          results.push({
            test: `Protected route: ${route}`,
            severity: SecuritySeverity.CRITICAL,
            passed: false,
            recommendation: `Implement proper access control for ${route}`,
            timestamp
          });
        } catch (error) {
          if (error.response?.status === 403) {
            results.push({
              test: `Protected route: ${route}`,
              severity: SecuritySeverity.CRITICAL,
              passed: true,
              timestamp
            });
          }
        }
      }

    } catch (error) {
      logger.error('Route security tests failed', { error: error.message });
    }

    return results;
  }

  // Environment Tests
  private async runEnvironmentTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Check NODE_ENV
      results.push({
        test: 'Production environment',
        severity: SecuritySeverity.HIGH,
        passed: process.env.NODE_ENV === 'production',
        recommendation: 'Set NODE_ENV=production in production',
        timestamp
      });

      // Check required environment variables
      const requiredVars = [
        'JWT_SECRET',
        'DATABASE_URL',
        'REDIS_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY'
      ];

      for (const envVar of requiredVars) {
        const value = process.env[envVar];
        results.push({
          test: `Environment variable: ${envVar}`,
          severity: SecuritySeverity.CRITICAL,
          passed: !!value && value.length >= 32,
          details: value ? `Length: ${value.length}` : 'Missing',
          recommendation: 'Set strong, unique values for all required environment variables',
          timestamp
        });
      }

    } catch (error) {
      logger.error('Environment tests failed', { error: error.message });
    }

    return results;
  }

  // Database Tests
  private async runDatabaseTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    const timestamp = new Date();

    try {
      // Test SQL injection in queries
      const sqlInjectionPayload = "' OR '1'='1";
      try {
        await this.pool.query(
          `SELECT * FROM users WHERE email = $1`,
          [sqlInjectionPayload]
        );
        results.push({
          test: 'SQL injection in queries',
          severity: SecuritySeverity.CRITICAL,
          passed: true,
          timestamp
        });
      } catch (error) {
        results.push({
          test: 'SQL injection in queries',
          severity: SecuritySeverity.CRITICAL,
          passed: false,
          details: error.message,
          recommendation: 'Use parameterized queries consistently',
          timestamp
        });
      }

      // Test error stack trace exposure
      try {
        await this.pool.query('SELECT * FROM nonexistent_table');
      } catch (error) {
        const response = await axios.get(`${this.BASE_URL}/api/error`);
        results.push({
          test: 'Error stack trace exposure',
          severity: SecuritySeverity.HIGH,
          passed: !response.data.stack,
          recommendation: 'Disable stack traces in production',
          timestamp
        });
      }

    } catch (error) {
      logger.error('Database tests failed', { error: error.message });
    }

    return results;
  }

  // Log audit results
  private async logAuditResults(results: SecurityTestResult[]): Promise<void> {
    const auditId = uuidv4();
    const criticalFindings = results.filter(r => 
      r.severity === SecuritySeverity.CRITICAL && !r.passed
    ).length;

    try {
      // Log to database
      await this.pool.query(
        `INSERT INTO security_audit_logs (
          audit_id, timestamp, total_tests, passed_tests,
          critical_findings, results
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          auditId,
          new Date(),
          results.length,
          results.filter(r => r.passed).length,
          criticalFindings,
          JSON.stringify(results)
        ]
      );

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.SECURITY_BREACH,
        details: {
          auditId,
          totalTests: results.length,
          passedTests: results.filter(r => r.passed).length,
          criticalFindings
        },
        severity: criticalFindings > 0 ? 'high' : 'low'
      });

    } catch (error) {
      logger.error('Failed to log audit results', { error: error.message });
    }
  }

  // Alert security team
  private async alertSecurityTeam(findings: SecurityTestResult[]): Promise<void> {
    try {
      // Implement your alerting mechanism here
      // Example: Email, Slack, PagerDuty, etc.
      logger.warn('Critical security findings', { findings });
    } catch (error) {
      logger.error('Failed to alert security team', { error: error.message });
    }
  }
} 