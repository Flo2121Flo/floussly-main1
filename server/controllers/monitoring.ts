import { Request, Response } from 'express';
import { z } from 'zod';
import MonitoringService from '@/services/monitoring';
import { logger } from '@/utils/logger';

// Validation schemas
const performanceMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
});

const errorReportSchema = z.object({
  timestamp: z.number(),
  url: z.string().url(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }),
  userAgent: z.string(),
  breadcrumbs: z.array(z.object({
    timestamp: z.number(),
    category: z.string(),
    message: z.string(),
    level: z.enum(['info', 'warning', 'error']),
  })),
});

const networkReportSchema = z.object({
  timestamp: z.number(),
  requests: z.array(z.object({
    url: z.string(),
    method: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    status: z.number().optional(),
    error: z.string().optional(),
    responseSize: z.number().optional(),
  })),
  connection: z.object({
    effectiveType: z.string(),
    downlink: z.number(),
    rtt: z.number(),
  }),
});

export class MonitoringController {
  private monitoringService: MonitoringService;

  constructor(monitoringService: MonitoringService) {
    this.monitoringService = monitoringService;
  }

  // Store performance metrics
  async storePerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = z.array(performanceMetricSchema).parse(req.body);
      await this.monitoringService.storePerformanceMetrics(metrics);
      res.status(200).json({ message: 'Performance metrics stored successfully' });
    } catch (error) {
      logger.error('Error storing performance metrics:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid performance metrics data' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Store error report
  async storeErrorReport(req: Request, res: Response): Promise<void> {
    try {
      const report = errorReportSchema.parse(req.body);
      await this.monitoringService.storeErrorReport(report);
      res.status(200).json({ message: 'Error report stored successfully' });
    } catch (error) {
      logger.error('Error storing error report:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid error report data' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Store network report
  async storeNetworkReport(req: Request, res: Response): Promise<void> {
    try {
      const report = networkReportSchema.parse(req.body);
      await this.monitoringService.storeNetworkReport(report);
      res.status(200).json({ message: 'Network report stored successfully' });
    } catch (error) {
      logger.error('Error storing network report:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid network report data' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Get dashboard data
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.monitoringService.getDashboardData();
      res.status(200).json(data);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const metrics = await this.monitoringService.getPerformanceMetrics(limit);
      res.status(200).json(metrics);
    } catch (error) {
      logger.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get error reports
  async getErrorReports(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const reports = await this.monitoringService.getErrorReports(limit);
      res.status(200).json(reports);
    } catch (error) {
      logger.error('Error fetching error reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get network reports
  async getNetworkReports(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const reports = await this.monitoringService.getNetworkReports(limit);
      res.status(200).json(reports);
    } catch (error) {
      logger.error('Error fetching network reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 