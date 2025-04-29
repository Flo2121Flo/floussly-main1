import { Request, Response } from 'express';
import { AMLMonitor } from '../services/aml-monitor';
import { AMLAlerts } from '../services/aml-alerts';
import { logger } from '../utils/logger';

export class AMLController {
  private static instance: AMLController;
  private monitor: AMLMonitor;
  private alerts: AMLAlerts;

  private constructor() {
    this.monitor = AMLMonitor.getInstance();
    this.alerts = AMLAlerts.getInstance();
  }

  public static getInstance(): AMLController {
    if (!AMLController.instance) {
      AMLController.instance = new AMLController();
    }
    return AMLController.instance;
  }

  public async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const alerts = await this.alerts.getAlerts(userId);
      res.json({ alerts });
    } catch (error) {
      logger.error('Failed to get alerts', { error });
      res.status(500).json({ error: 'Failed to get alerts' });
    }
  }

  public async clearAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      await this.alerts.clearAlerts(userId);
      res.json({ message: 'Alerts cleared successfully' });
    } catch (error) {
      logger.error('Failed to clear alerts', { error });
      res.status(500).json({ error: 'Failed to clear alerts' });
    }
  }

  public async getTransactionPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const patterns = await this.monitor.getTransactionPatterns(userId);
      res.json({ patterns });
    } catch (error) {
      logger.error('Failed to get transaction patterns', { error });
      res.status(500).json({ error: 'Failed to get transaction patterns' });
    }
  }

  public async getSuspiciousPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const patterns = await this.monitor.getSuspiciousPatterns(userId);
      res.json({ patterns });
    } catch (error) {
      logger.error('Failed to get suspicious patterns', { error });
      res.status(500).json({ error: 'Failed to get suspicious patterns' });
    }
  }

  public async getMonitoringStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const stats = await this.monitor.getMonitoringStats(userId);
      res.json({ stats });
    } catch (error) {
      logger.error('Failed to get monitoring stats', { error });
      res.status(500).json({ error: 'Failed to get monitoring stats' });
    }
  }
} 