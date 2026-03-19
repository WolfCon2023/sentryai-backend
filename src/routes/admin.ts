import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // All admin routes require admin role
  app.addHook('preHandler', requireAdmin);

  // POST /api/admin/users
  app.post<{
    Body: { email: string; name: string; password: string; role: UserRole };
  }>('/users', async (request, reply) => {
    const { email, name, password, role } = request.body;

    if (!email || !name || !password) {
      return reply.status(400).send({ error: 'Email, name, and password are required' });
    }

    if (password.length < 4) {
      return reply.status(400).send({ error: 'Password must be at least 4 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return reply.status(409).send({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: role || 'viewer',
      isActive: true,
    });

    return reply.status(201).send(user.toJSON());
  });

  // GET /api/admin/users
  app.get('/users', async (_request, reply) => {
    const users = await User.find().sort({ createdAt: -1 });
    return reply.send(users.map((u) => u.toJSON()));
  });

  // PATCH /api/admin/users/:userId
  app.patch<{
    Params: { userId: string };
    Body: { role?: UserRole; isActive?: boolean };
  }>('/users/:userId', async (request, reply) => {
    const { userId } = request.params;
    const { role, isActive } = request.body;

    const user = await User.findById(userId);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    return reply.send(user.toJSON());
  });
}
