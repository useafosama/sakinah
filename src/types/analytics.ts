export type AnalyticsEventName =
  | 'page_view'
  | 'quick_setup_started'
  | 'quick_setup_completed'
  | 'quick_setup_skipped'
  | 'dhikr_opened'
  | 'dhikr_started'
  | 'dhikr_completed'
  | 'dhikr_category_opened'
  | 'prayer_times_opened'
  | 'prayer_notification_enabled'
  | 'prayer_notification_disabled'
  | 'reminder_opened'
  | 'reminder_enabled'
  | 'reminder_disabled'
  | 'charity_feature_opened'
  | 'charity_reminder_enabled'
  | 'charity_reminder_disabled'
  | 'good_deed_logged'
  | 'secret_good_deed_logged'
  | 'pwa_install_prompt'
  | 'pwa_installed'
  | 'heartbeat'
  | 'session_leave';

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName;
  path: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  timestamp?: string;
}

export type TimeRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsKPIs {
  totalVisitors: number;
  activeVisitorsNow: number;
  returningVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  avgSessionDurationSeconds: number;
  bounceRatePercentage: number;
}

export interface ChartDataPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
}

export interface TrafficSourceItem {
  source: string;
  count: number;
  percentage: number;
}

export interface CountryStatItem {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

export interface DeviceStatItem {
  device: 'mobile' | 'desktop' | 'tablet';
  count: number;
  percentage: number;
}

export interface BrowserStatItem {
  browser: string;
  count: number;
  percentage: number;
}

export interface TopPageItem {
  path: string;
  title: string;
  views: number;
  percentage: number;
}

export interface FeatureUsageStats {
  dhikrViews: number;
  dhikrCompletions: number;
  prayerViews: number;
  prayerNotifications: number;
  reminderEnabled: number;
  goodDeedsLogged: number;
  secretDeedsLogged: number;
  quickSetupCompleted: number;
  pwaInstalled: number;
}

export interface FunnelStep {
  stepName: string;
  count: number;
  conversionRate: number;
}

export interface RetentionStats {
  day1Rate: number;
  day7Rate: number;
  day30Rate: number;
}

export interface EventLogItem {
  id: string;
  eventName: string;
  path: string;
  deviceType?: string;
  country?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsDashboardData {
  range: TimeRange;
  kpis: AnalyticsKPIs;
  chartData: ChartDataPoint[];
  trafficSources: TrafficSourceItem[];
  countries: CountryStatItem[];
  devices: DeviceStatItem[];
  browsers: BrowserStatItem[];
  topPages: TopPageItem[];
  features: FeatureUsageStats;
  funnel: FunnelStep[];
  retention: RetentionStats;
  recentEvents: EventLogItem[];
}
