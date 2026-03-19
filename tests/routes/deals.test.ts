import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser, getAuthHeaders } from '../helpers.js';
import { FastifyInstance } from 'fastify';

describe('Deal Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('POST /api/deals', () => {
    it('should create a deal', async () => {
      const user = await createTestUser('admin');
      const headers = await getAuthHeaders(app, user.id, user.role);

      const res = await app.inject({
        method: 'POST',
        url: '/api/deals',
        headers,
        payload: {
          companyName: 'TestCo',
          companyUrl: 'https://testco.com',
          sector: 'b2b-saas',
          stage: 'preliminary',
          notes: 'Test deal',
        },
      });
      expect(res.statusCode).toBe(201);
      const deal = res.json();
      expect(deal.companyName).toBe('TestCo');
      expect(deal.status).toBe('idle');
      expect(deal.id).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const user = await createTestUser('admin');
      const headers = await getAuthHeaders(app, user.id, user.role);

      const res = await app.inject({
        method: 'POST',
        url: '/api/deals',
        headers,
        payload: { companyName: 'TestCo' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/deals', () => {
    it('should list deals', async () => {
      const user = await createTestUser('admin');
      const headers = await getAuthHeaders(app, user.id, user.role);

      // Create a deal first
      await app.inject({
        method: 'POST',
        url: '/api/deals',
        headers,
        payload: { companyName: 'TestCo', companyUrl: 'https://testco.com', sector: 'b2b-saas', stage: 'preliminary' },
      });

      const res = await app.inject({ method: 'GET', url: '/api/deals', headers });
      expect(res.statusCode).toBe(200);
      expect(res.json().length).toBe(1);
    });
  });

  describe('GET /api/deals/:dealId', () => {
    it('should get a single deal', async () => {
      const user = await createTestUser('admin');
      const headers = await getAuthHeaders(app, user.id, user.role);

      const createRes = await app.inject({
        method: 'POST',
        url: '/api/deals',
        headers,
        payload: { companyName: 'TestCo', companyUrl: 'https://testco.com', sector: 'b2b-saas', stage: 'diligence' },
      });
      const dealId = createRes.json().id;

      const res = await app.inject({ method: 'GET', url: `/api/deals/${dealId}`, headers });
      expect(res.statusCode).toBe(200);
      expect(res.json().companyName).toBe('TestCo');
    });

    it('should return 404 for missing deal', async () => {
      const user = await createTestUser('admin');
      const headers = await getAuthHeaders(app, user.id, user.role);

      const res = await app.inject({
        method: 'GET',
        url: '/api/deals/000000000000000000000000',
        headers,
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
