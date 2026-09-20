import { neon } from '@neondatabase/serverless';

export function getDb(env?: Record<string, any>) {
  const url = env?.DATABASE_URL;
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('DATABASE_URL environment variable is not configured');
  }
  return neon(url.trim());
}

export function publicCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

const ALLOWED_ADMIN_ORIGINS = [
  'https://sakinah-3ps.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173'
];

export function adminCorsHeaders(request?: Request) {
  const origin = request ? request.headers.get('origin') || '' : '';
  const isAllowed =
    ALLOWED_ADMIN_ORIGINS.includes(origin) ||
    (origin.endsWith('.sakinah-3ps.pages.dev') && origin.startsWith('https://'));
  const allowOrigin = isAllowed ? origin : 'https://sakinah-3ps.pages.dev';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

export const corsHeaders = publicCorsHeaders;

