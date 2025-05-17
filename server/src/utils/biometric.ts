import crypto from 'crypto';
import { redis } from './redis';
import { logger } from './logger';

interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice';
  data: string;
  signature: string;
}

export const validateBiometricData = async (
  userId: string,
  biometricData: BiometricData
): Promise<boolean> => {
  try {
    // Verify biometric data format
    if (!isValidBiometricFormat(biometricData)) {
      logger.warn('Invalid biometric data format', { userId });
      return false;
    }

    // Get stored biometric template
    const storedTemplate = await redis.get(`biometric:${userId}:${biometricData.type}`);
    if (!storedTemplate) {
      logger.warn('No stored biometric template found', { userId, type: biometricData.type });
      return false;
    }

    // Verify signature
    if (!verifySignature(biometricData.data, biometricData.signature)) {
      logger.warn('Invalid biometric signature', { userId });
      return false;
    }

    // Compare biometric data with stored template
    const similarity = compareBiometricData(biometricData.data, storedTemplate);
    const threshold = getThresholdForType(biometricData.type);

    return similarity >= threshold;
  } catch (error) {
    logger.error('Biometric validation error', {
      error: error.message,
      userId,
      type: biometricData.type
    });
    return false;
  }
};

const isValidBiometricFormat = (data: BiometricData): boolean => {
  const validTypes = ['fingerprint', 'face', 'voice'];
  return (
    validTypes.includes(data.type) &&
    typeof data.data === 'string' &&
    typeof data.signature === 'string' &&
    data.data.length > 0 &&
    data.signature.length > 0
  );
};

const verifySignature = (data: string, signature: string): boolean => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.BIOMETRIC_SECRET!);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Signature verification error', { error: error.message });
    return false;
  }
};

const compareBiometricData = (data1: string, data2: string): number => {
  // Implement biometric comparison algorithm
  // This is a placeholder - in production, use a proper biometric comparison library
  const similarity = calculateSimilarity(data1, data2);
  return similarity;
};

const calculateSimilarity = (data1: string, data2: string): number => {
  // Placeholder for actual biometric comparison
  // In production, this would use proper biometric comparison algorithms
  return 0.95; // Simulated high similarity
};

const getThresholdForType = (type: string): number => {
  const thresholds = {
    fingerprint: 0.95,
    face: 0.90,
    voice: 0.85
  };
  return thresholds[type as keyof typeof thresholds] || 0.95;
};

export const storeBiometricTemplate = async (
  userId: string,
  type: string,
  template: string
): Promise<boolean> => {
  try {
    await redis.set(`biometric:${userId}:${type}`, template);
    return true;
  } catch (error) {
    logger.error('Error storing biometric template', {
      error: error.message,
      userId,
      type
    });
    return false;
  }
};

export const deleteBiometricTemplate = async (
  userId: string,
  type: string
): Promise<boolean> => {
  try {
    await redis.del(`biometric:${userId}:${type}`);
    return true;
  } catch (error) {
    logger.error('Error deleting biometric template', {
      error: error.message,
      userId,
      type
    });
    return false;
  }
}; 