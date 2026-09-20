// Edge / Serverless Sliding Window Rate Limiter

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();
const adminFailedAttemptsMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically (every 100 checks)
let checkCounter = 0;
function cleanupStaleRecords() {
  const now = Date.now();
  for (const [ip, rec] of ipRequestMap.entries()) {
    if (now > rec.resetAt) ipRequestMap.delete(ip);
  }
  for (const [ip, rec] of adminFailedAttemptsMap.entries()) {
    if (now > rec.resetAt) adminFailedAttemptsMap.delete(ip);
  }
}

/**
 * Extract client IP from Cloudflare Request headers
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown-ip'
  );
}

/**
 * Rate limit public analytics ingestion (/api/track)
 * Default limit: 60 requests per 60 seconds per IP
 */
export function checkAnalyticsRateLimit(request: Request, maxRequests = 60, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  if (++checkCounter % 100 === 0) cleanupStaleRecords();

  const ip = getClientIp(request);
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  record.count++;
  return { allowed: true };
}

/**
 * Rate limit failed admin logins (/api/admin/auth)
 * Max failed attempts: 5 per 5 minutes per IP
 */
export function checkAdminAuthRateLimit(request: Request, maxFailed = 5, windowMs = 300000): { allowed: boolean; retryAfter?: number } {
  if (++checkCounter % 100 === 0) cleanupStaleRecords();

  const ip = getClientIp(request);
  const now = Date.now();
  const record = adminFailedAttemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    return { allowed: true };
  }

  if (record.count >= maxFailed) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  return { allowed: true };
}

export function recordAdminAuthFailure(request: Request, windowMs = 300000) {
  const ip = getClientIp(request);
  const now = Date.now();
  const record = adminFailedAttemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    adminFailedAttemptsMap.set(ip, { count: 1, resetAt: now + windowMs });
  } else {
    record.count++;
  }
}

export function resetAdminAuthFailures(request: Request) {
  const ip = getClientIp(request);
  adminFailedAttemptsMap.delete(ip);
}
