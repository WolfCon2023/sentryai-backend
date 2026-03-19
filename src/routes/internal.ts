import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Run from '../models/Run.js';
import RunOutput from '../models/RunOutput.js';
import Deal from '../models/Deal.js';
import { getEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getIO } from '../plugins/socket.js';
import { AgentStatus } from '../types/index.js';

async function verifyInternalKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = getEnv();
  const apiKey = request.headers['x-internal-api-key'];
  if (apiKey !== env.INTERNAL_API_KEY) {
    reply.status(401).send({ error: 'Invalid internal API key' });
  }
}

function emitToRoom(dealId: string, event: string, data: unknown): void {
  try {
    const io = getIO();
    io.to(`deal-${dealId}`).emit(event, data);
  } catch {
    // Socket.IO may not be initialized
  }
}

export async function internalRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', verifyInternalKey);

  // POST /api/internal/progress
  app.post<{
    Body: {
      runId: string;
      agentId: string;
      agentName?: string;
      status: AgentStatus;
      progress: number;
    };
  }>('/progress', async (request, reply) => {
    const { runId, agentId, status, progress } = request.body;

    const run = await Run.findById(runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }

    // Update agent in run
    const agent = run.agents.find((a) => a.id === agentId);
    if (agent) {
      agent.status = status;
      agent.progress = progress;
    }

    // Calculate overall progress
    const totalProgress = run.agents.reduce((sum, a) => sum + a.progress, 0);
    run.progress = Math.round(totalProgress / run.agents.length);

    await run.save();

    // Emit Socket.IO event
    const dealId = run.dealId.toString();
    if (status === 'running' && progress === 0) {
      emitToRoom(dealId, 'run:agent-started', { runId, agentId, name: request.body.agentName || agentId });
    } else if (status === 'complete') {
      emitToRoom(dealId, 'run:agent-completed', { runId, agentId });
    } else {
      emitToRoom(dealId, 'run:agent-progress', { runId, agentId, progress });
    }

    return reply.send({ ok: true });
  });

  // POST /api/internal/run-complete
  app.post<{
    Body: {
      runId: string;
      dealId: string;
      output: Record<string, unknown>;
    };
  }>('/run-complete', async (request, reply) => {
    const { runId, dealId, output } = request.body;

    const run = await Run.findById(runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return reply.status(404).send({ error: 'Deal not found' });
    }

    // Determine output type and build frontend-compatible response
    const runType = run.type;
    const partnerOutput = output as Record<string, unknown>;
    let memoOutput: Record<string, unknown>;
    let confidence = 0;

    if (runType === 'quick' && partnerOutput.quick_snapshot) {
      const snapshot = partnerOutput.quick_snapshot as Record<string, unknown>;
      confidence = (snapshot.overall_confidence as number) || 0;
      memoOutput = {
        id: `snapshot-${runId}`,
        runId,
        dealId,
        companyName: deal.companyName,
        generatedAt: new Date().toISOString(),
        summary: snapshot.summary,
        marketBullets: snapshot.market_bullets,
        keyMetrics: snapshot.key_metrics,
        topRisks: snapshot.top_risks,
        diligenceQuestions: snapshot.diligence_questions,
        overallConfidence: confidence,
      };
    } else if (partnerOutput.investment_memo) {
      const memo = partnerOutput.investment_memo as Record<string, unknown>;
      confidence = (memo.overall_confidence as number) || 0;
      memoOutput = {
        id: `memo-${runId}`,
        runId,
        dealId,
        companyName: deal.companyName,
        type: 'full',
        generatedAt: new Date().toISOString(),
        sections: memo.sections,
        overallConfidence: confidence,
      };
    } else {
      memoOutput = { ...output, runId, dealId, companyName: deal.companyName };
    }

    // Save RunOutput
    await RunOutput.create({
      runId: run._id,
      dealId: deal._id,
      companyName: deal.companyName,
      type: runType,
      output: memoOutput,
      overallConfidence: confidence,
      generatedAt: new Date(),
    });

    // Update Run
    run.status = 'completed';
    run.completedAt = new Date();
    run.duration = Math.round((run.completedAt.getTime() - run.startedAt.getTime()) / 1000);
    run.progress = 100;
    for (const agent of run.agents) {
      agent.status = 'complete';
      agent.progress = 100;
    }
    await run.save();

    // Update Deal
    deal.status = 'memo-ready';
    deal.lastRunAt = new Date();
    deal.updatedAt = new Date();
    await deal.save();

    emitToRoom(dealId, 'run:completed', { runId, dealId });

    logger.info({ runId, dealId }, 'Run completed');
    return reply.send({ ok: true });
  });

  // POST /api/internal/run-error
  app.post<{
    Body: { runId: string; error: string };
  }>('/run-error', async (request, reply) => {
    const { runId, error } = request.body;

    const run = await Run.findById(runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }

    run.status = 'failed';
    run.completedAt = new Date();
    await run.save();

    // Reset deal status
    const deal = await Deal.findById(run.dealId);
    if (deal && deal.status === 'running') {
      deal.status = 'needs-review';
      await deal.save();
    }

    emitToRoom(run.dealId.toString(), 'run:error', { runId, error });

    logger.error({ runId, error }, 'Run failed');
    return reply.send({ ok: true });
  });
}
