import 'reflect-metadata';
import 'dotenv/config';
import { DbManager, getRedisClient } from './config';
import { buildContainer } from './infrastructure/di/container';
import { App } from './presentation/express/app';
import './infrastructure/jobs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerChatSocket } from './infrastructure/socket/chat.socket';
import { registerSocketAuth } from './infrastructure/socket/socket-auth.middleware';
import { registerCallSocket } from './infrastructure/socket/call.socket';

const PORT = parseInt(process.env.PORT ?? '3000');
async function bootstrap(): Promise<void> {
  console.log('[Server] Getting DB and Redis client instances...');
  const db = DbManager.getInstance();
  const redis = getRedisClient();
  try {
    console.log('[Server] Connecting to PostgreSQL database...');
    await db.$connect();
    console.log('[PostgreSQL] Connection verified');
  } catch (err) {
    console.error('[PostgreSQL] Failed to connect:', err);
    process.exit(1);
  }

  try {
    console.log('[Server] Pinging Redis...');
    await redis.ping();
    console.log('Redis Connection verified');
  } catch (err) {
    console.error('redis Failed to connect:', err);
    process.exit(1);
  }

  const io = new Server({
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  const container = buildContainer(db, redis, io);
  const app = new App(container).getServer();

  const httpServer = createServer(app);

  io.attach(httpServer);

  registerSocketAuth(io);
  registerChatSocket(io);
  registerCallSocket(io);
  httpServer.listen(PORT, () => {
    console.log(`[Server] Voymate API running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  });

  const shutdown = async () => {
    console.log(`shutting down gracefully...`);
    await redis.quit();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
