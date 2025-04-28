import { paymentService } from '../payment';
import { DatabaseService } from '../../database/db';
import { RedisService } from '../../redis/redis';

jest.mock('../../database/db');
jest.mock('../../redis/redis');

describe('PaymentService', () => {
  let mockDb: jest.Mocked<DatabaseService>;
  let mockRedis: jest.Mocked<RedisService>;

  beforeEach(() => {
    mockDb = DatabaseService.getInstance() as jest.Mocked<DatabaseService>;
    mockRedis = RedisService.getInstance() as jest.Mocked<RedisService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD',
        description: 'Test payment',
      };

      const mockPayment = {
        id: 'test-id',
        ...paymentData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockPayment] });
      mockRedis.hset.mockResolvedValueOnce('OK');

      const result = await paymentService.createPayment(paymentData);

      expect(result).toEqual(mockPayment);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.hset).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPayment', () => {
    it('should get payment from Redis if available', async () => {
      const mockPayment = {
        id: 'test-id',
        amount: 100,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedis.hgetall.mockResolvedValueOnce(mockPayment);

      const result = await paymentService.getPayment('test-id');

      expect(result).toEqual(mockPayment);
      expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('should get payment from database if not in Redis', async () => {
      const mockPayment = {
        id: 'test-id',
        amount: 100,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedis.hgetall.mockResolvedValueOnce({});
      mockDb.query.mockResolvedValueOnce({ rows: [mockPayment] });
      mockRedis.hset.mockResolvedValueOnce('OK');

      const result = await paymentService.getPayment('test-id');

      expect(result).toEqual(mockPayment);
      expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.hset).toHaveBeenCalledTimes(1);
    });

    it('should return null if payment not found', async () => {
      mockRedis.hgetall.mockResolvedValueOnce({});
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await paymentService.getPayment('test-id');

      expect(result).toBeNull();
      expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });
  });

  describe('updatePayment', () => {
    it('should update payment status successfully', async () => {
      const mockPayment = {
        id: 'test-id',
        amount: 100,
        currency: 'USD',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockPayment] });
      mockRedis.hset.mockResolvedValueOnce('OK');

      const result = await paymentService.updatePayment('test-id', 'completed');

      expect(result).toEqual(mockPayment);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.hset).toHaveBeenCalledTimes(1);
    });

    it('should return null if payment not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await paymentService.updatePayment('test-id', 'completed');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });
  });

  describe('deletePayment', () => {
    it('should delete payment successfully', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
      mockRedis.del.mockResolvedValueOnce(1);

      const result = await paymentService.deletePayment('test-id');

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
    });

    it('should return false if payment not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });
      mockRedis.del.mockResolvedValueOnce(1);

      const result = await paymentService.deletePayment('test-id');

      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
    });
  });
}); 