import { getDb, corsHeaders } from '../../_db';
import { authenticateAdminRequest } from '../../_auth';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestGet(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;

  // 1. Verify Admin Authentication
  const isAuthed = await authenticateAdminRequest(request, env);
  if (!isAuthed) {
    return new Response(JSON.stringify({ success: false, error: 'غير مصرح بالدخول (Unauthorized)' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '7d';
  const customStart = url.searchParams.get('startDate');

  const sql = getDb(env);

  try {
    const now = new Date();
    let startThreshold: Date;
    let prevThreshold: Date;
    let isHourly = false;

    if (range === 'today') {
      startThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      isHourly = true;
    } else if (range === 'yesterday') {
      startThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      prevThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
      isHourly = true;
    } else if (range === '30d') {
      startThreshold = new Date(now.getTime() - 30 * 86400000);
      prevThreshold = new Date(now.getTime() - 60 * 86400000);
    } else if (range === '90d') {
      startThreshold = new Date(now.getTime() - 90 * 86400000);
      prevThreshold = new Date(now.getTime() - 180 * 86400000);
    } else if (range === 'custom' && customStart) {
      startThreshold = new Date(customStart);
      const span = now.getTime() - startThreshold.getTime();
      prevThreshold = new Date(startThreshold.getTime() - span);
    } else {
      // 7d default
      startThreshold = new Date(now.getTime() - 7 * 86400000);
      prevThreshold = new Date(now.getTime() - 14 * 86400000);
    }

    const startIso = startThreshold.toISOString();
    const prevIso = prevThreshold.toISOString();

    // 1. Current KPIs & Previous Period for Growth
    const [kpiRow] = await sql`
      WITH filtered_sessions AS (
        SELECT * FROM analytics_sessions
        WHERE started_at >= ${startIso}
      ),
      active_now AS (
        SELECT COUNT(DISTINCT visitor_id)::int as active_count
        FROM analytics_sessions
        WHERE is_active = TRUE AND last_activity_at >= NOW() - INTERVAL '1 minute'
      ),
      returning_v AS (
        SELECT COUNT(DISTINCT visitor_id)::int as returning_count
        FROM filtered_sessions
        WHERE visitor_id IN (SELECT id FROM analytics_visitors WHERE total_sessions > 1)
      ),
      bounce_v AS (
        SELECT COUNT(*)::int as bounce_count
        FROM filtered_sessions
        WHERE pageviews_count <= 1 AND duration_seconds <= 10
      )
      SELECT
        COALESCE(COUNT(DISTINCT visitor_id), 0)::int as total_visitors,
        COALESCE(COUNT(*), 0)::int as total_sessions,
        COALESCE(SUM(pageviews_count), 0)::int as total_pageviews,
        COALESCE(ROUND(AVG(duration_seconds)), 0)::int as avg_duration,
        (SELECT active_count FROM active_now) as active_now,
        (SELECT returning_count FROM returning_v) as returning_visitors,
        (SELECT bounce_count FROM bounce_v) as bounce_count
      FROM filtered_sessions
    `;

    const [prevRow] = await sql`
      SELECT
        COALESCE(COUNT(DISTINCT visitor_id), 0)::int as prev_visitors,
        COALESCE(COUNT(*), 0)::int as prev_sessions,
        COALESCE(SUM(pageviews_count), 0)::int as prev_pageviews
      FROM analytics_sessions
      WHERE started_at >= ${prevIso} AND started_at < ${startIso}
    `;

    const totalSessions = kpiRow?.total_sessions || 0;
    const bounceCount = kpiRow?.bounce_count || 0;
    const bounceRate = totalSessions > 0 ? Math.round((bounceCount / totalSessions) * 100) : 0;

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const growth = {
      visitorsGrowth: calcGrowth(kpiRow?.total_visitors || 0, prevRow?.prev_visitors || 0),
      sessionsGrowth: calcGrowth(totalSessions, prevRow?.prev_sessions || 0),
      pageViewsGrowth: calcGrowth(kpiRow?.total_pageviews || 0, prevRow?.prev_pageviews || 0),
      returningGrowth: 0
    };

    const kpis = {
      totalVisitors: kpiRow?.total_visitors || 0,
      activeVisitorsNow: kpiRow?.active_now || 0,
      returningVisitors: kpiRow?.returning_visitors || 0,
      totalPageViews: kpiRow?.total_pageviews || 0,
      totalSessions: totalSessions,
      avgSessionDurationSeconds: kpiRow?.avg_duration || 0,
      bounceRatePercentage: bounceRate,
      growth
    };

    // 2. Chart series
    let chartRows: any[] = [];
    if (isHourly) {
      chartRows = await sql`
        SELECT
          TO_CHAR(started_at, 'HH24:00') as label,
          COUNT(DISTINCT visitor_id)::int as visitors,
          COUNT(*)::int as sessions,
          COALESCE(SUM(pageviews_count), 0)::int as page_views
        FROM analytics_sessions
        WHERE started_at >= ${startIso}
        GROUP BY TO_CHAR(started_at, 'HH24:00'), DATE_TRUNC('hour', started_at)
        ORDER BY DATE_TRUNC('hour', started_at) ASC
      `;
    } else {
      chartRows = await sql`
        SELECT
          TO_CHAR(started_at, 'YYYY-MM-DD') as label,
          COUNT(DISTINCT visitor_id)::int as visitors,
          COUNT(*)::int as sessions,
          COALESCE(SUM(pageviews_count), 0)::int as page_views
        FROM analytics_sessions
        WHERE started_at >= ${startIso}
        GROUP BY TO_CHAR(started_at, 'YYYY-MM-DD')
        ORDER BY TO_CHAR(started_at, 'YYYY-MM-DD') ASC
      `;
    }

    const chartData = chartRows.map((r: any) => ({
      date: r.label,
      visitors: r.visitors || 0,
      sessions: r.sessions || 0,
      pageViews: r.page_views || 0
    }));

    // 3. Traffic Sources
    const sourceRows = await sql`
      SELECT
        COALESCE(NULLIF(referrer, ''), 'Direct') as raw_source,
        COUNT(*)::int as count
      FROM analytics_sessions
      WHERE started_at >= ${startIso}
      GROUP BY raw_source
      ORDER BY count DESC
      LIMIT 10
    `;

    const trafficSources = sourceRows.map((r: any) => {
      let src = r.raw_source;
      if (src.includes('google')) src = 'Google';
      else if (src.includes('instagram')) src = 'Instagram';
      else if (src.includes('tiktok')) src = 'TikTok';
      else if (src.includes('facebook') || src.includes('fb.')) src = 'Facebook';
      else if (src.includes('t.co') || src.includes('twitter') || src.includes('x.com')) src = 'X (Twitter)';
      else if (src.includes('youtube')) src = 'YouTube';
      else if (src.includes('whatsapp')) src = 'WhatsApp';
      else if (src.includes('t.me') || src.includes('telegram')) src = 'Telegram';
      else if (src === 'Direct' || src === '') src = 'Direct / مباشر';

      return {
        source: src,
        count: r.count,
        percentage: totalSessions > 0 ? Math.round((r.count / totalSessions) * 100) : 0
      };
    });

    // 4. Countries
    const countryRows = await sql`
      SELECT
        COALESCE(country, 'Unknown') as code,
        COUNT(DISTINCT visitor_id)::int as count
      FROM analytics_sessions
      WHERE started_at >= ${startIso}
      GROUP BY code
      ORDER BY count DESC
      LIMIT 15
    `;

    const countryNameMap: Record<string, string> = {
      EG: 'مصر 🇪🇬',
      SA: 'السعودية 🇸🇦',
      AE: 'الإمارات 🇦🇪',
      KW: 'الكويت 🇰🇼',
      QA: 'قطر 🇶🇦',
      BH: 'البحرين 🇧🇭',
      OM: 'عمان 🇴🇲',
      JO: 'الأردن 🇯🇴',
      IQ: 'العراق 🇮🇶',
      SY: 'سوريا 🇸🇾',
      LB: 'لبنان 🇱🇧',
      PS: 'فلسطين 🇵🇸',
      YE: 'اليمن 🇾🇪',
      MA: 'المغرب 🇲🇦',
      DZ: 'الجزائر 🇩🇿',
      TN: 'تونس 🇹🇳',
      LY: 'ليبيا 🇱🇾',
      SD: 'السودان 🇸🇩',
      TR: 'تركيا 🇹🇷',
      US: 'الولايات المتحدة 🇺🇸',
      GB: 'المملكة المتحدة 🇬🇧',
      DE: 'ألمانيا 🇩🇪',
      FR: 'فرنسا 🇫🇷',
      CA: 'كندا 🇨🇦',
      Unknown: 'غير محدد 🌍'
    };

    const countries = countryRows.map((r: any) => ({
      code: r.code,
      name: countryNameMap[r.code] || `${r.code} 🌍`,
      count: r.count,
      percentage: kpis.totalVisitors > 0 ? Math.round((r.count / kpis.totalVisitors) * 100) : 0
    }));

    // 5. Devices & Browsers
    const deviceRows = await sql`
      SELECT
        COALESCE(device_type, 'desktop') as device,
        COUNT(*)::int as count
      FROM analytics_sessions
      WHERE started_at >= ${startIso}
      GROUP BY device
      ORDER BY count DESC
    `;

    const devices = deviceRows.map((r: any) => ({
      device: r.device as 'mobile' | 'desktop' | 'tablet',
      count: r.count,
      percentage: totalSessions > 0 ? Math.round((r.count / totalSessions) * 100) : 0
    }));

    const browserRows = await sql`
      SELECT
        COALESCE(browser, 'Other') as browser,
        COUNT(*)::int as count
      FROM analytics_sessions
      WHERE started_at >= ${startIso}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 8
    `;

    const browsers = browserRows.map((r: any) => ({
      browser: r.browser,
      count: r.count,
      percentage: totalSessions > 0 ? Math.round((r.count / totalSessions) * 100) : 0
    }));

    // 6. Top Pages
    const pageNameMap: Record<string, string> = {
      '/': 'الرئيسية (Home)',
      '/prayer-times': 'مواقيت الصلاة',
      '/qibla': 'القبلة',
      '/charity': 'حصاد الخير والصدقة',
      '/adhkar': 'الأذكار اليومية',
      '/hadith': 'الأحاديث النبوية',
      '/favorites': 'المفضلة',
      '/sources': 'المصادر والمنهجية',
      '/admin': 'لوحة تحكم المشرف'
    };

    const pageRows = await sql`
      SELECT
        path,
        COUNT(*)::int as views
      FROM analytics_events
      WHERE created_at >= ${startIso} AND event_name = 'page_view'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    const topPages = pageRows.map((r: any) => ({
      path: r.path,
      title: pageNameMap[r.path] || r.path,
      views: r.views,
      percentage: kpis.totalPageViews > 0 ? Math.round((r.views / kpis.totalPageViews) * 100) : 0
    }));

    // 7. Feature Usage
    const eventCounts = await sql`
      SELECT
        event_name,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE created_at >= ${startIso}
      GROUP BY event_name
    `;

    const eventMap = new Map<string, number>();
    eventCounts.forEach((r: any) => eventMap.set(r.event_name, r.count));

    const features = {
      dhikrViews: (eventMap.get('dhikr_opened') || 0) + (eventMap.get('dhikr_category_opened') || 0),
      dhikrCompletions: eventMap.get('dhikr_completed') || 0,
      prayerViews: eventMap.get('prayer_times_opened') || 0,
      prayerNotifications: eventMap.get('prayer_notification_enabled') || 0,
      reminderEnabled: eventMap.get('reminder_enabled') || 0,
      goodDeedsLogged: eventMap.get('good_deed_logged') || 0,
      secretDeedsLogged: eventMap.get('secret_good_deed_logged') || 0,
      quickSetupCompleted: eventMap.get('quick_setup_completed') || 0,
      pwaInstalled: eventMap.get('pwa_installed') || 0
    };

    // 8. Funnel
    const qsStarted = eventMap.get('quick_setup_started') || 0;
    const qsCompleted = eventMap.get('quick_setup_completed') || 0;
    const featuresActivated =
      (eventMap.get('prayer_notification_enabled') || 0) +
      (eventMap.get('reminder_enabled') || 0) +
      (eventMap.get('charity_reminder_enabled') || 0) +
      (eventMap.get('good_deed_logged') || 0);

    const funnel = [
      { stepName: 'زيارة الموقع (Total Visitors)', count: kpis.totalVisitors, conversionRate: 100 },
      {
        stepName: 'بدء الإعداد السريع (Setup Started)',
        count: qsStarted,
        conversionRate: kpis.totalVisitors > 0 ? Math.round((qsStarted / kpis.totalVisitors) * 100) : 0
      },
      {
        stepName: 'إكمال الإعداد السريع (Setup Completed)',
        count: qsCompleted,
        conversionRate: qsStarted > 0 ? Math.round((qsCompleted / qsStarted) * 100) : 0
      },
      {
        stepName: 'تفعيل الميزات والعبادات (Features Active)',
        count: featuresActivated,
        conversionRate: qsCompleted > 0 ? Math.round((featuresActivated / qsCompleted) * 100) : 0
      }
    ];

    // 9. Simplified Retention
    const [retentionRow] = await sql`
      WITH visitor_days AS (
        SELECT
          visitor_id,
          MIN(started_at) as first_visit,
          MAX(started_at) as last_visit,
          EXTRACT(DAY FROM (MAX(started_at) - MIN(started_at)))::int as span_days
        FROM analytics_sessions
        GROUP BY visitor_id
      )
      SELECT
        COUNT(*) FILTER (WHERE span_days >= 1)::int as ret_d1,
        COUNT(*) FILTER (WHERE span_days >= 7)::int as ret_d7,
        COUNT(*) FILTER (WHERE span_days >= 30)::int as ret_d30,
        COUNT(*)::int as total_cohort
      FROM visitor_days
    `;

    const cohortTotal = retentionRow?.total_cohort || 1;
    const retention = {
      day1Rate: Math.round(((retentionRow?.ret_d1 || 0) / cohortTotal) * 100),
      day7Rate: Math.round(((retentionRow?.ret_d7 || 0) / cohortTotal) * 100),
      day30Rate: Math.round(((retentionRow?.ret_d30 || 0) / cohortTotal) * 100)
    };

    // 10. Recent Events
    const recentRows = await sql`
      SELECT
        id::text,
        event_name,
        path,
        device_type,
        country,
        created_at,
        metadata
      FROM analytics_events
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const recentEvents = recentRows.map((r: any) => ({
      id: r.id,
      eventName: r.event_name,
      path: r.path,
      deviceType: r.device_type,
      country: r.country,
      createdAt: r.created_at,
      metadata: r.metadata
    }));

    // 11. Real-Time Radar
    const activePageRows = await sql`
      SELECT
        COALESCE(entry_path, '/') as path,
        COUNT(DISTINCT visitor_id)::int as count
      FROM analytics_sessions
      WHERE is_active = TRUE AND last_activity_at >= NOW() - INTERVAL '1 minute'
      GROUP BY path
      ORDER BY count DESC
    `;

    const activeCountryRows = await sql`
      SELECT
        COALESCE(country, 'Unknown') as code,
        COUNT(DISTINCT visitor_id)::int as count
      FROM analytics_sessions
      WHERE is_active = TRUE AND last_activity_at >= NOW() - INTERVAL '1 minute'
      GROUP BY code
      ORDER BY count DESC
    `;

    const radar = {
      activeCount: kpis.activeVisitorsNow,
      activePages: activePageRows.map((r: any) => ({
        path: r.path,
        title: pageNameMap[r.path] || r.path,
        count: r.count
      })),
      activeCountries: activeCountryRows.map((r: any) => ({
        code: r.code,
        name: countryNameMap[r.code] || `${r.code} 🌍`,
        count: r.count
      })),
      livePulseFeed: recentEvents.slice(0, 8)
    };

    // 12. Islamic Insights
    const dhikrCatRows = await sql`
      SELECT
        COALESCE(metadata->>'category', 'morning') as category,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE created_at >= ${startIso} AND (event_name = 'dhikr_opened' OR event_name = 'dhikr_category_opened' OR event_name = 'dhikr_completed')
      GROUP BY category
      ORDER BY count DESC
    `;

    const dhikrCategoryLabels: Record<string, string> = {
      morning: 'أذكار الصباح 🌅',
      evening: 'أذكار المساء 🌙',
      sleep: 'أذكار النوم 🛏️',
      after_prayer: 'أذكار بعد الصلاة 🕌',
      general: 'أذكار عامة 📿'
    };

    const totalDhikrCatCount = dhikrCatRows.reduce((sum: number, r: any) => sum + r.count, 0) || 1;
    const topDhikrCategories = dhikrCatRows.map((r: any) => ({
      category: r.category,
      label: dhikrCategoryLabels[r.category] || r.category,
      count: r.count,
      percentage: Math.round((r.count / totalDhikrCatCount) * 100)
    }));

    const charityCatRows = await sql`
      SELECT
        COALESCE(metadata->>'deed_type', 'financial') as deed_type,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE created_at >= ${startIso} AND (event_name = 'good_deed_logged' OR event_name = 'secret_good_deed_logged')
      GROUP BY deed_type
      ORDER BY count DESC
    `;

    const charityLabels: Record<string, string> = {
      financial: 'صدقة مالية 💰',
      food: 'إطعام طعام 🍲',
      water: 'سقي ماء 💧',
      help: 'مساعدة شخص 🤝',
      good_deed: 'عمل خير عام 🤍',
      animal: 'إطعام حيوان 🐾',
      parents: 'بر الوالدين 🌸',
      other: 'أعمال أخرى ✨'
    };

    const totalCharityCount = charityCatRows.reduce((sum: number, r: any) => sum + r.count, 0) || 1;
    const charityCategories = charityCatRows.map((r: any) => ({
      type: r.deed_type,
      label: charityLabels[r.deed_type] || r.deed_type,
      count: r.count,
      percentage: Math.round((r.count / totalCharityCount) * 100)
    }));

    const hourlyRows = await sql`
      SELECT
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE created_at >= ${startIso}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    const hourMap = new Map<number, number>();
    hourlyRows.forEach((r: any) => hourMap.set(r.hour, r.count));

    const getPrayerContext = (h: number) => {
      if (h >= 4 && h <= 6) return 'الفجر 🌅';
      if (h >= 12 && h <= 14) return 'الظهر ☀️';
      if (h >= 15 && h <= 17) return 'العصر ⛅';
      if (h >= 18 && h <= 19) return 'المغرب 🌇';
      if (h >= 20 && h <= 22) return 'العشاء 🌙';
      return undefined;
    };

    const hourlyPeaks = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      count: hourMap.get(h) || 0,
      prayerContext: getPrayerContext(h)
    }));

    const islamicInsights = {
      topDhikrCategories,
      charityCategories,
      hourlyPeaks
    };

    const responsePayload = {
      range,
      kpis,
      chartData,
      trafficSources,
      countries,
      devices,
      browsers,
      topPages,
      features,
      funnel,
      retention,
      recentEvents,
      radar,
      islamicInsights
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
