import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OWASP } from './owasp';
import { GDPR } from './gdpr';
import { CNDP } from './cndp';
import { logger } from '../utils/logger';

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private owasp: OWASP;
  private gdpr: GDPR;
  private cndp: CNDP;

  private constructor() {
    this.owasp = new OWASP();
    this.gdpr = new GDPR();
    this.cndp = new CNDP();
  }

  static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  // Security middleware
  getSecurityMiddleware() {
    return [
      helmet(),
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
      }),
      this.validateSecurityHeaders.bind(this),
      this.validateTokenSecurity.bind(this)
    ];
  }

  // Security header validation
  private validateSecurityHeaders(req: Request, res: Response, next: NextFunction) {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security'
    ];

    const missingHeaders = requiredHeaders.filter(
      header => !req.headers[header.toLowerCase()]
    );

    if (missingHeaders.length > 0) {
      logger.warn(`Missing security headers: ${missingHeaders.join(', ')}`);
      return res.status(403).json({
        error: 'Security headers missing',
        details: missingHeaders
      });
    }

    next();
  }

  // Token security validation
  private validateTokenSecurity(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Validate token format and expiration
      const decoded = this.owasp.validateToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Check token refresh requirements
      if (this.owasp.shouldRefreshToken(decoded)) {
        res.setHeader('X-Token-Refresh', 'true');
      }

      next();
    } catch (error) {
      logger.error('Token validation error:', error);
      return res.status(401).json({ error: 'Token validation failed' });
    }
  }

  // Run full security audit
  async runSecurityAudit(): Promise<SecurityAuditReport> {
    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      owasp: await this.owasp.runAudit(),
      gdpr: await this.gdpr.validateCompliance(),
      cndp: await this.cndp.validateCompliance(),
      recommendations: []
    };

    // Generate recommendations
    if (report.owasp.vulnerabilities.length > 0) {
      report.recommendations.push({
        category: 'OWASP',
        items: report.owasp.vulnerabilities.map(v => v.recommendation)
      });
    }

    if (!report.gdpr.compliant) {
      report.recommendations.push({
        category: 'GDPR',
        items: report.gdpr.missingRequirements
      });
    }

    if (!report.cndp.compliant) {
      report.recommendations.push({
        category: 'CNDP',
        items: report.cndp.missingRequirements
      });
    }

    return report;
  }

  // Export compliance documentation
  async generateComplianceDocs(): Promise<ComplianceDocs> {
    return {
      gdpr: await this.gdpr.generateDocumentation(),
      cndp: await this.cndp.generateDocumentation(),
      dataRetention: await this.generateDataRetentionPolicy(),
      securityPolicy: await this.generateSecurityPolicy()
    };
  }
}

interface SecurityAuditReport {
  timestamp: string;
  owasp: OWASPAuditResult;
  gdpr: GDPRComplianceResult;
  cndp: CNDPComplianceResult;
  recommendations: {
    category: string;
    items: string[];
  }[];
}

interface ComplianceDocs {
  gdpr: any;
  cndp: any;
  dataRetention: any;
  securityPolicy: any;
}

export const securityAudit = SecurityAuditService.getInstance(); 