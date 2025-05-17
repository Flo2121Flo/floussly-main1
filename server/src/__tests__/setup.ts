import { redis } from '../db/redis';
import { pg } from '../db/pg';
import { logger } from '../utils/logger';

// Mock external services
jest.mock('../services/EmailService');
jest.mock('../services/SMSService');
jest.mock('../services/PushNotificationService');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/floussly_test';

  // Initialize test database
  try {
    await pg.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
  } catch (error) {
    logger.error('Failed to reset test database:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear Redis
  await redis.flushdb();

  // Clear database tables
  const tables = await pg.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  `);

  for (const { tablename } of tables.rows) {
    await pg.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
});

// Clean up after all tests
afterAll(async () => {
  await redis.quit();
  await pg.end();
});

// Global test utilities
global.createTestUser = async (userData = {}) => {
  const defaultData = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  const result = await pg.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      userData.email || defaultData.email,
      userData.password || defaultData.password,
      userData.firstName || defaultData.firstName,
      userData.lastName || defaultData.lastName
    ]
  );

  return result.rows[0];
};

global.createTestTransaction = async (userId: string, transactionData = {}) => {
  const defaultData = {
    amount: 100,
    type: 'TRANSFER',
    status: 'COMPLETED',
    description: 'Test transaction'
  };

  const result = await pg.query(
    `INSERT INTO transactions (user_id, amount, type, status, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      userId,
      transactionData.amount || defaultData.amount,
      transactionData.type || defaultData.type,
      transactionData.status || defaultData.status,
      transactionData.description || defaultData.description
    ]
  );

  return result.rows[0];
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  }
}); 