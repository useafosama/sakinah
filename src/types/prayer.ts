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
