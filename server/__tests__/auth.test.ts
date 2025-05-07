import { AuthService } from '../services/auth';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';
import { hash, compare } from '../utils/encryption';

describe('Authentication System', () => {
  let authService: AuthService;
  let testUser: any;

  beforeEach(async () => {
    authService = new AuthService();
    testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: await hash('testPassword123'),
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('User Registration', () => {
    it('should register new user', async () => {
      const userData = {
        email: `new${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'newPassword123',
      };

      const user = await authService.register(userData);
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.phone).toBe(userData.phone);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: testUser.email,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'newPassword123',
      };

      await expect(authService.register(userData)).rejects.toThrow(AppError);
    });
  });

  describe('User Login', () => {
    it('should login with correct credentials', async () => {
      const { token, user } = await authService.login({
        email: testUser.email,
        password: 'testPassword123',
      });

      expect(token).toBeDefined();
      expect(user.id).toBe(testUser.id);
    });

    it('should reject login with incorrect password', async () => {
      await expect(
        authService.login({
          email: testUser.email,
          password: 'wrongPassword',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('Password Management', () => {
    it('should change password', async () => {
      const newPassword = 'newPassword123';
      await authService.changePassword(testUser.id, 'testPassword123', newPassword);

      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      const isNewPasswordValid = await compare(newPassword, updatedUser!.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      await expect(
        authService.changePassword(testUser.id, 'wrongPassword', 'newPassword123')
      ).rejects.toThrow(AppError);
    });
  });

  describe('Session Management', () => {
    it('should logout user', async () => {
      const { token } = await authService.login({
        email: testUser.email,
        password: 'testPassword123',
      });

      await authService.logout(token);
      const isTokenValid = await redis.get(`token:${token}`);
      expect(isTokenValid).toBeNull();
    });

    it('should refresh token', async () => {
      const { token } = await authService.login({
        email: testUser.email,
        password: 'testPassword123',
      });

      const { newToken } = await authService.refreshToken(token);
      expect(newToken).not.toBe(token);
      expect(newToken).toBeDefined();
    });
  });
}); 