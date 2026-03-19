import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.js';
import { adminRoutes } from './admin.js';
import { dealRoutes } from './deals.js';
import { fileRoutes } from './files.js';
import { runRoutes } from './runs.js';
import { internalRoutes } from './internal.js';
import { portfolioRoutes } from './portfolio.js';
import { healthRoutes } from './health.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(dealRoutes, { prefix: '/api/deals' });
  await app.register(fileRoutes, { prefix: '/api/deals' });
  await app.register(runRoutes, { prefix: '/api' });
  await app.register(internalRoutes, { prefix: '/api/internal' });
  await app.register(portfolioRoutes, { prefix: '/api/portfolio' });
  await app.register(healthRoutes, { prefix: '/api' });
}
