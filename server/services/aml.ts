import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { NotificationService } from './notifications';
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
import { validateSchema } from '../utils/validation';
import { amlSchema } from '../schemas/aml';

const prisma = new PrismaClient();

export class AMLService {
  // Dashboard
  static async getDashboard() {
    try {
      const [
        totalActivities,
        pendingActivities,
        highSeverityActivities,
        totalUsers,
        highRiskUsers,
        totalDevices,
        suspiciousDevices,
        totalLocations,
        suspiciousLocations,
        totalBehaviors,
        suspiciousBehaviors,
        totalSessions,
        suspiciousSessions,
      ] = await Promise.all([
        prisma.aMLActivity.count(),
        prisma.aMLActivity.count({ where: { status: 'pending' } }),
        prisma.aMLActivity.count({ where: { severity: 'high' } }),
        prisma.user.count(),
        prisma.userRiskScore.count({ where: { score: { gte: 7 } } }),
        prisma.device.count(),
        prisma.device.count({ where: { activities: { some: { severity: 'high' } } } }),
        prisma.location.count(),
        prisma.location.count({ where: { activities: { some: { severity: 'high' } } } }),
        prisma.behavior.count(),
        prisma.behavior.count({ where: { activities: { some: { severity: 'high' } } } }),
        prisma.session.count(),
        prisma.session.count({ where: { activities: { some: { severity: 'high' } } } }),
      ]);

      return {
        activities: {
          total: totalActivities,
          pending: pendingActivities,
          highSeverity: highSeverityActivities,
          pendingPercentage: (pendingActivities / totalActivities) * 100,
          highSeverityPercentage: (highSeverityActivities / totalActivities) * 100,
        },
        users: {
          total: totalUsers,
          highRisk: highRiskUsers,
          highRiskPercentage: (highRiskUsers / totalUsers) * 100,
        },
        devices: {
          total: totalDevices,
          suspicious: suspiciousDevices,
          suspiciousPercentage: (suspiciousDevices / totalDevices) * 100,
        },
        locations: {
          total: totalLocations,
          suspicious: suspiciousLocations,
          suspiciousPercentage: (suspiciousLocations / totalLocations) * 100,
        },
        behaviors: {
          total: totalBehaviors,
          suspicious: suspiciousBehaviors,
          suspiciousPercentage: (suspiciousBehaviors / totalBehaviors) * 100,
        },
        sessions: {
          total: totalSessions,
          suspicious: suspiciousSessions,
          suspiciousPercentage: (suspiciousSessions / totalSessions) * 100,
        },
      };
    } catch (error) {
      logger.error('Error in getDashboard:', error);
      throw error;
    }
  }

  // Activities
  static async getActivities(params: any) {
    try {
      validateSchema(amlSchema.getActivities, params);

      const {
        page = 1,
        limit = 100,
        type = 'all',
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
        deviceId,
        locationId,
        behaviorId,
        sessionId,
      } = params;

      const where: any = {};

      if (type !== 'all') where.type = type;
      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;
      if (deviceId) where.deviceId = deviceId;
      if (locationId) where.locationId = locationId;
      if (behaviorId) where.behaviorId = behaviorId;
      if (sessionId) where.sessionId = sessionId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
            device: true,
            location: true,
            behavior: true,
            session: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getActivities:', error);
      throw error;
    }
  }

  // Risk Score
  static async getRiskScore(userId: string) {
    try {
      validateSchema(amlSchema.getRiskScore, { userId });

      const riskScore = await prisma.userRiskScore.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!riskScore) {
        return { score: 0, reason: 'No risk assessment performed yet' };
      }

      return riskScore;
    } catch (error) {
      logger.error('Error in getRiskScore:', error);
      throw error;
    }
  }

  static async updateRiskScore(userId: string, score: number, reason: string) {
    try {
      validateSchema(amlSchema.updateRiskScore, { userId, score, reason });

      const riskScore = await prisma.userRiskScore.upsert({
        where: { userId },
        update: { score, reason },
        create: { userId, score, reason },
      });

      return riskScore;
    } catch (error) {
      logger.error('Error in updateRiskScore:', error);
      throw error;
    }
  }

  // Compliance
  static async getCompliance() {
    try {
      const compliance = await prisma.complianceStatus.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!compliance) {
        return { status: 'compliant', reason: 'No compliance issues reported' };
      }

      return compliance;
    } catch (error) {
      logger.error('Error in getCompliance:', error);
      throw error;
    }
  }

  static async updateCompliance(status: string, reason: string) {
    try {
      validateSchema(amlSchema.updateCompliance, { status, reason });

      const compliance = await prisma.complianceStatus.create({
        data: { status, reason },
      });

      return compliance;
    } catch (error) {
      logger.error('Error in updateCompliance:', error);
      throw error;
    }
  }

  // Monitoring
  static async getTransactionMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getTransactionMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: 'transaction',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getTransactionMonitoring:', error);
      throw error;
    }
  }

  static async getUserMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getUserMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        riskScore,
      } = params;

      const where: any = {
        type: 'user',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (riskScore !== undefined) {
        where.user = {
          riskScore: {
            score: { gte: riskScore },
          },
        };
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getUserMonitoring:', error);
      throw error;
    }
  }

  static async getDeviceMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getDeviceMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: 'device',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
            device: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getDeviceMonitoring:', error);
      throw error;
    }
  }

  static async getLocationMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getLocationMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: 'location',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
            location: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getLocationMonitoring:', error);
      throw error;
    }
  }

  static async getBehaviorMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getBehaviorMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: 'behavior',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
            behavior: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getBehaviorMonitoring:', error);
      throw error;
    }
  }

  static async getSessionMonitoring(params: any) {
    try {
      validateSchema(amlSchema.getSessionMonitoring, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: 'session',
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
            session: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error in getSessionMonitoring:', error);
      throw error;
    }
  }

  // Request Monitoring
  static async getRequestMonitoring(params: any, type: string) {
    try {
      const schema = amlSchema[`get${type}Monitoring`];
      if (!schema) {
        throw new Error(`Invalid monitoring type: ${type}`);
      }

      validateSchema(schema, params);

      const {
        page = 1,
        limit = 100,
        status = 'all',
        severity = 'all',
        startDate,
        endDate,
        userId,
      } = params;

      const where: any = {
        type: type.toLowerCase(),
      };

      if (status !== 'all') where.status = status;
      if (severity !== 'all') where.severity = severity;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [activities, total] = await Promise.all([
        prisma.aMLActivity.findMany({
          where,
          include: {
            user: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.aMLActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error in get${type}Monitoring:`, error);
      throw error;
    }
  }
} 