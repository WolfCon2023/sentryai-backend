import { FastifyInstance } from 'fastify';
import Run from '../models/Run.js';
import RunOutput from '../models/RunOutput.js';
import Deal from '../models/Deal.js';
import { authenticate } from '../middleware/auth.js';
import { getEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { exportService } from '../services/exportService.js';

const DEFAULT_AGENTS = [
  { id: 'hunter', name: 'Hunter', description: 'Contextualizing deal', status: 'pending' as const, progress: 0 },
  { id: 'digger', name: 'Digger', description: 'Public data research', status: 'pending' as const, progress: 0 },
  { id: 'quant', name: 'Quant', description: 'Financial extraction', status: 'pending' as const, progress: 0 },
  { id: 'skeptic', name: 'Skeptic', description: 'Risk identification', status: 'pending' as const, progress: 0 },
  { id: 'partner', name: 'Partner', description: 'Synthesis', status: 'pending' as const, progress: 0 },
];

export async function runRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/deals/:dealId/runs
  app.get<{
    Params: { dealId: string };
  }>('/deals/:dealId/runs', { preHandler: [authenticate] }, async (request, reply) => {
    const runs = await Run.find({ dealId: request.params.dealId }).sort({ startedAt: -1 });
    return reply.send(runs.map((r) => r.toJSON()));
  });

  // POST /api/deals/:dealId/run
  app.post<{
    Params: { dealId: string };
    Body: { type: 'quick' | 'full' };
  }>('/deals/:dealId/run', { preHandler: [authenticate] }, async (request, reply) => {
    const deal = await Deal.findById(request.params.dealId);
    if (!deal) {
      return reply.status(404).send({ error: 'Deal not found' });
    }

    const run = await Run.create({
      dealId: deal._id,
      type: request.body.type,
      status: 'running',
      progress: 0,
      agents: DEFAULT_AGENTS.map((a) => ({ ...a })),
      startedAt: new Date(),
      triggeredBy: request.user.userId,
    });

    // Update deal status
    deal.status = 'running';
    deal.updatedAt = new Date();
    await deal.save();

    // Call Python agent service
    const env = getEnv();
    try {
      const response = await fetch(`${env.AGENT_SERVICE_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: run._id.toString(),
          deal_id: deal._id.toString(),
          company_name: deal.companyName,
          company_url: deal.companyUrl,
          run_type: request.body.type,
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Agent service returned non-OK');
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to call agent service');
      // Don't fail the request — the run is created, agent service may come online
    }

    return reply.status(201).send(run.toJSON());
  });

  // GET /api/runs/:runId
  app.get<{
    Params: { runId: string };
  }>('/runs/:runId', { preHandler: [authenticate] }, async (request, reply) => {
    const run = await Run.findById(request.params.runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }
    return reply.send(run.toJSON());
  });

  // GET /api/runs/:runId/output
  app.get<{
    Params: { runId: string };
  }>('/runs/:runId/output', { preHandler: [authenticate] }, async (request, reply) => {
    const runOutput = await RunOutput.findOne({ runId: request.params.runId });
    if (!runOutput) {
      return reply.status(404).send({ error: 'Run output not found' });
    }
    return reply.send(runOutput.output);
  });

  // POST /api/runs/:runId/export
  app.post<{
    Params: { runId: string };
    Body: { format: 'pdf' | 'word' | 'markdown' };
  }>('/runs/:runId/export', { preHandler: [authenticate] }, async (request, reply) => {
    const runOutput = await RunOutput.findOne({ runId: request.params.runId });
    if (!runOutput) {
      return reply.status(404).send({ error: 'Run output not found' });
    }

    const output = runOutput.output as Record<string, unknown>;
    const { format } = request.body;

    switch (format) {
      case 'pdf': {
        const buffer = await exportService.generatePdf(output);
        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="${runOutput.companyName}-memo.pdf"`)
          .send(buffer);
      }
      case 'word': {
        const buffer = await exportService.generateDocx(output);
        return reply
          .header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
          .header('Content-Disposition', `attachment; filename="${runOutput.companyName}-memo.docx"`)
          .send(buffer);
      }
      case 'markdown': {
        const md = exportService.generateMarkdown(output);
        return reply
          .header('Content-Type', 'text/markdown')
          .header('Content-Disposition', `attachment; filename="${runOutput.companyName}-memo.md"`)
          .send(md);
      }
      default:
        return reply.status(400).send({ error: 'Invalid format. Use pdf, word, or markdown' });
    }
  });
}
