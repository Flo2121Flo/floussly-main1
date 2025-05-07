import { PrismaClient, Tontine, TontineMember, TontinePayout, TontineStatus, User } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class TontineService {
  /**
   * Create a new tontine
   */
  static async createTontine(data: {
    creatorId: string;
    name: string;
    description?: string;
    contribution: number;
    duration: number; // in months
    frequency: 'WEEKLY' | 'MONTHLY';
    maxMembers: number;
  }): Promise<Tontine> {
    const { creatorId, name, description, contribution, duration, frequency, maxMembers } = data;

    // Validate contribution amount
    if (contribution < config.tontine.minContribution) {
      throw new AppError(
        `Minimum contribution amount is ${config.tontine.minContribution}`,
        400
      );
    }

    // Validate max members
    if (maxMembers > config.tontine.maxMembers) {
      throw new AppError(
        `Maximum number of members cannot exceed ${config.tontine.maxMembers}`,
        400
      );
    }

    // Create tontine
    return await prisma.tontine.create({
      data: {
        creatorId,
        name,
        description,
        contribution,
        duration,
        frequency,
        maxMembers,
        status: TontineStatus.ACTIVE,
        members: {
          create: {
            userId: creatorId,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  /**
   * Join a tontine
   */
  static async joinTontine(tontineId: string, userId: string): Promise<TontineMember> {
    // Check if tontine exists and is active
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: { members: true },
    });

    if (!tontine) {
      throw new AppError('Tontine not found', 404);
    }

    if (tontine.status !== TontineStatus.ACTIVE) {
      throw new AppError('Tontine is not active', 400);
    }

    // Check if user is already a member
    if (tontine.members.some((member) => member.userId === userId)) {
      throw new AppError('User is already a member of this tontine', 400);
    }

    // Check if tontine is full
    if (tontine.members.length >= tontine.maxMembers) {
      throw new AppError('Tontine is full', 400);
    }

    // Add user as member
    return await prisma.tontineMember.create({
      data: {
        tontineId,
        userId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Process tontine contribution
   */
  static async processContribution(
    tontineId: string,
    userId: string,
    amount: number
  ): Promise<TontinePayout> {
    // Check if tontine exists and is active
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: { members: true },
    });

    if (!tontine) {
      throw new AppError('Tontine not found', 404);
    }

    if (tontine.status !== TontineStatus.ACTIVE) {
      throw new AppError('Tontine is not active', 400);
    }

    // Check if user is a member
    const member = tontine.members.find((m) => m.userId === userId);
    if (!member) {
      throw new AppError('User is not a member of this tontine', 400);
    }

    // Validate contribution amount
    if (amount !== tontine.contribution) {
      throw new AppError(
        `Contribution amount must be exactly ${tontine.contribution}`,
        400
      );
    }

    // Calculate fees
    const flatFee = config.fees.tontine.perUser;
    const percentageFee = (amount * config.fees.tontine.percentage) / 100;
    const totalFee = flatFee + percentageFee;
    const netAmount = amount - totalFee;

    // Process contribution
    return await prisma.$transaction(async (tx) => {
      // Create payout record
      const payout = await tx.tontinePayout.create({
        data: {
          tontineId,
          userId,
          amount: netAmount,
          fees: {
            flat: flatFee,
            percentage: percentageFee,
            total: totalFee,
          },
          status: 'COMPLETED',
        },
      });

      // Update tontine total
      await tx.tontine.update({
        where: { id: tontineId },
        data: {
          totalContributions: { increment: amount },
          totalFees: { increment: totalFee },
        },
      });

      return payout;
    });
  }

  /**
   * Get tontine details
   */
  static async getTontine(tontineId: string): Promise<Tontine & { members: TontineMember[] }> {
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!tontine) {
      throw new AppError('Tontine not found', 404);
    }

    return tontine;
  }

  /**
   * Get user's tontines
   */
  static async getUserTontines(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: TontineStatus;
    } = {}
  ) {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      members: {
        some: {
          userId,
          ...(status && { status }),
        },
      },
    };

    const [tontines, total] = await Promise.all([
      prisma.tontine.findMany({
        where,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tontine.count({ where }),
    ]);

    return {
      tontines,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get tontine statistics
   */
  static async getTontineStatistics(tontineId: string) {
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        members: true,
        payouts: true,
      },
    });

    if (!tontine) {
      throw new AppError('Tontine not found', 404);
    }

    const totalContributions = tontine.payouts.reduce(
      (sum, payout) => sum + payout.amount,
      0
    );
    const totalFees = tontine.payouts.reduce(
      (sum, payout) => sum + (payout.fees as any).total,
      0
    );

    return {
      totalMembers: tontine.members.length,
      activeMembers: tontine.members.filter((m) => m.status === 'ACTIVE').length,
      totalContributions,
      totalFees,
      averageContribution: totalContributions / tontine.members.length,
      completionPercentage:
        (tontine.members.length / tontine.maxMembers) * 100,
    };
  }
} 