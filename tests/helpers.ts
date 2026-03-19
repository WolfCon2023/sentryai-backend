import { buildApp } from '../src/index.js';
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import { UserRole } from '../src/types/index.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function createTestUser(
  role: UserRole = 'admin',
  email = 'test@sentryai.com',
): Promise<{ id: string; email: string; role: UserRole }> {
  const passwordHash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    email,
    passwordHash,
    name: email.split('@')[0],
    role,
    isActive: true,
  });
  return { id: user._id.toString(), email: user.email, role: user.role };
}

export async function getAuthToken(
  app: FastifyInstance,
  userId: string,
  role: UserRole = 'admin',
): Promise<string> {
  return app.jwt.sign({ userId, role }, { expiresIn: '15m' });
}

export async function getAuthHeaders(
  app: FastifyInstance,
  userId: string,
  role: UserRole = 'admin',
): Promise<Record<string, string>> {
  const token = await getAuthToken(app, userId, role);
  return { Authorization: `Bearer ${token}` };
}
