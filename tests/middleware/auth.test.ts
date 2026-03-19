import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser, getAuthHeaders } from '../helpers.js';
import { FastifyInstance } from 'fastify';

describe('Auth Middleware', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApp();
  });

  it('should reject requests without a token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/deals' });
    expect(res.statusCode).toBe(401);
  });

  it('should reject requests with an invalid token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/deals',
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('should accept requests with a valid token', async () => {
    const user = await createTestUser('admin');
    const headers = await getAuthHeaders(app, user.id, user.role);
    const res = await app.inject({ method: 'GET', url: '/api/deals', headers });
    expect(res.statusCode).toBe(200);
  });

  it('should reject expired tokens', async () => {
    const user = await createTestUser('admin');
    const expiredToken = app.jwt.sign(
      { userId: user.id, role: user.role },
      { expiresIn: '1s' },
    );
    // Wait for token to expire
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const res = await app.inject({
      method: 'GET',
      url: '/api/deals',
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    expect(res.statusCode).toBe(401);
  });
});
