import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { getEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { registerCors } from './plugins/cors.js';
import { registerJwt } from './plugins/jwt.js';
import { registerSocket } from './plugins/socket.js';
import { registerRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';
import { AppError } from './utils/errors.js';

export async function buildApp() {
  const app = Fastify({ logger: false });

  // Security
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Plugins
  await registerCors(app);
  await registerJwt(app);

  // Routes
  await registerRoutes(app);

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
      return;
    }

    // Fastify validation errors
    const err = error as Record<string, unknown>;
    if (err.validation) {
      reply.status(400).send({ error: 'Validation error', details: err.validation });
      return;
    }

    logger.error({ err: error }, 'Unhandled error');
    reply.status(500).send({ error: 'Internal server error' });
  });

  return app;
}

async function start() {
  const env = getEnv();

  await connectDatabase(env.MONGODB_URI);

  const app = await buildApp();

  // Socket.IO (attach after server is ready)
  await registerSocket(app);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info(`Server listening on port ${env.PORT}`);
}

// Only start if this is the main module (not imported by tests)
const isMainModule = process.argv[1]?.includes('index');
if (isMainModule) {
  start().catch((err) => {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  });
}
