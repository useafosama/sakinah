import { getDb, corsHeaders } from '../_db';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestPost(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;

  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        status: 200,
        headers: corsHeaders()
      });
    }

    const payload = JSON.parse(rawBody);
    const events: Array<any> = Array.isArray(payload.events) ? payload.events : [payload];

    if (events.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        status: 200,
        headers: corsHeaders()
      });
    }

    // Extract geo and user agent info from Cloudflare Edge
    const cfCountry = (request.headers.get('cf-ipcountry') || 'Unknown').toUpperCase();
    const referrerHeader = request.headers.get('referer') || '';

    const sql = getDb(env);

    for (const ev of events) {
      const visitorId = (ev.visitorId || '').trim();
      const sessionId = (ev.sessionId || '').trim();
      const eventName = (ev.eventName || 'page_view').trim();
      const path = (ev.path || '/').slice(0, 255);
      const referrer = (ev.referrer || referrerHeader || '').slice(0, 500);
      const country = cfCountry.length <= 10 ? cfCountry : 'Unknown';
      const deviceType = (ev.deviceType || 'desktop').slice(0, 20);
      const browser = (ev.browser || 'Unknown').slice(0, 50);
      const os = (ev.os || 'Unknown').slice(0, 50);

      const visitorName = (ev.visitorName || ev.metadata?.name || '').trim().slice(0, 100);

      // Clean metadata strictly avoiding amounts or sensitive data
      const metadata: Record<string, any> = {};
      if (ev.metadata && typeof ev.metadata === 'object') {
        for (const [k, v] of Object.entries(ev.metadata)) {
          if (
            !k.toLowerCase().includes('amount') &&
            !k.toLowerCase().includes('money') &&
            !k.toLowerCase().includes('email') &&
            !k.toLowerCase().includes('phone') &&
            !k.toLowerCase().includes('password')
          ) {
            metadata[k] = v;
          }
        }
      }

      if (!visitorId || !sessionId) continue;

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
      headers: corsHeaders()
    });
  } catch (error) {
    // Analytics ingestion must never cause 500 breakages for client apps
    return new Response(JSON.stringify({ success: false, error: 'Ingestion error' }), {
      status: 200,
      headers: corsHeaders()
    });
  }
}
