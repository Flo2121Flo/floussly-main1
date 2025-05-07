import { WebSocketService } from '../services/websocket';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';
import { Server } from 'ws';
import { createServer } from 'http';

describe('WebSocket System', () => {
  let wsService: WebSocketService;
  let httpServer: any;
  let wsServer: Server;
  let testUser: any;

  beforeEach(async () => {
    wsService = new WebSocketService();
    httpServer = createServer();
    wsServer = new Server({ server: httpServer });
    wsService.initialize(wsServer);

    testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });

    await new Promise((resolve) => httpServer.listen(0, resolve));
  });

  afterEach(async () => {
    await new Promise((resolve) => wsServer.close(resolve));
    await new Promise((resolve) => httpServer.close(resolve));
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('Connection Management', () => {
    it('should handle new connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('CONNECTED');
        ws.close();
        done();
      });
    });

    it('should handle disconnection', (done) => {
      const ws = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws.on('close', () => {
        expect(wsService.getConnectedUsers()).not.toContain(testUser.id);
        done();
      });

      ws.close();
    });
  });

  describe('Message Broadcasting', () => {
    it('should broadcast message to all users', (done) => {
      const ws1 = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      const ws2 = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      let receivedCount = 0;

      const handleMessage = (data: any) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('BROADCAST');
        expect(message.data).toBe('test message');
        receivedCount++;
        if (receivedCount === 2) {
          ws1.close();
          ws2.close();
          done();
        }
      };

      ws1.on('message', handleMessage);
      ws2.on('message', handleMessage);

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      setTimeout(() => {
        wsService.broadcast('test message');
      }, 100);
    });

    it('should send message to specific user', (done) => {
      const ws = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('DIRECT');
        expect(message.data).toBe('private message');
        ws.close();
        done();
      });

      setTimeout(() => {
        wsService.sendToUser(testUser.id, 'private message');
      }, 100);
    });
  });

  describe('Room Management', () => {
    it('should handle room joining', (done) => {
      const ws = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'CONNECTED') {
          ws.send(JSON.stringify({
            type: 'JOIN_ROOM',
            roomId: 'test-room',
          }));
        } else if (message.type === 'ROOM_JOINED') {
          expect(message.roomId).toBe('test-room');
          ws.close();
          done();
        }
      });
    });

    it('should handle room leaving', (done) => {
      const ws = new WebSocket(`ws://localhost:${httpServer.address().port}`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'AUTH',
          token: 'test-token',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'CONNECTED') {
          ws.send(JSON.stringify({
            type: 'JOIN_ROOM',
            roomId: 'test-room',
          }));
        } else if (message.type === 'ROOM_JOINED') {
          ws.send(JSON.stringify({
            type: 'LEAVE_ROOM',
            roomId: 'test-room',
          }));
        } else if (message.type === 'ROOM_LEFT') {
          expect(message.roomId).toBe('test-room');
          ws.close();
          done();
        }
      });
    });
  });
}); 