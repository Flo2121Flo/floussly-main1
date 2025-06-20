import { PrismaClient, Tontine, TontineMember, TontinePayout, TontineStatus, User } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';
import { NotificationService } from './notifications';

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

  /**
   * Handle missed payment for a tontine member
   */
  static async handleMissedPayment(tontineId: string, userId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      const member = await tx.tontineMember.findUnique({
        where: { tontineId_userId: { tontineId, userId } },
        include: { tontine: true }
      });
      
      if (!member) {
        throw new AppError("Member not found", 404);
      }

      if (member.status === 'SUSPENDED') {
        throw new AppError("Member is already suspended", 400);
      }

      // Update member status and missed payments count
      const updatedMember = await tx.tontineMember.update({
        where: { id: member.id },
        data: {
          missedPayments: { increment: 1 },
          status: member.missedPayments >= 2 ? 'SUSPENDED' : 'ACTIVE',
          lastMissedPayment: new Date()
        }
      });

      // Notify other members
      const otherMembers = await tx.tontineMember.findMany({
        where: {
          tontineId,
          userId: { not: userId }
        },
        include: { user: true }
      });

      await Promise.all(otherMembers.map(member => 
        NotificationService.sendTontineAlert({
          userId: member.userId,
          tontineId,
          type: 'MISSED_PAYMENT',
          data: {
            memberName: member.user.name,
            missedPayments: updatedMember.missedPayments
          }
        })
      ));

      // If member is suspended, notify them
      if (updatedMember.status === 'SUSPENDED') {
        await NotificationService.sendTontineAlert({
          userId,
          tontineId,
          type: 'MEMBER_SUSPENDED',
          data: {
            tontineName: member.tontine.name,
            reason: 'Multiple missed payments'
          }
        });
      }
    });
  }

  /**
   * Handle member exit from tontine
   */
  static async handleMemberExit(tontineId: string, userId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      const tontine = await tx.tontine.findUnique({
        where: { id: tontineId },
        include: { 
          members: {
            include: { user: true }
          }
        }
      });
      
      if (!tontine) {
        throw new AppError("Tontine not found", 404);
      }

      const member = tontine.members.find(m => m.userId === userId);
      if (!member) {
        throw new AppError("Member not found in tontine", 404);
      }

      // Calculate refund amount
      const payouts = await tx.tontinePayout.findMany({
        where: {
          tontineId,
          userId
        }
      });

      const totalContributions = payouts.reduce((sum, payout) => sum + payout.amount, 0);
      const refundAmount = totalContributions;

      // Process refund if there are contributions to refund
      if (refundAmount > 0) {
        await tx.transaction.create({
          data: {
            type: 'TONTINE_REFUND',
            amount: refundAmount,
            senderId: tontine.id,
            receiverId: userId,
            status: 'COMPLETED',
            metadata: {
              tontineId,
              tontineName: tontine.name,
              reason: 'Member exit'
            }
          }
        });

        // Update user's wallet
        await tx.user.update({
          where: { id: userId },
          data: {
            wallet: {
              update: {
                balance: {
                  increment: refundAmount
                }
              }
            }
          }
        });
      }

      // Update member status
      await tx.tontineMember.update({
        where: { id: member.id },
        data: { 
          status: 'INACTIVE',
          exitDate: new Date()
        }
      });

      // Notify other members
      const otherMembers = tontine.members.filter(m => m.userId !== userId);
      await Promise.all(otherMembers.map(member => 
        NotificationService.sendTontineAlert({
          userId: member.userId,
          tontineId,
          type: 'MEMBER_EXIT',
          data: {
            memberName: member.user.name,
            tontineName: tontine.name
          }
        })
      ));

      // If this was the last active member, close the tontine
      const activeMembers = await tx.tontineMember.count({
        where: {
          tontineId,
          status: 'ACTIVE'
        }
      });

      if (activeMembers === 0) {
        await tx.tontine.update({
          where: { id: tontineId },
          data: { status: TontineStatus.CLOSED }
        });
      }
    });
  }

  /**
   * Get upcoming payment schedule for a tontine
   */
  static async getUpcomingPayments(tontineId: string): Promise<any[]> {
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        members: {
          where: { status: 'ACTIVE' },
          include: { user: true }
        }
      }
    });

    if (!tontine) {
      throw new AppError("Tontine not found", 404);
    }

    const now = new Date();
    const payments = [];

    // Calculate next payment dates for each member
    for (const member of tontine.members) {
      const lastPayment = await prisma.tontinePayout.findFirst({
        where: {
          tontineId,
          userId: member.userId
        },
        orderBy: { createdAt: 'desc' }
      });

      let nextPaymentDate = lastPayment 
        ? new Date(lastPayment.createdAt)
        : new Date(tontine.createdAt);

      // Add interval based on frequency
      if (tontine.frequency === 'WEEKLY') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      if (nextPaymentDate > now) {
        payments.push({
          memberId: member.userId,
          memberName: member.user.name,
          nextPaymentDate,
          amount: tontine.contribution
        });
      }
    }

    return payments.sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());
  }
} 