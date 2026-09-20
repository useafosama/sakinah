import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_iuWcTF9RV1GN@ep-dawn-base-b4hzad1t-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getDb(env?: Record<string, any>) {
  const url = (env && env.DATABASE_URL) || DEFAULT_DATABASE_URL;
  return neon(url);
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}
