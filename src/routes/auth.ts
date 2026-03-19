import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { getEnv } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/login
  app.post<{
    Body: { email: string; password: string };
  }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const env = getEnv();
    const accessToken = app.jwt.sign(
      { userId: user._id.toString(), role: user.role },
      { expiresIn: '15m' },
    );
    const refreshToken = app.jwt.sign(
      { userId: user._id.toString(), role: user.role, type: 'refresh' },
      { expiresIn: '7d', key: env.JWT_REFRESH_SECRET },
    );

    return reply.send({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  });

  // POST /api/auth/refresh
  app.post<{
    Body: { refreshToken: string };
  }>('/refresh', async (request, reply) => {
    const { refreshToken } = request.body;
    if (!refreshToken) {
      return reply.status(400).send({ error: 'Refresh token required' });
    }

    const env = getEnv();
    try {
      const decoded = app.jwt.verify<{ userId: string; role: string; type: string }>(
        refreshToken,
        { key: env.JWT_REFRESH_SECRET },
      );

      if (decoded.type !== 'refresh') {
        return reply.status(401).send({ error: 'Invalid token type' });
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'User not found or inactive' });
      }

      const newAccessToken = app.jwt.sign(
        { userId: user._id.toString(), role: user.role },
        { expiresIn: '15m' },
      );
      const newRefreshToken = app.jwt.sign(
        { userId: user._id.toString(), role: user.role, type: 'refresh' },
        { expiresIn: '7d', key: env.JWT_REFRESH_SECRET },
      );

      return reply.send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    }
  });

  // GET /api/auth/me
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await User.findById(request.user.userId);
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'User not found' });
    }
    return reply.send(user.toJSON());
  });
}
