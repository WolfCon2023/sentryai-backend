import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser, getAuthHeaders } from '../helpers.js';
import { FastifyInstance } from 'fastify';

describe('Admin Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('POST /api/admin/users', () => {
    it('should create a user when admin', async () => {
      const admin = await createTestUser('admin');
      const headers = await getAuthHeaders(app, admin.id, 'admin');

      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/users',
        headers,
        payload: { email: 'newuser@test.com', name: 'New User', password: 'pass1234', role: 'viewer' },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().email).toBe('newuser@test.com');
      expect(res.json().role).toBe('viewer');
    });

    it('should reject viewer creating users', async () => {
      const viewer = await createTestUser('viewer', 'viewer@test.com');
      const headers = await getAuthHeaders(app, viewer.id, 'viewer');

      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/users',
        headers,
        payload: { email: 'newuser@test.com', name: 'New User', password: 'pass1234', role: 'viewer' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('should reject duplicate email', async () => {
      const admin = await createTestUser('admin');
      const headers = await getAuthHeaders(app, admin.id, 'admin');

      await app.inject({
        method: 'POST',
        url: '/api/admin/users',
        headers,
        payload: { email: 'dup@test.com', name: 'User 1', password: 'pass1234', role: 'viewer' },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/users',
        headers,
        payload: { email: 'dup@test.com', name: 'User 2', password: 'pass1234', role: 'viewer' },
      });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should list all users when admin', async () => {
      const admin = await createTestUser('admin');
      const headers = await getAuthHeaders(app, admin.id, 'admin');

      const res = await app.inject({ method: 'GET', url: '/api/admin/users', headers });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.json())).toBe(true);
    });
  });
});
