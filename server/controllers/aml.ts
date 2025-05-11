import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { AMLService } from '../services/aml';
import { NotificationService } from '../services/notifications';
import { i18n } from '../utils/i18n';
import { validateKYC } from '../utils/kyc';
import { validateBalance } from '../utils/wallet';
import { rateLimit } from '../middleware/rate-limiter';
import { antiFraudMiddleware } from '../middleware/anti-fraud';
import { checkAdmin } from '../middleware/check-admin';
import { validateKYC } from '../middleware/validate-kyc';
import { validateTransaction } from '../middleware/validate-transaction';
import { validateUser } from '../middleware/validate-user';
import { validateDevice } from '../middleware/validate-device';
import { validateLocation } from '../middleware/validate-location';
import { validateBehavior } from '../middleware/validate-behavior';
import { validateSession } from '../middleware/validate-session';
import { validateRateLimit } from '../middleware/validate-rate-limit';
import { validateRequestIntegrity } from '../middleware/validate-request-integrity';
import { validateAttackPattern } from '../middleware/validate-attack-pattern';
import { validateCSRF } from '../middleware/validate-csrf';
import { validateHeaders } from '../middleware/validate-headers';
import { validateContentType } from '../middleware/validate-content-type';
import { validateRequestId } from '../middleware/validate-request-id';
import { validateRequestTimestamp } from '../middleware/validate-request-timestamp';
import { validateRequestSignature } from '../middleware/validate-request-signature';
import { validateRequestOrigin } from '../middleware/validate-request-origin';
import { validateRequestMethod } from '../middleware/validate-request-method';
import { validateRequestPath } from '../middleware/validate-request-path';
import { validateRequestQuery } from '../middleware/validate-request-query';
import { validateRequestBody } from '../middleware/validate-request-body';
import { validateRequestParams } from '../middleware/validate-request-params';
import { validateRequestCookies } from '../middleware/validate-request-cookies';
import { validateRequestFiles } from '../middleware/validate-request-files';
import { validateRequestHeaders } from '../middleware/validate-request-headers';
import { validateRequestIp } from '../middleware/validate-request-ip';
import { validateRequestUserAgent } from '../middleware/validate-request-user-agent';
import { validateRequestReferer } from '../middleware/validate-request-referer';
import { validateRequestHost } from '../middleware/validate-request-host';
import { validateRequestProtocol } from '../middleware/validate-request-protocol';
import { validateRequestPort } from '../middleware/validate-request-port';
import { validateRequestSubdomain } from '../middleware/validate-request-subdomain';
import { validateRequestDomain } from '../middleware/validate-request-domain';
import { validateRequestTld } from '../middleware/validate-request-tld';
import { validateRequestPathname } from '../middleware/validate-request-pathname';
import { validateRequestSearch } from '../middleware/validate-request-search';
import { validateRequestHash } from '../middleware/validate-request-hash';
import { validateRequestQueryString } from '../middleware/validate-request-query-string';
import { validateRequestUrl } from '../middleware/validate-request-url';
import { validateRequestBaseUrl } from '../middleware/validate-request-base-url';
import { validateRequestOriginalUrl } from '../middleware/validate-request-original-url';

export class AMLController {
  // Get AML dashboard data
  static async getDashboard(req: Request, res: Response) {
    try {
      const dashboardData = await AMLService.getDashboard();
      return res.json(dashboardData);
    } catch (error) {
      logger.error('Error getting AML dashboard data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get suspicious activities
  static async getActivities(req: Request, res: Response) {
    try {
      const activities = await AMLService.getActivities();
      return res.json(activities);
    } catch (error) {
      logger.error('Error getting suspicious activities', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user risk score
  static async getRiskScore(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const riskScore = await AMLService.getRiskScore(userId);
      return res.json(riskScore);
    } catch (error) {
      logger.error('Error getting user risk score', { error, userId: req.params.userId });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update user risk score
  static async updateRiskScore(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { score, reason } = req.body;
      const updatedRiskScore = await AMLService.updateRiskScore(userId, score, reason);
      return res.json(updatedRiskScore);
    } catch (error) {
      logger.error('Error updating user risk score', { error, userId: req.params.userId });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get compliance status
  static async getCompliance(req: Request, res: Response) {
    try {
      const complianceStatus = await AMLService.getCompliance();
      return res.json(complianceStatus);
    } catch (error) {
      logger.error('Error getting compliance status', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update compliance status
  static async updateCompliance(req: Request, res: Response) {
    try {
      const { status, reason } = req.body;
      const updatedCompliance = await AMLService.updateCompliance(status, reason);
      return res.json(updatedCompliance);
    } catch (error) {
      logger.error('Error updating compliance status', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get transaction monitoring
  static async getTransactionMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getTransactionMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting transaction monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user monitoring
  static async getUserMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getUserMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting user monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get device monitoring
  static async getDeviceMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getDeviceMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting device monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get location monitoring
  static async getLocationMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getLocationMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting location monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get behavior monitoring
  static async getBehaviorMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getBehaviorMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting behavior monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get session monitoring
  static async getSessionMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getSessionMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting session monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get rate limit monitoring
  static async getRateLimitMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRateLimitMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting rate limit monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request integrity monitoring
  static async getRequestIntegrityMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestIntegrityMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request integrity monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get attack pattern monitoring
  static async getAttackPatternMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getAttackPatternMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting attack pattern monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get CSRF monitoring
  static async getCSRFMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getCSRFMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting CSRF monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get headers monitoring
  static async getHeadersMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getHeadersMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting headers monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get content type monitoring
  static async getContentTypeMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getContentTypeMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting content type monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request ID monitoring
  static async getRequestIdMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestIdMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request ID monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request timestamp monitoring
  static async getRequestTimestampMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestTimestampMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request timestamp monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request signature monitoring
  static async getRequestSignatureMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestSignatureMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request signature monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request origin monitoring
  static async getRequestOriginMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestOriginMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request origin monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request method monitoring
  static async getRequestMethodMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestMethodMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request method monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request path monitoring
  static async getRequestPathMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestPathMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request path monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request query monitoring
  static async getRequestQueryMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestQueryMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request query monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request body monitoring
  static async getRequestBodyMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestBodyMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request body monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request params monitoring
  static async getRequestParamsMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestParamsMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request params monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request cookies monitoring
  static async getRequestCookiesMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestCookiesMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request cookies monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request files monitoring
  static async getRequestFilesMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestFilesMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request files monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request headers monitoring
  static async getRequestHeadersMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestHeadersMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request headers monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request IP monitoring
  static async getRequestIpMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestIpMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request IP monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request user agent monitoring
  static async getRequestUserAgentMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestUserAgentMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request user agent monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request referer monitoring
  static async getRequestRefererMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestRefererMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request referer monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request host monitoring
  static async getRequestHostMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestHostMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request host monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request protocol monitoring
  static async getRequestProtocolMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestProtocolMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request protocol monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request port monitoring
  static async getRequestPortMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestPortMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request port monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request subdomain monitoring
  static async getRequestSubdomainMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestSubdomainMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request subdomain monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request domain monitoring
  static async getRequestDomainMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestDomainMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request domain monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request TLD monitoring
  static async getRequestTldMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestTldMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request TLD monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request pathname monitoring
  static async getRequestPathnameMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestPathnameMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request pathname monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request search monitoring
  static async getRequestSearchMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestSearchMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request search monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request hash monitoring
  static async getRequestHashMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestHashMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request hash monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request query string monitoring
  static async getRequestQueryStringMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestQueryStringMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request query string monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request URL monitoring
  static async getRequestUrlMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestUrlMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request URL monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request base URL monitoring
  static async getRequestBaseUrlMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestBaseUrlMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request base URL monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get request original URL monitoring
  static async getRequestOriginalUrlMonitoring(req: Request, res: Response) {
    try {
      const monitoringData = await AMLService.getRequestOriginalUrlMonitoring();
      return res.json(monitoringData);
    } catch (error) {
      logger.error('Error getting request original URL monitoring data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 