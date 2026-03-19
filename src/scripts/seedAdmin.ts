import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { getEnv } from '../config/env.js';

async function seedAdmin() {
  const env = getEnv();

  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${env.SEED_ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  const admin = await User.create({
    email: env.SEED_ADMIN_EMAIL,
    name: 'Admin',
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log(`Admin user created: ${admin.email} (${admin._id})`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
