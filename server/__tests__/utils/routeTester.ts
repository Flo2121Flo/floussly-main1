import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { config } from '../../config';

export class RouteTester {
  private static async createTestUser() {
    return prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
        language: 'en',
      },
    });
  }

  private static async createTestWallet(userId: string) {
    return prisma.wallet.create({
      data: {
        userId,
        balance: 'encryptedBalance',
      },
    });
  }

  static async testRoute(
    route: (req: Request, res: Response) => Promise<void>,
    {
      method,
      path,
      body,
      params,
      query,
      auth = true,
    }: {
      method: string;
      path: string;
      body?: any;
      params?: any;
      query?: any;
      auth?: boolean;
    }
  ) {
    const testUser = auth ? await this.createTestUser() : null;
    const testWallet = testUser ? await this.createTestWallet(testUser.id) : null;

    const req = {
      method,
      path,
      body,
      params,
      query,
      user: testUser,
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    try {
      await route(req, res);
    } finally {
      if (testUser) {
        await prisma.user.delete({ where: { id: testUser.id } });
      }
    }

    return {
      status: res.status.mock.calls[0]?.[0],
      body: res.json.mock.calls[0]?.[0] || res.send.mock.calls[0]?.[0],
    };
  }
} 