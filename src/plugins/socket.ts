import { Server as SocketServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';

let io: SocketServer | null = null;

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export async function registerSocket(app: FastifyInstance): Promise<void> {
  const env = getEnv();

  io = new SocketServer(app.server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = app.jwt.verify<{ userId: string; role: string }>(token);
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ userId: socket.data.userId }, 'Socket connected');

    socket.on('join-deal', (dealId: string) => {
      socket.join(`deal-${dealId}`);
      logger.debug({ dealId, userId: socket.data.userId }, 'Joined deal room');
    });

    socket.on('leave-deal', (dealId: string) => {
      socket.leave(`deal-${dealId}`);
    });

    socket.on('disconnect', () => {
      logger.debug({ userId: socket.data.userId }, 'Socket disconnected');
    });
  });
}
