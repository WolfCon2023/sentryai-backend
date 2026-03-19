import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser } from '../helpers.js';
import { FastifyInstance } from 'fastify';
import Run from '../../src/models/Run.js';
import Deal from '../../src/models/Deal.js';

describe('Internal Routes', () => {
  let app: FastifyInstance;
  const INTERNAL_KEY = 'test-internal-key-1234';

  beforeEach(async () => {
    app = await createApp();
  });

  it('should reject requests without API key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/internal/progress',
      payload: { runId: 'test', agentId: 'hunter', status: 'running', progress: 50 },
    });
    expect(res.statusCode).toBe(401);
  });

  it('should reject requests with wrong API key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/internal/progress',
      headers: { 'x-internal-api-key': 'wrong-key' },
      payload: { runId: 'test', agentId: 'hunter', status: 'running', progress: 50 },
    });
    expect(res.statusCode).toBe(401);
  });

  describe('POST /api/internal/progress', () => {
    it('should update agent progress', async () => {
      const user = await createTestUser('admin');
      const deal = await Deal.create({
        companyName: 'TestCo',
        companyUrl: 'https://test.com',
        sector: 'b2b-saas',
        stage: 'diligence',
        status: 'running',
        ownerId: user.id,
        ownerName: 'Test',
      });
      const run = await Run.create({
        dealId: deal._id,
        type: 'quick',
        status: 'running',
        agents: [
          { id: 'hunter', name: 'Hunter', description: 'Contextualizing', status: 'pending', progress: 0 },
        ],
        triggeredBy: user.id,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/internal/progress',
        headers: { 'x-internal-api-key': INTERNAL_KEY },
        payload: { runId: run._id.toString(), agentId: 'hunter', status: 'running', progress: 50 },
      });
      expect(res.statusCode).toBe(200);

      const updated = await Run.findById(run._id);
      expect(updated?.agents[0].progress).toBe(50);
      expect(updated?.agents[0].status).toBe('running');
    });
  });
});
