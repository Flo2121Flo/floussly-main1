import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { AuditService, AuditEventType } from './AuditService';
import { NotificationService } from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

// Rule severity levels
export enum RuleSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Rule action types
export enum RuleAction {
  ALLOW = 'allow',
  BLOCK = 'block',
  REVIEW = 'review',
  NOTIFY = 'notify'
}

// Rule interface
export interface FraudRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  severity: RuleSeverity;
  action: RuleAction;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rule condition interface
export interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  aggregation?: string;
  timeWindow?: number;
}

// Rule evaluation result
export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  action: RuleAction;
  matched: boolean;
  details: any;
  timestamp: Date;
}

// Fraud event interface
export interface FraudEvent {
  id: string;
  userId: string;
  type: string;
  details: any;
  evaluations: RuleEvaluation[];
  action: RuleAction;
  createdAt: Date;
}

// Fraud rule engine class
export class FraudRuleEngine {
  private static instance: FraudRuleEngine;
  private pool: Pool;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private rules: Map<string, FraudRule>;
  private ruleCache: Map<string, any>;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.rules = new Map();
    this.ruleCache = new Map();
    this.initializeRules();
  }

  public static getInstance(): FraudRuleEngine {
    if (!FraudRuleEngine.instance) {
      FraudRuleEngine.instance = new FraudRuleEngine();
    }
    return FraudRuleEngine.instance;
  }

  // Initialize rules from database
  private async initializeRules(): Promise<void> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM fraud_rules WHERE is_active = true'
      );

      result.rows.forEach(rule => {
        this.rules.set(rule.id, rule);
      });

      logger.info('Fraud rules initialized', { count: this.rules.size });
    } catch (error) {
      logger.error('Failed to initialize fraud rules', { error: error.message });
    }
  }

  // Evaluate transaction against rules
  public async evaluateTransaction(
    userId: string,
    transaction: any
  ): Promise<RuleEvaluation[]> {
    const evaluations: RuleEvaluation[] = [];
    const timestamp = new Date();

    try {
      // Get user's risk profile
      const riskProfile = await this.getUserRiskProfile(userId);

      // Evaluate each rule
      for (const rule of this.rules.values()) {
        const evaluation = await this.evaluateRule(rule, {
          userId,
          transaction,
          riskProfile
        });

        if (evaluation.matched) {
          evaluations.push(evaluation);

          // Log fraud event
          await this.logFraudEvent(userId, transaction, evaluation);

          // Take action based on rule
          await this.takeAction(evaluation, userId, transaction);
        }
      }

      return evaluations;
    } catch (error) {
      logger.error('Failed to evaluate transaction', { error: error.message });
      throw error;
    }
  }

  // Evaluate single rule
  private async evaluateRule(
    rule: FraudRule,
    context: any
  ): Promise<RuleEvaluation> {
    const timestamp = new Date();
    let matched = false;
    const details: any = {};

    try {
      // Evaluate each condition
      for (const condition of rule.conditions) {
        const result = await this.evaluateCondition(condition, context);
        details[condition.field] = result;

        if (!result.matched) {
          matched = false;
          break;
        }

        matched = true;
      }

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        action: rule.action,
        matched,
        details,
        timestamp
      };
    } catch (error) {
      logger.error('Failed to evaluate rule', { error: error.message });
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        action: rule.action,
        matched: false,
        details: { error: error.message },
        timestamp
      };
    }
  }

  // Evaluate single condition
  private async evaluateCondition(
    condition: RuleCondition,
    context: any
  ): Promise<any> {
    try {
      const { field, operator, value, aggregation, timeWindow } = condition;
      let result: any;

      // Handle aggregated conditions
      if (aggregation) {
        result = await this.evaluateAggregatedCondition(
          field,
          aggregation,
          timeWindow,
          context
        );
      } else {
        result = this.evaluateSimpleCondition(
          context[field],
          operator,
          value
        );
      }

      return {
        field,
        operator,
        value,
        matched: result.matched,
        actual: result.actual
      };
    } catch (error) {
      logger.error('Failed to evaluate condition', { error: error.message });
      return { matched: false, error: error.message };
    }
  }

  // Evaluate aggregated condition
  private async evaluateAggregatedCondition(
    field: string,
    aggregation: string,
    timeWindow: number,
    context: any
  ): Promise<any> {
    const cacheKey = `${context.userId}:${field}:${aggregation}:${timeWindow}`;
    const cached = this.ruleCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.result;
    }

    try {
      let query: string;
      let result: any;

      switch (aggregation) {
        case 'count':
          query = `
            SELECT COUNT(*) as value
            FROM transactions
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${timeWindow} seconds'
          `;
          break;

        case 'sum':
          query = `
            SELECT SUM(amount) as value
            FROM transactions
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${timeWindow} seconds'
          `;
          break;

        case 'avg':
          query = `
            SELECT AVG(amount) as value
            FROM transactions
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${timeWindow} seconds'
          `;
          break;

        default:
          throw new Error(`Unsupported aggregation: ${aggregation}`);
      }

      const queryResult = await this.pool.query(query, [context.userId]);
      result = queryResult.rows[0].value;

      const cacheResult = {
        timestamp: Date.now(),
        result: { matched: true, actual: result }
      };

      this.ruleCache.set(cacheKey, cacheResult);
      return cacheResult.result;
    } catch (error) {
      logger.error('Failed to evaluate aggregated condition', { error: error.message });
      return { matched: false, error: error.message };
    }
  }

  // Evaluate simple condition
  private evaluateSimpleCondition(
    actual: any,
    operator: string,
    expected: any
  ): any {
    try {
      let matched = false;

      switch (operator) {
        case 'eq':
          matched = actual === expected;
          break;

        case 'neq':
          matched = actual !== expected;
          break;

        case 'gt':
          matched = actual > expected;
          break;

        case 'gte':
          matched = actual >= expected;
          break;

        case 'lt':
          matched = actual < expected;
          break;

        case 'lte':
          matched = actual <= expected;
          break;

        case 'in':
          matched = expected.includes(actual);
          break;

        case 'nin':
          matched = !expected.includes(actual);
          break;

        case 'regex':
          matched = new RegExp(expected).test(actual);
          break;

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }

      return { matched, actual };
    } catch (error) {
      logger.error('Failed to evaluate simple condition', { error: error.message });
      return { matched: false, error: error.message };
    }
  }

  // Get user's risk profile
  private async getUserRiskProfile(userId: string): Promise<any> {
    try {
      const result = await this.pool.query(
        `SELECT 
          u.kyc_level,
          u.created_at as account_age,
          COUNT(t.id) as total_transactions,
          SUM(t.amount) as total_volume,
          COUNT(DISTINCT t.recipient_id) as unique_recipients,
          COUNT(DISTINCT t.ip_address) as unique_ips
         FROM users u
         LEFT JOIN transactions t ON t.user_id = u.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get user risk profile', { error: error.message });
      return {};
    }
  }

  // Log fraud event
  private async logFraudEvent(
    userId: string,
    transaction: any,
    evaluation: RuleEvaluation
  ): Promise<void> {
    const eventId = uuidv4();
    const timestamp = new Date();

    try {
      // Log to database
      await this.pool.query(
        `INSERT INTO fraud_events (
          id, user_id, type, details, evaluations,
          action, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          eventId,
          userId,
          'transaction',
          transaction,
          [evaluation],
          evaluation.action,
          timestamp
        ]
      );

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.FRAUD_DETECTED,
        userId,
        details: {
          eventId,
          ruleId: evaluation.ruleId,
          ruleName: evaluation.ruleName,
          severity: evaluation.severity,
          action: evaluation.action,
          transaction
        },
        severity: evaluation.severity
      });
    } catch (error) {
      logger.error('Failed to log fraud event', { error: error.message });
    }
  }

  // Take action based on rule evaluation
  private async takeAction(
    evaluation: RuleEvaluation,
    userId: string,
    transaction: any
  ): Promise<void> {
    try {
      switch (evaluation.action) {
        case RuleAction.BLOCK:
          await this.blockTransaction(transaction.id);
          await this.notifyUser(userId, 'Transaction Blocked', evaluation);
          break;

        case RuleAction.REVIEW:
          await this.flagForReview(transaction.id);
          await this.notifyUser(userId, 'Transaction Under Review', evaluation);
          break;

        case RuleAction.NOTIFY:
          await this.notifyUser(userId, 'Suspicious Activity Detected', evaluation);
          break;

        case RuleAction.ALLOW:
          // No action needed
          break;
      }
    } catch (error) {
      logger.error('Failed to take action', { error: error.message });
    }
  }

  // Block transaction
  private async blockTransaction(transactionId: string): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE transactions 
         SET status = 'blocked', updated_at = $1
         WHERE id = $2`,
        [new Date(), transactionId]
      );
    } catch (error) {
      logger.error('Failed to block transaction', { error: error.message });
    }
  }

  // Flag transaction for review
  private async flagForReview(transactionId: string): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE transactions 
         SET status = 'review', updated_at = $1
         WHERE id = $2`,
        [new Date(), transactionId]
      );
    } catch (error) {
      logger.error('Failed to flag transaction for review', { error: error.message });
    }
  }

  // Notify user
  private async notifyUser(
    userId: string,
    title: string,
    evaluation: RuleEvaluation
  ): Promise<void> {
    try {
      await this.notificationService.sendNotification(userId, {
        type: 'fraud_alert',
        title,
        message: `Rule "${evaluation.ruleName}" triggered: ${evaluation.details}`,
        data: {
          ruleId: evaluation.ruleId,
          severity: evaluation.severity,
          action: evaluation.action
        }
      });
    } catch (error) {
      logger.error('Failed to notify user', { error: error.message });
    }
  }

  // Get fraud events for user
  public async getUserFraudEvents(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<FraudEvent[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM fraud_events 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get user fraud events', { error: error.message });
      throw error;
    }
  }

  // Get fraud statistics
  public async getFraudStats(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const result = await this.pool.query(
        `SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as total_events,
          COUNT(CASE WHEN action = 'block' THEN 1 END) as blocked_count,
          COUNT(CASE WHEN action = 'review' THEN 1 END) as review_count,
          COUNT(CASE WHEN action = 'notify' THEN 1 END) as notify_count
         FROM fraud_events
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get fraud statistics', { error: error.message });
      throw error;
    }
  }
} 