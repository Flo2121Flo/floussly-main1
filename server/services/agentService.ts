import prisma from '../database/schema';
import { Transaction } from '../types/transaction';
import { FeeCalculator } from './feeCalculator';

export class AgentService {
  static async processAgentCashout(transaction: Transaction) {
    try {
      // Verify agent exists and is active
      const agent = await prisma.agent.findUnique({
        where: { id: transaction.metadata?.agentId }
      });

      if (!agent || agent.status !== 'active') {
        throw new Error('Invalid or inactive agent');
      }

      // Calculate agent commission
      const commission = FeeCalculator.calculateFee('AGENT_CASHOUT', transaction.amount);

      // Create agent transaction record
      await prisma.transaction.create({
        data: {
          id: transaction.id,
          userId: transaction.userId,
          type: 'AGENT_CASHOUT',
          amount: transaction.amount,
          fee: commission,
          totalAmount: transaction.totalAmount,
          status: 'pending',
          metadata: {
            agentId: agent.id,
            commission
          }
        }
      });

      // Update agent's balance
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          balance: {
            increment: transaction.amount
          }
        }
      });

      return {
        success: true,
        agentId: agent.id,
        commission
      };
    } catch (error) {
      console.error('Agent cashout error:', error);
      throw new Error('Agent cashout failed');
    }
  }

  static async processAgentTopup(transaction: Transaction) {
    try {
      // Verify agent exists and is active
      const agent = await prisma.agent.findUnique({
        where: { id: transaction.metadata?.agentId }
      });

      if (!agent || agent.status !== 'active') {
        throw new Error('Invalid or inactive agent');
      }

      // Create agent transaction record
      await prisma.transaction.create({
        data: {
          id: transaction.id,
          userId: transaction.userId,
          type: 'AGENT_TOPUP',
          amount: transaction.amount,
          fee: FeeCalculator.calculateFee('AGENT_TOPUP', transaction.amount),
          totalAmount: transaction.totalAmount,
          status: 'pending',
          metadata: {
            agentId: agent.id
          }
        }
      });

      // Update agent's balance
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          balance: {
            decrement: transaction.amount
          }
        }
      });

      return {
        success: true,
        agentId: agent.id
      };
    } catch (error) {
      console.error('Agent topup error:', error);
      throw new Error('Agent topup failed');
    }
  }

  static async getAgentTransactions(agentId: string, startDate?: Date, endDate?: Date) {
    try {
      const where = {
        metadata: {
          path: ['agentId'],
          equals: agentId
        }
      };

      if (startDate && endDate) {
        where['date'] = {
          gte: startDate,
          lte: endDate
        };
      }

      return await prisma.transaction.findMany({
        where,
        orderBy: {
          date: 'desc'
        }
      });
    } catch (error) {
      console.error('Get agent transactions error:', error);
      throw new Error('Failed to get agent transactions');
    }
  }

  static async getAgentBalance(agentId: string) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { balance: true }
      });

      return agent?.balance || 0;
    } catch (error) {
      console.error('Get agent balance error:', error);
      throw new Error('Failed to get agent balance');
    }
  }
} 