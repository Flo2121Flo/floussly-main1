import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { sanitize } from 'mongo-sanitize';
import { logger } from '../utils/logger';
import axios from 'axios';
import { config } from '../config/config';

export class OWASP {
  private readonly SALT_ROUNDS = 12;
  private readonly TOKEN_EXPIRY = '1h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = config.OWASP_API_URL || 'https://api.owasp.org/v1';
    this.apiKey = config.OWASP_API_KEY || '';
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.SALT_ROUNDS);
  }

  validateToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      logger.error('Token validation error:', error);
      return null;
    }
  }

  shouldRefreshToken(decoded: any): boolean {
    const expiry = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    
    // Refresh if less than 15 minutes until expiry
    return timeUntilExpiry < 15 * 60 * 1000;
  }

  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: this.TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  sanitizeInput(input: any): any {
    return sanitize(input);
  }

  async runSecurityAudit(targetUrl: string): Promise<SecurityAuditResult> {
    try {
      logger.info('Starting OWASP security audit', { targetUrl });

      const vulnerabilities: SecurityVulnerability[] = [];
      
      // Check for common vulnerabilities
      await this.checkXSS(targetUrl, vulnerabilities);
      await this.checkSQLInjection(targetUrl, vulnerabilities);
      await this.checkCSRF(targetUrl, vulnerabilities);
      await this.checkInsecureDirectObjectReferences(targetUrl, vulnerabilities);
      await this.checkSecurityMisconfiguration(targetUrl, vulnerabilities);

      const summary = this.generateSummary(vulnerabilities);

      const result: SecurityAuditResult = {
        timestamp: new Date(),
        vulnerabilities,
        summary
      };

      logger.info('Security audit completed', { 
        totalVulnerabilities: summary.totalVulnerabilities,
        criticalCount: summary.criticalCount
      });

      return result;
    } catch (error) {
      const err = error as Error;
      logger.error('Security audit failed', { error: err.message });
      throw new Error(`Security audit failed: ${err.message}`);
    }
  }

  private async checkXSS(targetUrl: string, vulnerabilities: SecurityVulnerability[]): Promise<void> {
    try {
      const response = await axios.get(targetUrl);
      const content = response.data;

      // Check for unescaped user input in HTML
      if (content.includes('<script>') || content.includes('javascript:')) {
        vulnerabilities.push({
          type: 'XSS',
          severity: 'HIGH',
          description: 'Potential Cross-Site Scripting vulnerability detected',
          location: targetUrl,
          recommendation: 'Implement proper input validation and output encoding'
        });
      }
    } catch (error) {
      logger.warn('XSS check failed', { error: (error as Error).message });
    }
  }

  private async checkSQLInjection(targetUrl: string, vulnerabilities: SecurityVulnerability[]): Promise<void> {
    try {
      const testPayloads = ["'", "1' OR '1'='1", "1; DROP TABLE users"];
      
      for (const payload of testPayloads) {
        const response = await axios.get(`${targetUrl}?id=${payload}`);
        if (response.data.includes('SQL syntax') || response.data.includes('ORA-')) {
          vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'CRITICAL',
            description: 'Potential SQL Injection vulnerability detected',
            location: targetUrl,
            recommendation: 'Use parameterized queries and input validation'
          });
          break;
        }
      }
    } catch (error) {
      logger.warn('SQL Injection check failed', { error: (error as Error).message });
    }
  }

  private async checkCSRF(targetUrl: string, vulnerabilities: SecurityVulnerability[]): Promise<void> {
    try {
      const response = await axios.get(targetUrl);
      const headers = response.headers;

      if (!headers['x-csrf-token'] && !headers['csrf-token']) {
        vulnerabilities.push({
          type: 'CSRF',
          severity: 'HIGH',
          description: 'Missing CSRF protection',
          location: targetUrl,
          recommendation: 'Implement CSRF tokens and validate them on all state-changing requests'
        });
      }
    } catch (error) {
      logger.warn('CSRF check failed', { error: (error as Error).message });
    }
  }

  private async checkInsecureDirectObjectReferences(targetUrl: string, vulnerabilities: SecurityVulnerability[]): Promise<void> {
    try {
      const response = await axios.get(`${targetUrl}/api/users/1`);
      if (response.status === 200 && response.data) {
        vulnerabilities.push({
          type: 'IDOR',
          severity: 'HIGH',
          description: 'Potential Insecure Direct Object Reference vulnerability',
          location: `${targetUrl}/api/users/1`,
          recommendation: 'Implement proper access controls and object-level authorization'
        });
      }
    } catch (error) {
      logger.warn('IDOR check failed', { error: (error as Error).message });
    }
  }

  private async checkSecurityMisconfiguration(targetUrl: string, vulnerabilities: SecurityVulnerability[]): Promise<void> {
    try {
      const response = await axios.get(targetUrl);
      const headers = response.headers;

      if (headers['server'] || headers['x-powered-by']) {
        vulnerabilities.push({
          type: 'Security Misconfiguration',
          severity: 'MEDIUM',
          description: 'Server information disclosure in headers',
          location: targetUrl,
          recommendation: 'Remove or mask server information in response headers'
        });
      }
    } catch (error) {
      logger.warn('Security misconfiguration check failed', { error: (error as Error).message });
    }
  }

  private generateSummary(vulnerabilities: SecurityVulnerability[]): SecurityAuditResult['summary'] {
    return {
      totalVulnerabilities: vulnerabilities.length,
      criticalCount: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      highCount: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      mediumCount: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      lowCount: vulnerabilities.filter(v => v.severity === 'LOW').length
    };
  }
}

interface OWASPVulnerability {
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
}

interface OWASPAuditResult {
  timestamp: string;
  vulnerabilities: OWASPVulnerability[];
  score: number;
}

interface SecurityVulnerability {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location: string;
  recommendation: string;
}

interface SecurityAuditResult {
  timestamp: Date;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
} 