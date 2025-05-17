import crypto from 'crypto';

export const generateMFACode = (): string => {
  // Generate a 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  return code;
};

export const validateMFACode = (code: string): boolean => {
  // Validate code format
  return /^\d{6}$/.test(code);
};

export const generateMFASecret = (): string => {
  // Generate a base32-encoded secret for TOTP
  const secret = crypto.randomBytes(20).toString('base32');
  return secret;
};

export const generateTOTP = (secret: string): string => {
  // Generate Time-based One-Time Password
  const counter = Math.floor(Date.now() / 30000); // 30-second window
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = ((hmacResult[offset] & 0x7f) << 24 |
    (hmacResult[offset + 1] & 0xff) << 16 |
    (hmacResult[offset + 2] & 0xff) << 8 |
    (hmacResult[offset + 3] & 0xff)) % 1000000;

  return code.toString().padStart(6, '0');
};

export const verifyTOTP = (secret: string, code: string): boolean => {
  const generatedCode = generateTOTP(secret);
  return generatedCode === code;
}; 