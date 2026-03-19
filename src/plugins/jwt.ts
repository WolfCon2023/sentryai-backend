import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config/env.js';

export async function registerJwt(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '15m' },
  });
}
