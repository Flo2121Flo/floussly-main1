import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { AuditService, AuditEventType } from './AuditService';
import { NotificationService } from './NotificationService';

// Transaction trend types
export enum TrendType {
  VOLUME = 'volume',
  FREQUENCY = 'frequency',
  RECIPIENT = 'recipient',
  CATEGORY = 'category',
  TIME = 'time',
  LOCATION = 'location'
}

// Time period enum
export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// Trend interface
export interface Trend {
  type: TrendType;
  period: TimePeriod;
  startDate: Date;
  endDate: Date;
  data: any;
  insights: string[];
  anomalies: any[];
}

// Transaction trends service class
export class TransactionTrendsService {
  private static instance: TransactionTrendsService;
  private pool: Pool;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private cacheTTL: number = 3600; // 1 hour

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): TransactionTrendsService {
    if (!TransactionTrendsService.instance) {
      TransactionTrendsService.instance = new TransactionTrendsService();
    }
    return TransactionTrendsService.instance;
  }

  // Get transaction trends for a user
  public async getUserTrends(
    userId: string,
    period: TimePeriod = TimePeriod.MONTHLY,
    startDate?: Date,
    endDate?: Date
  ): Promise<Trend[]> {
    try {
      // Check cache first
      const cacheKey = `trends:${userId}:${period}:${startDate?.toISOString()}:${endDate?.toISOString()}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Calculate date range
      const { start, end } = this.calculateDateRange(period, startDate, endDate);

      // Get all trend types
      const trends = await Promise.all([
        this.getVolumeTrends(userId, period, start, end),
        this.getFrequencyTrends(userId, period, start, end),
        this.getRecipientTrends(userId, period, start, end),
        this.getCategoryTrends(userId, period, start, end),
        this.getTimeTrends(userId, period, start, end),
        this.getLocationTrends(userId, period, start, end)
      ]);

      // Cache the result
      await redis.set(cacheKey, JSON.stringify(trends), 'EX', this.cacheTTL);

      return trends;
    } catch (error) {
      logger.error('Failed to get user trends', { error: error.message });
      throw error;
    }
  }

  // Get volume trends
  private async getVolumeTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          DATE_TRUNC($1, created_at) as period,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume,
          AVG(amount) as avg_amount
         FROM transactions
         WHERE user_id = $2
         AND created_at BETWEEN $3 AND $4
         GROUP BY DATE_TRUNC($1, created_at)
         ORDER BY period`,
        [period, userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateVolumeInsights(data);
      const anomalies = this.detectVolumeAnomalies(data);

      return {
        type: TrendType.VOLUME,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get volume trends', { error: error.message });
      throw error;
    }
  }

  // Get frequency trends
  private async getFrequencyTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          DATE_TRUNC($1, created_at) as period,
          COUNT(*) as transaction_count,
          COUNT(DISTINCT recipient_id) as unique_recipients,
          COUNT(DISTINCT category) as unique_categories
         FROM transactions
         WHERE user_id = $2
         AND created_at BETWEEN $3 AND $4
         GROUP BY DATE_TRUNC($1, created_at)
         ORDER BY period`,
        [period, userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateFrequencyInsights(data);
      const anomalies = this.detectFrequencyAnomalies(data);

      return {
        type: TrendType.FREQUENCY,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get frequency trends', { error: error.message });
      throw error;
    }
  }

  // Get recipient trends
  private async getRecipientTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          recipient_id,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume,
          AVG(amount) as avg_amount,
          MIN(created_at) as first_transaction,
          MAX(created_at) as last_transaction
         FROM transactions
         WHERE user_id = $1
         AND created_at BETWEEN $2 AND $3
         GROUP BY recipient_id
         ORDER BY transaction_count DESC
         LIMIT 10`,
        [userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateRecipientInsights(data);
      const anomalies = this.detectRecipientAnomalies(data);

      return {
        type: TrendType.RECIPIENT,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get recipient trends', { error: error.message });
      throw error;
    }
  }

  // Get category trends
  private async getCategoryTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume,
          AVG(amount) as avg_amount
         FROM transactions
         WHERE user_id = $1
         AND created_at BETWEEN $2 AND $3
         GROUP BY category
         ORDER BY total_volume DESC`,
        [userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateCategoryInsights(data);
      const anomalies = this.detectCategoryAnomalies(data);

      return {
        type: TrendType.CATEGORY,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get category trends', { error: error.message });
      throw error;
    }
  }

  // Get time trends
  private async getTimeTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          EXTRACT(DOW FROM created_at) as day_of_week,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume
         FROM transactions
         WHERE user_id = $1
         AND created_at BETWEEN $2 AND $3
         GROUP BY hour, day_of_week
         ORDER BY hour, day_of_week`,
        [userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateTimeInsights(data);
      const anomalies = this.detectTimeAnomalies(data);

      return {
        type: TrendType.TIME,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get time trends', { error: error.message });
      throw error;
    }
  }

  // Get location trends
  private async getLocationTrends(
    userId: string,
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<Trend> {
    try {
      const result = await this.pool.query(
        `SELECT 
          country,
          city,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume
         FROM transactions
         WHERE user_id = $1
         AND created_at BETWEEN $2 AND $3
         GROUP BY country, city
         ORDER BY transaction_count DESC`,
        [userId, startDate, endDate]
      );

      const data = result.rows;
      const insights = this.generateLocationInsights(data);
      const anomalies = this.detectLocationAnomalies(data);

      return {
        type: TrendType.LOCATION,
        period,
        startDate,
        endDate,
        data,
        insights,
        anomalies
      };
    } catch (error) {
      logger.error('Failed to get location trends', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  private calculateDateRange(
    period: TimePeriod,
    startDate?: Date,
    endDate?: Date
  ): { start: Date; end: Date } {
    const end = endDate || new Date();
    let start: Date;

    if (startDate) {
      start = startDate;
    } else {
      switch (period) {
        case TimePeriod.DAILY:
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.WEEKLY:
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.MONTHLY:
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.QUARTERLY:
          start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.YEARLY:
          start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    return { start, end };
  }

  // Insight generation methods
  private generateVolumeInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const totalVolume = data.reduce((sum, row) => sum + parseFloat(row.total_volume), 0);
    const avgVolume = totalVolume / data.length;
    const maxVolume = Math.max(...data.map(row => parseFloat(row.total_volume)));
    const minVolume = Math.min(...data.map(row => parseFloat(row.total_volume)));

    if (maxVolume > avgVolume * 2) {
      insights.push(`Peak transaction volume of ${maxVolume} detected`);
    }
    if (minVolume < avgVolume * 0.5) {
      insights.push(`Low transaction volume of ${minVolume} detected`);
    }

    return insights;
  }

  private generateFrequencyInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const avgTransactions = data.reduce((sum, row) => sum + row.transaction_count, 0) / data.length;
    const maxTransactions = Math.max(...data.map(row => row.transaction_count));
    const minTransactions = Math.min(...data.map(row => row.transaction_count));

    if (maxTransactions > avgTransactions * 2) {
      insights.push(`High transaction frequency detected: ${maxTransactions} transactions`);
    }
    if (minTransactions < avgTransactions * 0.5) {
      insights.push(`Low transaction frequency detected: ${minTransactions} transactions`);
    }

    return insights;
  }

  private generateRecipientInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const topRecipient = data[0];
    const totalTransactions = data.reduce((sum, row) => sum + row.transaction_count, 0);
    const recipientPercentage = (topRecipient.transaction_count / totalTransactions) * 100;

    if (recipientPercentage > 50) {
      insights.push(`High concentration of transactions with top recipient: ${recipientPercentage.toFixed(1)}%`);
    }

    return insights;
  }

  private generateCategoryInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const totalVolume = data.reduce((sum, row) => sum + parseFloat(row.total_volume), 0);
    const topCategory = data[0];
    const categoryPercentage = (parseFloat(topCategory.total_volume) / totalVolume) * 100;

    if (categoryPercentage > 40) {
      insights.push(`High spending concentration in ${topCategory.category}: ${categoryPercentage.toFixed(1)}%`);
    }

    return insights;
  }

  private generateTimeInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const peakHour = data.reduce((max, row) => 
      row.transaction_count > max.count ? { hour: row.hour, count: row.transaction_count } : max,
      { hour: 0, count: 0 }
    );

    insights.push(`Peak transaction hour: ${peakHour.hour}:00 (${peakHour.count} transactions)`);

    return insights;
  }

  private generateLocationInsights(data: any[]): string[] {
    const insights: string[] = [];
    if (data.length === 0) return insights;

    const uniqueLocations = new Set(data.map(row => `${row.country}-${row.city}`)).size;
    if (uniqueLocations > 3) {
      insights.push(`Transactions spread across ${uniqueLocations} different locations`);
    }

    return insights;
  }

  // Anomaly detection methods
  private detectVolumeAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const volumes = data.map(row => parseFloat(row.total_volume));
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length
    );

    data.forEach(row => {
      const volume = parseFloat(row.total_volume);
      if (Math.abs(volume - mean) > 2 * stdDev) {
        anomalies.push({
          period: row.period,
          volume,
          expected: mean,
          deviation: ((volume - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }

  private detectFrequencyAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const frequencies = data.map(row => row.transaction_count);
    const mean = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    const stdDev = Math.sqrt(
      frequencies.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / frequencies.length
    );

    data.forEach(row => {
      if (Math.abs(row.transaction_count - mean) > 2 * stdDev) {
        anomalies.push({
          period: row.period,
          frequency: row.transaction_count,
          expected: mean,
          deviation: ((row.transaction_count - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }

  private detectRecipientAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const volumes = data.map(row => parseFloat(row.total_volume));
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length
    );

    data.forEach(row => {
      const volume = parseFloat(row.total_volume);
      if (Math.abs(volume - mean) > 2 * stdDev) {
        anomalies.push({
          recipientId: row.recipient_id,
          volume,
          expected: mean,
          deviation: ((volume - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }

  private detectCategoryAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const volumes = data.map(row => parseFloat(row.total_volume));
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length
    );

    data.forEach(row => {
      const volume = parseFloat(row.total_volume);
      if (Math.abs(volume - mean) > 2 * stdDev) {
        anomalies.push({
          category: row.category,
          volume,
          expected: mean,
          deviation: ((volume - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }

  private detectTimeAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const frequencies = data.map(row => row.transaction_count);
    const mean = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    const stdDev = Math.sqrt(
      frequencies.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / frequencies.length
    );

    data.forEach(row => {
      if (Math.abs(row.transaction_count - mean) > 2 * stdDev) {
        anomalies.push({
          hour: row.hour,
          dayOfWeek: row.day_of_week,
          frequency: row.transaction_count,
          expected: mean,
          deviation: ((row.transaction_count - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }

  private detectLocationAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];
    if (data.length < 2) return anomalies;

    const volumes = data.map(row => parseFloat(row.total_volume));
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length
    );

    data.forEach(row => {
      const volume = parseFloat(row.total_volume);
      if (Math.abs(volume - mean) > 2 * stdDev) {
        anomalies.push({
          location: `${row.city}, ${row.country}`,
          volume,
          expected: mean,
          deviation: ((volume - mean) / mean) * 100
        });
      }
    });

    return anomalies;
  }
} 