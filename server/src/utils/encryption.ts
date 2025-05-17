import crypto from 'crypto';
import { logger } from './logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Generate a random initialization vector
const generateIV = (): Buffer => {
  return crypto.randomBytes(IV_LENGTH);
};

// Generate a random salt
const generateSalt = (): Buffer => {
  return crypto.randomBytes(SALT_LENGTH);
};

// Derive encryption key using PBKDF2
const deriveKey = (salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(
    ENCRYPTION_KEY!,
    salt,
    100000, // Number of iterations
    32, // Key length
    'sha256'
  );
};

// Encrypt sensitive data
export const encryptSensitiveData = async (data: any): Promise<string> => {
  try {
    if (!data) return '';

    const iv = generateIV();
    const salt = generateSalt();
    const key = deriveKey(salt);

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    const jsonString = JSON.stringify(data);
    const encrypted = Buffer.concat([
      cipher.update(jsonString, 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Combine IV, salt, tag, and encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    
    return result.toString('base64');
  } catch (error) {
    logger.error('Error encrypting sensitive data', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to encrypt sensitive data');
  }
};

// Decrypt sensitive data
export const decryptSensitiveData = async (encryptedData: string): Promise<any> => {
  try {
    if (!encryptedData) return null;

    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract IV, salt, tag, and encrypted data
    const salt = buffer.slice(0, SALT_LENGTH);
    const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = deriveKey(salt);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    logger.error('Error decrypting sensitive data', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to decrypt sensitive data');
  }
};

// Hash sensitive data (one-way)
export const hashSensitiveData = async (data: string): Promise<string> => {
  try {
    if (!data) return '';

    const salt = generateSalt();
    const hash = crypto.pbkdf2Sync(
      data,
      salt,
      100000,
      64,
      'sha512'
    );

    return `${salt.toString('base64')}:${hash.toString('base64')}`;
  } catch (error) {
    logger.error('Error hashing sensitive data', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to hash sensitive data');
  }
};

// Verify hashed data
export const verifyHashedData = async (data: string, hashedData: string): Promise<boolean> => {
  try {
    if (!data || !hashedData) return false;

    const [saltBase64, hashBase64] = hashedData.split(':');
    const salt = Buffer.from(saltBase64, 'base64');
    const hash = Buffer.from(hashBase64, 'base64');

    const verifyHash = crypto.pbkdf2Sync(
      data,
      salt,
      100000,
      64,
      'sha512'
    );

    return crypto.timingSafeEqual(hash, verifyHash);
  } catch (error) {
    logger.error('Error verifying hashed data', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random number
export const generateSecureNumber = (min: number, max: number): number => {
  const range = max - min;
  const bytes = Math.ceil(Math.log2(range) / 8);
  const maxNum = Math.pow(256, bytes);
  const maxRange = maxNum - (maxNum % range);

  let value;
  do {
    value = parseInt(crypto.randomBytes(bytes).toString('hex'), 16);
  } while (value >= maxRange);

  return min + (value % range);
};

export default {
  encryptSensitiveData,
  decryptSensitiveData,
  hashSensitiveData,
  verifyHashedData,
  generateSecureToken,
  generateSecureNumber
}; 