import { MessageService } from '../services/message';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Messaging System', () => {
  let messageService: MessageService;
  let sender: any;
  let receiver: any;

  beforeEach(async () => {
    messageService = new MessageService();
    sender = await prisma.user.create({
      data: {
        email: `sender${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
    receiver = await prisma.user.create({
      data: {
        email: `receiver${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
  });

  afterEach(async () => {
    await prisma.message.deleteMany();
    await prisma.user.deleteMany({
      where: { id: { in: [sender.id, receiver.id] } },
    });
  });

  describe('Message Sending', () => {
    it('should send text message', async () => {
      const message = await messageService.sendMessage({
        senderId: sender.id,
        receiverId: receiver.id,
        content: 'Hello!',
        type: 'TEXT',
      });

      expect(message).toHaveProperty('id');
      expect(message.content).toBe('Hello!');
      expect(message.type).toBe('TEXT');
    });

    it('should send voice message', async () => {
      const message = await messageService.sendMessage({
        senderId: sender.id,
        receiverId: receiver.id,
        content: 'voice-message-url',
        type: 'VOICE',
      });

      expect(message).toHaveProperty('id');
      expect(message.type).toBe('VOICE');
    });

    it('should send system message', async () => {
      const message = await messageService.sendMessage({
        senderId: 'SYSTEM',
        receiverId: receiver.id,
        content: 'System notification',
        type: 'SYSTEM',
      });

      expect(message).toHaveProperty('id');
      expect(message.type).toBe('SYSTEM');
    });
  });

  describe('Message Retrieval', () => {
    beforeEach(async () => {
      // Create some test messages
      await messageService.sendMessage({
        senderId: sender.id,
        receiverId: receiver.id,
        content: 'Message 1',
        type: 'TEXT',
      });
      await messageService.sendMessage({
        senderId: receiver.id,
        receiverId: sender.id,
        content: 'Message 2',
        type: 'TEXT',
      });
    });

    it('should get conversation history', async () => {
      const messages = await messageService.getConversation(sender.id, receiver.id);
      expect(messages).toHaveLength(2);
    });

    it('should get unread messages', async () => {
      const unread = await messageService.getUnreadMessages(receiver.id);
      expect(unread).toHaveLength(1);
    });
  });

  describe('Message Encryption', () => {
    it('should encrypt message content', async () => {
      const message = await messageService.sendMessage({
        senderId: sender.id,
        receiverId: receiver.id,
        content: 'Secret message',
        type: 'TEXT',
      });

      const storedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });

      expect(storedMessage.content).not.toBe('Secret message');
      expect(storedMessage.content).toMatch(/^encrypted:/);
    });
  });

  describe('Rate Limiting', () => {
    it('should prevent message spam', async () => {
      const messages = Array(100).fill(null).map(() => ({
        senderId: sender.id,
        receiverId: receiver.id,
        content: 'Spam message',
        type: 'TEXT',
      }));

      await expect(Promise.all(messages.map(msg => messageService.sendMessage(msg))))
        .rejects
        .toThrow(new AppError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED'));
    });
  });
}); 