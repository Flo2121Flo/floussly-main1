import { TranslationService } from '../services/translation';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Translation System', () => {
  let translationService: TranslationService;
  let testUser: any;

  beforeEach(async () => {
    translationService = new TranslationService();
    testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
        language: 'en',
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('Language Management', () => {
    it('should update user language', async () => {
      await translationService.updateUserLanguage(testUser.id, 'fr');
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser!.language).toBe('fr');
    });

    it('should get user language', async () => {
      const language = await translationService.getUserLanguage(testUser.id);
      expect(language).toBe('en');
    });
  });

  describe('Translation Operations', () => {
    it('should translate text', async () => {
      const text = 'Hello, how are you?';
      const translation = await translationService.translate(text, 'en', 'fr');
      expect(translation).toBeDefined();
      expect(translation).not.toBe(text);
    });

    it('should translate multiple texts', async () => {
      const texts = ['Hello', 'Goodbye', 'Thank you'];
      const translations = await translationService.translateMany(texts, 'en', 'fr');
      expect(translations).toHaveLength(3);
      expect(translations.every(t => typeof t === 'string')).toBe(true);
    });

    it('should detect language', async () => {
      const text = 'Bonjour, comment allez-vous?';
      const detected = await translationService.detectLanguage(text);
      expect(detected).toBe('fr');
    });
  });

  describe('Caching', () => {
    it('should cache translations', async () => {
      const text = 'Hello, world!';
      const translation1 = await translationService.translate(text, 'en', 'fr');
      const translation2 = await translationService.translate(text, 'en', 'fr');
      
      expect(translation1).toBe(translation2);
      const cached = await redis.get(`translation:en:fr:${text}`);
      expect(cached).toBeDefined();
    });

    it('should use cached translations', async () => {
      const text = 'Hello, world!';
      await redis.set(`translation:en:fr:${text}`, 'Bonjour, monde!');
      
      const translation = await translationService.translate(text, 'en', 'fr');
      expect(translation).toBe('Bonjour, monde!');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid language codes', async () => {
      await expect(
        translationService.translate('Hello', 'en', 'invalid')
      ).rejects.toThrow(AppError);
    });

    it('should handle empty text', async () => {
      await expect(
        translationService.translate('', 'en', 'fr')
      ).rejects.toThrow(AppError);
    });
  });

  describe('Batch Operations', () => {
    it('should translate messages in batch', async () => {
      const messages = [
        { id: '1', text: 'Hello' },
        { id: '2', text: 'Goodbye' },
        { id: '3', text: 'Thank you' },
      ];

      const translations = await translationService.translateMessages(messages, 'en', 'fr');
      expect(translations).toHaveLength(3);
      expect(translations.every(t => t.id && t.translation)).toBe(true);
    });

    it('should handle partial failures in batch translation', async () => {
      const messages = [
        { id: '1', text: 'Hello' },
        { id: '2', text: '' }, // Invalid message
        { id: '3', text: 'Thank you' },
      ];

      const translations = await translationService.translateMessages(messages, 'en', 'fr');
      expect(translations).toHaveLength(2); // Only valid messages
      expect(translations.find(t => t.id === '2')).toBeUndefined();
    });
  });
}); 