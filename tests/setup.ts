import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-1234';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-1234';
  process.env.INTERNAL_API_KEY = 'test-internal-key-1234';
  process.env.CORS_ORIGIN = 'http://localhost:8080';
  process.env.AGENT_SERVICE_URL = 'http://localhost:8000';
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
