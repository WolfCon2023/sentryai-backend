import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default('sentryai-vdr'),
  AGENT_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  INTERNAL_API_KEY: z.string().min(8),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@sentryai.com'),
  SEED_ADMIN_PASSWORD: z.string().min(4).default('admin1234'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
      process.exit(1);
    }
    _env = result.data;
  }
  return _env;
}
