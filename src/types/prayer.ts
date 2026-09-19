export type ObligatoryPrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerId =
  | 'imsak'
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'sunset'
  | 'maghrib'
  | 'isha'
  | 'midnight';

export type PrayerStatus =
  | 'upcoming'
  | 'current'
  | 'prayed_on_time'
  | 'prayed_late'
  | 'missed'
  | 'unlogged';

export interface TheShiaPrayerMeta {
  lat: number;
  lng: number;
  tz: string;
  qibla: number;
  timescale: string;
  method: string;
}

export interface TheShiaLocalTimes {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

export interface TheShiaPrayerDay {
  date: string; // YYYY-MM-DD
  imsak: string; // ISO 8601 UTC string
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
  local: TheShiaLocalTimes;
}

export interface TheShiaPrayerResponse {
  meta: TheShiaPrayerMeta;
  days: TheShiaPrayerDay[];
}

export interface CityMatch {
  id: string;
  names: {
    en?: string;
    ar?: string;
    fa?: string;
    ur?: string;
  };
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

export interface CitiesResponse {
  matches: CityMatch[];
}

export interface UserPrayerLocation {
  lat: number;
  lng: number;
  cityName: string;
  cityNameAr: string;
  countryName?: string;
  countryNameAr?: string;
  tz: string;
  isGeolocation: boolean;
}

export interface PrayerLogRecord {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  prayer: ObligatoryPrayerId;
  scheduledTime: string; // HH:MM
  loggedAt: string; // ISO timestamp or HH:MM
  status: 'prayed_on_time' | 'prayed_late' | 'missed';
  syncStatus?: 'synced' | 'pending' | 'failed';
  createdAt: number;
  updatedAt: number;
}

export interface PrayerItemView {
  id: PrayerId;
  nameAr: string;
  time12: string;
  time24: string;
  utcIso: string;
  isPrimary: boolean;
  isPassed: boolean;
  isNext: boolean;
  isCurrent?: boolean;
  log?: PrayerLogRecord;
}

export interface NextPrayerCountdown {
  prayer: PrayerItemView;
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  humanRemaining: string;
  isTomorrow: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  beforeMinutes: number; // 0 (disabled), 5, 10, 15, 30
  postPrayerReminder: boolean;
  postPrayerMinutes: number; // 10, 20, 30, 60
}

export interface PrayerUserSettings {
  location: UserPrayerLocation;
  calculationMethod: string; // 'Jafari'
  notifications: NotificationSettings;
  autoGeolocationOnStartup: boolean;
  showMidnightAndImsak: boolean;
}

export interface DayPrayerSummary {
  date: string; // YYYY-MM-DD
  logs: Partial<Record<ObligatoryPrayerId, PrayerLogRecord>>;
  completedCount: number;
  totalCount: number; // usually 5
  hasLate: boolean;
  hasMissed: boolean;
  isFullyLogged: boolean;
}

export interface PrayerStatisticsData {
  totalLogged: number;
  totalPossible: number;
  onTimeCount: number;
  lateCount: number;
  missedCount: number;
  unloggedCount: number;
  completionRate: number; // percentage e.g. 82
  currentStreakDays: number;
  bestStreakDays: number;
}

export interface TheShiaQiblaResponse {
  lat: number;
  lng: number;
  qibla: number; // degrees clockwise from true north
  unit?: string;
}

export interface QiblaDirectionInfo {
  qiblaAngle: number; // 0-360 clockwise from True North
  cardinalAr: string; // e.g. "الجنوب الشرقي"
  cardinalEn: string; // e.g. "SE"
  distanceKm: number; // distance to Makkah in KM
}

export interface CompassOrientationState {
  deviceHeading: number | null; // 0-360 degrees from True North (null if unsupported/denied)
  smoothedHeading: number | null;
  qiblaAngle: number; // absolute bearing to Makkah from True North
  relativeAngle: number; // angle to rotate Kaaba needle relative to device top
  accuracy: number | null;
  hasSensors: boolean;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported';
  isAligned: boolean; // within ±3 degrees
  isClose: boolean; // within ±10 degrees
  turnDirection: 'left' | 'right' | 'aligned';
  diffDegrees: number;
}

// ----------------------------------------------------
// Personal Prayer Streaks Types
// ----------------------------------------------------

export type DayCompletionStatus = 'completed' | 'incomplete' | 'today_in_progress';

export interface DailyStreakDay {
  date: string; // YYYY-MM-DD
  dayNameAr: string; // 'السبت', 'الأحد', ...
  dayLetterAr: string; // 'س', 'ح', 'ن', ...
  completedPrayersCount: number; // 0 to 5
  totalPrayersCount: number; // 5
  status: DayCompletionStatus;
  isToday: boolean;
  isFuture: boolean;
}

export interface PrayerStreakData {
  currentStreak: number; // Consecutive completed days
  longestStreak: number; // Max consecutive completed days
  completedDaysTotal: number; // Total completed days in recorded history
  weeklyDays: DailyStreakDay[]; // Last 7 days in order
  weeklyCompletedCount: number; // e.g. 5
  monthlyCompletedCount: number; // e.g. 18
  monthlyTotalDays: number; // e.g. 30
  todayStatus: 'completed' | 'in_progress' | 'not_started';
  todayCompletedCount: number;
  completionPercentage: number;
}

// ----------------------------------------------------
// Offline & Sync Types
// ----------------------------------------------------

export interface CachedPrayerTimesMeta {
  source: string; // "TheShia"
  cachedAt: number; // timestamp ms
  humanAge: string; // e.g. "منذ ساعتين", "محفوظ محلياً"
  date: string; // YYYY-MM-DD
  lat: number;
  lng: number;
  tz: string;
  method: string;
  isStale: boolean;
}

export interface PendingSyncAction {
  id: string;
  action: 'save_log' | 'remove_log' | 'update_settings';
  payload: {
    dateStr?: string;
    prayer?: ObligatoryPrayerId;
    status?: 'prayed_on_time' | 'prayed_late' | 'missed';
    scheduledTime?: string;
    settings?: Partial<PrayerUserSettings>;
    updatedAt: number;
  };
  timestamp: number;
  retryCount: number;
}

export interface SyncStatusState {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncError: string | null;
}

