import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config/env.js';

export async function registerCors(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
}
