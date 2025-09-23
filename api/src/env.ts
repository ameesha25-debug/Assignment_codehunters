import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`❌ Missing required environment variable: ${key}`);
  return value;
}

export const ENV = {
  // Required for Supabase
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Optional anon key (not required if not used)
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',

  // Auth
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // CORS origin for cookie auth
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  // Server
  PORT: Number(process.env.PORT ?? 4000),
  BASE_URL: process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,

  // DB
  DB_URL: process.env.DATABASE_URL ?? '',
};
