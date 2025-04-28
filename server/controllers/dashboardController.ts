import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { AppError } from '../middleware/errorHandler';

const dashboardService = new DashboardService();

export class DashboardController {
  async getUserDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboardData = await dashboardService.getUserDashboard(userId);
      res.json(dashboardData);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getTransactionAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { period } = req.query;
      const validPeriods = ['day', 'week', 'month', 'year'];
      
      if (period && !validPeriods.includes(period as string)) {
        throw new AppError('Invalid period specified', 400);
      }

      const analytics = await dashboardService.getTransactionAnalytics(
        userId,
        (period as 'day' | 'week' | 'month' | 'year') || 'month'
      );
      
      res.json(analytics);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 