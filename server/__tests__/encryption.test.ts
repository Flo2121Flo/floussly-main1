import { encrypt, decrypt, hash, compare, generateKeyPair } from '../utils/encryption';
import { AppError } from '../utils/errors';

describe('Encryption System', () => {
  describe('Symmetric Encryption', () => {
    it('should encrypt and decrypt text', async () => {
      const text = 'Hello, this is a secret message!';
      const encrypted = await encrypt(text);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(text);
      expect(encrypted).not.toBe(text);
    });

    it('should handle empty string', async () => {
      const text = '';
      const encrypted = await encrypt(text);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should handle special characters', async () => {
      const text = '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      const encrypted = await encrypt(text);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should handle long text', async () => {
      const text = 'a'.repeat(10000);
      const encrypted = await encrypt(text);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(text);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'mySecretPassword123';
      const hashed = await hash(password);

      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
    });

    it('should verify correct password', async () => {
      const password = 'mySecretPassword123';
      const hashed = await hash(password);
      const isValid = await compare(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'mySecretPassword123';
      const hashed = await hash(password);
      const isValid = await compare('wrongPassword', hashed);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashed = await hash(password);
      const isValid = await compare(password, hashed);

      expect(isValid).toBe(true);
    });
  });

  describe('Asymmetric Encryption', () => {
    it('should generate key pair', async () => {
      const { publicKey, privateKey } = await generateKeyPair();

      expect(publicKey).toBeDefined();
      expect(privateKey).toBeDefined();
      expect(publicKey).not.toBe(privateKey);
    });

    it('should encrypt with public key and decrypt with private key', async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      const text = 'Secret message for asymmetric encryption';

      const encrypted = await encrypt(text, publicKey);
      const decrypted = await decrypt(encrypted, privateKey);

      expect(decrypted).toBe(text);
      expect(encrypted).not.toBe(text);
    });

    it('should not decrypt with wrong private key', async () => {
      const { publicKey } = await generateKeyPair();
      const { privateKey: wrongPrivateKey } = await generateKeyPair();
      const text = 'Secret message';

      const encrypted = await encrypt(text, publicKey);
      await expect(decrypt(encrypted, wrongPrivateKey)).rejects.toThrow(AppError);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid encrypted data', async () => {
      await expect(decrypt('invalid-data')).rejects.toThrow(AppError);
    });

    it('should handle invalid public key', async () => {
      const text = 'Secret message';
      await expect(encrypt(text, 'invalid-key')).rejects.toThrow(AppError);
    });

    it('should handle invalid private key', async () => {
      const { publicKey } = await generateKeyPair();
      const encrypted = await encrypt('Secret message', publicKey);
      await expect(decrypt(encrypted, 'invalid-key')).rejects.toThrow(AppError);
    });
  });

  describe('Performance', () => {
    it('should handle multiple encryption operations', async () => {
      const texts = Array(100).fill('Test message');
      const start = Date.now();

      const encrypted = await Promise.all(texts.map(text => encrypt(text)));
      const decrypted = await Promise.all(encrypted.map(text => decrypt(text)));

      const end = Date.now();
      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
      expect(decrypted.every(text => text === 'Test message')).toBe(true);
    });

    it('should handle multiple password hashes', async () => {
      const passwords = Array(100).fill('TestPassword123');
      const start = Date.now();

      const hashed = await Promise.all(passwords.map(password => hash(password)));
      const verified = await Promise.all(
        hashed.map((hash, i) => compare(passwords[i], hash))
      );

      const end = Date.now();
      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
      expect(verified.every(result => result === true)).toBe(true);
    });
  });
}); 