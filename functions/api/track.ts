import { getDb, publicCorsHeaders } from '../_db';
import { checkAnalyticsRateLimit } from '../_rateLimit';

const ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;
const EVENT_NAME_REGEX = /^[a-z0-9_]{1,50}$/;
const SENSITIVE_KEY_PATTERNS = ['amount', 'money', 'email', 'phone', 'password', 'token', 'auth', 'secret', 'card', 'cvv', 'ssn'];

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: publicCorsHeaders()
  });
}

export async function onRequestPost(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;
  const headers = publicCorsHeaders();

  // 1. Rate Limiting Check (60 req/min per IP)
  const rateLimit = checkAnalyticsRateLimit(request, 60, 60000);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ success: false, error: 'Too Many Requests' }), {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': String(rateLimit.retryAfter || 60)
      }
    });
  }

  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        status: 200,
        headers
      });
    }

    // 2. Body size limit (max 32 KB)
    if (rawBody.length > 32768) {
      return new Response(JSON.stringify({ success: false, error: 'Payload too large' }), {
        status: 400,
        headers
      });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
        status: 400,
        headers
      });
    }

    const rawEvents: Array<any> = Array.isArray(payload?.events) ? payload.events : [payload];
    if (rawEvents.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        status: 200,
        headers
      });
    }

    // Cap batch size to max 10 events per request
    const events = rawEvents.slice(0, 10);

    // Extract geo and user agent info from Cloudflare Edge
    const cfCountry = (request.headers.get('cf-ipcountry') || 'Unknown').toUpperCase();
    const referrerHeader = request.headers.get('referer') || '';

    const sql = getDb(env);

    for (const ev of events) {
      if (!ev || typeof ev !== 'object') continue;

      const visitorId = typeof ev.visitorId === 'string' ? ev.visitorId.trim() : '';
      const sessionId = typeof ev.sessionId === 'string' ? ev.sessionId.trim() : '';
      const rawEventName = typeof ev.eventName === 'string' ? ev.eventName.trim().toLowerCase() : 'page_view';
      const eventName = EVENT_NAME_REGEX.test(rawEventName) ? rawEventName : 'custom_event';
      const path = (typeof ev.path === 'string' ? ev.path : '/').slice(0, 255);
      const referrer = (typeof ev.referrer === 'string' ? ev.referrer : referrerHeader).slice(0, 500);
      const country = cfCountry.length <= 10 ? cfCountry : 'Unknown';
      const deviceType = (typeof ev.deviceType === 'string' ? ev.deviceType : 'desktop').slice(0, 20);
      const browser = (typeof ev.browser === 'string' ? ev.browser : 'Unknown').slice(0, 50);
      const os = (typeof ev.os === 'string' ? ev.os : 'Unknown').slice(0, 50);

      const rawVisitorName = typeof ev.visitorName === 'string' ? ev.visitorName : (typeof ev.metadata?.name === 'string' ? ev.metadata.name : '');
      const visitorName = rawVisitorName.trim().slice(0, 100);

      // Validate IDs format
      if (!ID_REGEX.test(visitorId) || !ID_REGEX.test(sessionId)) continue;

      // Clean and sanitize metadata
      const metadata: Record<string, string | number | boolean> = {};
      if (ev.metadata && typeof ev.metadata === 'object' && !Array.isArray(ev.metadata)) {
        let keyCount = 0;
        for (const [k, v] of Object.entries(ev.metadata)) {
          if (keyCount >= 20) break; // Max 20 keys
          const cleanKey = k.toLowerCase().trim().slice(0, 50);
          
          const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => cleanKey.includes(pattern));
          if (isSensitive) continue;

          if (typeof v === 'string') {
            metadata[cleanKey] = v.slice(0, 255);
            keyCount++;
          } else if (typeof v === 'number' || typeof v === 'boolean') {
            metadata[cleanKey] = v;
            keyCount++;
          }
        }
      }

      if (eventName === 'session_leave') {
        // User closed the tab or navigated away -> mark session inactive immediately
        await sql`
          UPDATE analytics_sessions
          SET is_active = FALSE,
              last_activity_at = NOW(),
              duration_seconds = GREATEST(analytics_sessions.duration_seconds, EXTRACT(EPOCH FROM (NOW() - analytics_sessions.started_at))::int)
          WHERE id = ${sessionId}
        `;
        continue;
      }

      // 1. Upsert Visitor (and update name if provided)
      await sql`
        INSERT INTO analytics_visitors (id, name, first_seen_at, last_seen_at, total_sessions, total_pageviews, first_referrer, first_country)
        VALUES (${visitorId}, NULLIF(${visitorName}, ''), NOW(), NOW(), 1, ${eventName === 'page_view' ? 1 : 0}, ${referrer}, ${country})
        ON CONFLICT (id) DO UPDATE SET
          name = COALESCE(NULLIF(${visitorName}, ''), analytics_visitors.name),
          last_seen_at = NOW(),
          total_pageviews = analytics_visitors.total_pageviews + ${eventName === 'page_view' ? 1 : 0}
      `;

      // 2. Upsert Session with is_active = TRUE
      await sql`
        INSERT INTO analytics_sessions (id, visitor_id, started_at, last_activity_at, duration_seconds, pageviews_count, events_count, device_type, browser, os, country, referrer, entry_path, is_active)
        VALUES (${sessionId}, ${visitorId}, NOW(), NOW(), 0, ${eventName === 'page_view' ? 1 : 0}, 1, ${deviceType}, ${browser}, ${os}, ${country}, ${referrer}, ${path}, TRUE)
        ON CONFLICT (id) DO UPDATE SET
          is_active = TRUE,
          last_activity_at = NOW(),
          entry_path = CASE WHEN ${eventName} = 'page_view' THEN ${path} ELSE analytics_sessions.entry_path END,
          duration_seconds = GREATEST(analytics_sessions.duration_seconds, EXTRACT(EPOCH FROM (NOW() - analytics_sessions.started_at))::int),
          pageviews_count = analytics_sessions.pageviews_count + ${eventName === 'page_view' ? 1 : 0},
          events_count = analytics_sessions.events_count + 1
      `;

      // 3. Insert Event (omit heartbeat from events table)
      if (eventName !== 'heartbeat') {
        await sql`
          INSERT INTO analytics_events (visitor_id, session_id, visitor_name, event_name, path, metadata, country, device_type, created_at)
          VALUES (${visitorId}, ${sessionId}, NULLIF(${visitorName}, ''), ${eventName}, ${path}, ${JSON.stringify(metadata)}::jsonb, ${country}, ${deviceType}, NOW())
        `;
      }
    }

    return new Response(JSON.stringify({ success: true, processed: events.length }), {
      status: 200,
      headers
    });
  } catch {
    // Analytics ingestion must never cause 500 breakages for client apps, and never leak internal db errors
    return new Response(JSON.stringify({ success: false, error: 'Ingestion error' }), {
      status: 200,
      headers
    });
  }
}


