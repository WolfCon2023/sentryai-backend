import { FastifyInstance } from 'fastify';
import Deal from '../models/Deal.js';
import DealFile from '../models/DealFile.js';
import Run from '../models/Run.js';
import RunOutput from '../models/RunOutput.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { r2Service } from '../services/r2Service.js';
import { pineconeService } from '../services/pineconeService.js';
import { DealStage } from '../types/index.js';

export async function dealRoutes(app: FastifyInstance): Promise<void> {
  // All deal routes require auth
  app.addHook('preHandler', authenticate);

  // GET /api/deals
  app.get<{
    Querystring: { ownerId?: string };
  }>('/', async (request, reply) => {
    const filter: Record<string, unknown> = {};
    if (request.query.ownerId) {
      filter.ownerId = request.query.ownerId;
    }

    const deals = await Deal.find(filter).sort({ updatedAt: -1 });
    return reply.send(deals.map((d) => d.toJSON()));
  });

  // POST /api/deals
  app.post<{
    Body: {
      companyName: string;
      companyUrl: string;
      sector: string;
      stage: DealStage;
      notes?: string;
    };
  }>('/', async (request, reply) => {
    const { companyName, companyUrl, sector, stage, notes } = request.body;

    if (!companyName || !companyUrl || !sector || !stage) {
      return reply.status(400).send({ error: 'companyName, companyUrl, sector, and stage are required' });
    }

    // Get owner info from JWT
    const owner = await import('../models/User.js').then((m) =>
      m.default.findById(request.user.userId),
    );
    if (!owner) {
      return reply.status(401).send({ error: 'User not found' });
    }

    const deal = await Deal.create({
      companyName,
      companyUrl,
      sector,
      stage,
      notes,
      status: 'idle',
      ownerId: owner._id,
      ownerName: owner.name,
    });

    return reply.status(201).send(deal.toJSON());
  });

  // GET /api/deals/:dealId
  app.get<{
    Params: { dealId: string };
  }>('/:dealId', async (request, reply) => {
    const deal = await Deal.findById(request.params.dealId);
    if (!deal) {
      return reply.status(404).send({ error: 'Deal not found' });
    }
    return reply.send(deal.toJSON());
  });

  // DELETE /api/deals/:dealId (admin only)
  app.delete<{
    Params: { dealId: string };
  }>('/:dealId', { preHandler: [requireAdmin] }, async (request, reply) => {
    const deal = await Deal.findById(request.params.dealId);
    if (!deal) {
      return reply.status(404).send({ error: 'Deal not found' });
    }

    // Clean up related data
    await Promise.all([
      DealFile.deleteMany({ dealId: deal._id }),
      Run.deleteMany({ dealId: deal._id }),
      RunOutput.deleteMany({ dealId: deal._id }),
      r2Service.deleteDealFiles(deal._id.toString()).catch(() => {}),
      pineconeService.deleteNamespace(`deal-${deal._id.toString()}`).catch(() => {}),
    ]);

    await deal.deleteOne();
    return reply.status(204).send();
  });
}
