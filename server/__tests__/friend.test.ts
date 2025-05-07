import { FriendService } from '../services/friend';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Friend System', () => {
  let friendService: FriendService;
  let user1: any;
  let user2: any;

  beforeEach(async () => {
    friendService = new FriendService();
    user1 = await prisma.user.create({
      data: {
        email: `user1${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
    user2 = await prisma.user.create({
      data: {
        email: `user2${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
  });

  afterEach(async () => {
    await prisma.friendRequest.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id] } },
    });
  });

  describe('Friend Requests', () => {
    it('should send friend request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      expect(request).toHaveProperty('id');
      expect(request.status).toBe('PENDING');
    });

    it('should accept friend request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      const accepted = await friendService.acceptFriendRequest(request.id);
      expect(accepted.status).toBe('ACCEPTED');
    });

    it('should reject friend request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      const rejected = await friendService.rejectFriendRequest(request.id);
      expect(rejected.status).toBe('REJECTED');
    });
  });

  describe('Friend Management', () => {
    beforeEach(async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id);
    });

    it('should get friend list', async () => {
      const friends = await friendService.getFriends(user1.id);
      expect(friends).toHaveLength(1);
      expect(friends[0].id).toBe(user2.id);
    });

    it('should remove friend', async () => {
      await friendService.removeFriend(user1.id, user2.id);
      const friends = await friendService.getFriends(user1.id);
      expect(friends).toHaveLength(0);
    });
  });

  describe('Friend Suggestions', () => {
    it('should suggest friends based on mutual connections', async () => {
      const user3 = await prisma.user.create({
        data: {
          email: `user3${Date.now()}@example.com`,
          phone: `+212${Math.floor(Math.random() * 1000000000)}`,
          password: 'hashedPassword',
        },
      });

      // Create mutual connection
      const request1 = await friendService.sendFriendRequest(user1.id, user3.id);
      await friendService.acceptFriendRequest(request1.id);
      const request2 = await friendService.sendFriendRequest(user2.id, user3.id);
      await friendService.acceptFriendRequest(request2.id);

      const suggestions = await friendService.getFriendSuggestions(user1.id);
      expect(suggestions).toContainEqual(expect.objectContaining({ id: user2.id }));
    });
  });
}); 