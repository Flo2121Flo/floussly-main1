import { TreasureService } from '../services/treasure';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Treasure Hunt System', () => {
  let treasureService: TreasureService;
  let creator: any;
  let finder: any;
  let treasure: any;

  beforeEach(async () => {
    treasureService = new TreasureService();
    creator = await prisma.user.create({
      data: {
        email: `creator${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
    finder = await prisma.user.create({
      data: {
        email: `finder${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
  });

  afterEach(async () => {
    await prisma.treasure.deleteMany();
    await prisma.user.deleteMany({
      where: { id: { in: [creator.id, finder.id] } },
    });
  });

  describe('Treasure Creation', () => {
    it('should create a treasure with geo unlock', async () => {
      treasure = await treasureService.createTreasure({
        creatorId: creator.id,
        amount: 100,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
        unlockMethod: 'GEO',
        invitedUsers: [finder.id],
      });

      expect(treasure).toHaveProperty('id');
      expect(treasure.amount).toBe(100);
      expect(treasure.unlockMethod).toBe('GEO');
    });

    it('should create a treasure with QR unlock', async () => {
      treasure = await treasureService.createTreasure({
        creatorId: creator.id,
        amount: 100,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
        unlockMethod: 'QR',
        invitedUsers: [finder.id],
      });

      expect(treasure).toHaveProperty('qrCode');
    });

    it('should create a treasure with code unlock', async () => {
      treasure = await treasureService.createTreasure({
        creatorId: creator.id,
        amount: 100,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
        unlockMethod: 'CODE',
        invitedUsers: [finder.id],
      });

      expect(treasure).toHaveProperty('unlockCode');
    });
  });

  describe('Treasure Unlocking', () => {
    beforeEach(async () => {
      treasure = await treasureService.createTreasure({
        creatorId: creator.id,
        amount: 100,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
        unlockMethod: 'GEO',
        invitedUsers: [finder.id],
      });
    });

    it('should unlock treasure with correct location', async () => {
      const result = await treasureService.unlockTreasure({
        treasureId: treasure.id,
        finderId: finder.id,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
      });

      expect(result.claimed).toBe(true);
      expect(result.finderId).toBe(finder.id);
    });

    it('should prevent unlocking by non-invited user', async () => {
      const nonInvitedUser = await prisma.user.create({
        data: {
          email: `noninvited${Date.now()}@example.com`,
          phone: `+212${Math.floor(Math.random() * 1000000000)}`,
          password: 'hashedPassword',
        },
      });

      await expect(treasureService.unlockTreasure({
        treasureId: treasure.id,
        finderId: nonInvitedUser.id,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
      })).rejects.toThrow(new AppError(403, 'User not invited to treasure', 'NOT_INVITED'));
    });

    it('should prevent unlocking with incorrect location', async () => {
      await expect(treasureService.unlockTreasure({
        treasureId: treasure.id,
        finderId: finder.id,
        location: {
          latitude: 34.5731,
          longitude: -6.5898,
        },
      })).rejects.toThrow(new AppError(400, 'Location not within range', 'LOCATION_OUT_OF_RANGE'));
    });
  });

  describe('Treasure Expiration', () => {
    it('should expire treasure after specified time', async () => {
      treasure = await treasureService.createTreasure({
        creatorId: creator.id,
        amount: 100,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
        unlockMethod: 'GEO',
        invitedUsers: [finder.id],
        expiryHours: 1,
      });

      // Fast forward time
      jest.advanceTimersByTime(3600000);

      await expect(treasureService.unlockTreasure({
        treasureId: treasure.id,
        finderId: finder.id,
        location: {
          latitude: 33.5731,
          longitude: -7.5898,
        },
      })).rejects.toThrow(new AppError(400, 'Treasure has expired', 'TREASURE_EXPIRED'));
    });
  });
}); 