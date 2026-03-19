import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser, getAuthHeaders } from '../helpers.js';
import { FastifyInstance } from 'fastify';

describe('Auth Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser('admin', 'admin@test.com');
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.com', password: 'testpass123' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.user.email).toBe('admin@test.com');
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await createTestUser('admin', 'admin@test.com');
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.com', password: 'wrong' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject unknown email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'noone@test.com', password: 'testpass123' },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const user = await createTestUser('admin', 'me@test.com');
      const headers = await getAuthHeaders(app, user.id, user.role);
      const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers });
      expect(res.statusCode).toBe(200);
      expect(res.json().email).toBe('me@test.com');
    });

    it('should reject without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
      expect(res.statusCode).toBe(401);
    });
  });
});
