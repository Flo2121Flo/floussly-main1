import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class DashboardService {
  async getUserDashboard(userId: string) {
    try {
      const [user, recentTransactions, balance] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        }),
        prisma.transaction.findMany({
          where: {
            OR: [
              { senderId: userId },
              { recipientId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            recipient: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
        prisma.balance.findUnique({
          where: { userId },
        }),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return {
        user,
        recentTransactions,
        balance: balance?.amount || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  }

  async getTransactionAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId },
          ],
          createdAt: {
            gte: startDate,
            lte: new Date(),
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const analytics = {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        sentAmount: transactions
          .filter(t => t.senderId === userId)
          .reduce((sum, t) => sum + t.amount, 0),
        receivedAmount: transactions
          .filter(t => t.recipientId === userId)
          .reduce((sum, t) => sum + t.amount, 0),
        transactionsByDay: this.groupTransactionsByDay(transactions),
      };

      return analytics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch transaction analytics', 500);
    }
  }

  private groupTransactionsByDay(transactions: any[]) {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          sent: 0,
          received: 0,
        };
      }
      if (transaction.senderId === transaction.userId) {
        acc[date].sent += transaction.amount;
      } else {
        acc[date].received += transaction.amount;
      }
      return acc;
    }, {});

    return grouped;
  }
} 