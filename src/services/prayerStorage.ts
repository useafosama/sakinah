import {
  ObligatoryPrayerId,
  PrayerLogRecord,
  PrayerUserSettings,
  PrayerStatisticsData,
  DayPrayerSummary,
  TheShiaPrayerResponse
} from '../types/prayer';
import { DEFAULT_PRAYER_LOCATION, formatDateISO } from './theShiaPrayerService';

const STORAGE_KEYS = {
  SETTINGS: 'sakinah_prayer_settings_v2',
  LOGS: 'sakinah_prayer_logs_v2',
  API_CACHE: 'sakinah_theshia_cache_v2_',
  SYNC_QUEUE: 'sakinah_prayer_sync_queue_v2',
};

export const DEFAULT_USER_SETTINGS: PrayerUserSettings = {
  location: DEFAULT_PRAYER_LOCATION,
  calculationMethod: 'Jafari',
  notifications: {
    enabled: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    beforeMinutes: 10,
    postPrayerReminder: true,
    postPrayerMinutes: 20,
  },
  autoGeolocationOnStartup: false,
  showMidnightAndImsak: true,
};

// ----------------------------------------------------
// Settings Management
// ----------------------------------------------------

export function getStoredUserSettings(): PrayerUserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER_SETTINGS,
        ...parsed,
        location: { ...DEFAULT_USER_SETTINGS.location, ...(parsed.location || {}) },
        notifications: { ...DEFAULT_USER_SETTINGS.notifications, ...(parsed.notifications || {}) },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_USER_SETTINGS;
}

export function saveStoredUserSettings(settings: PrayerUserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// Prayer Logs Storage & Queries
// ----------------------------------------------------

type LogsMap = Record<string, Partial<Record<ObligatoryPrayerId, PrayerLogRecord>>>;

function getAllStoredLogs(): LogsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveAllStoredLogs(logs: LogsMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export function getLogsForDate(dateStr: string): Partial<Record<ObligatoryPrayerId, PrayerLogRecord>> {
  const allLogs = getAllStoredLogs();
  return allLogs[dateStr] || {};
}

export function getLogForPrayer(dateStr: string, prayer: ObligatoryPrayerId): PrayerLogRecord | undefined {
  const dayLogs = getLogsForDate(dateStr);
  return dayLogs[prayer];
}

export function savePrayerLog(
  dateStr: string,
  prayer: ObligatoryPrayerId,
  status: 'prayed_on_time' | 'prayed_late' | 'missed',
  scheduledTime: string = ''
): PrayerLogRecord {
  const allLogs = getAllStoredLogs();
  if (!allLogs[dateStr]) {
    allLogs[dateStr] = {};
  }

  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const timestamp = Date.now();

  const record: PrayerLogRecord = {
    id: `${dateStr}_${prayer}`,
    date: dateStr,
    prayer,
    scheduledTime: scheduledTime || timeString,
    loggedAt: timeString,
    status,
    createdAt: allLogs[dateStr][prayer]?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  allLogs[dateStr][prayer] = record;
  saveAllStoredLogs(allLogs);
  return record;
}

export function removePrayerLog(dateStr: string, prayer: ObligatoryPrayerId): void {
  const allLogs = getAllStoredLogs();
  if (allLogs[dateStr] && allLogs[dateStr][prayer]) {
    delete allLogs[dateStr][prayer];
    if (Object.keys(allLogs[dateStr]).length === 0) {
      delete allLogs[dateStr];
    }
    saveAllStoredLogs(allLogs);
  }
}

export function clearAllPrayerLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// History & Statistics Calculations
// ----------------------------------------------------

export function getDaySummary(dateStr: string): DayPrayerSummary {
  const logs = getLogsForDate(dateStr);
  const obligatory: ObligatoryPrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let completedCount = 0;
  let hasLate = false;
  let hasMissed = false;

  for (const p of obligatory) {
    const log = logs[p];
    if (log) {
      if (log.status === 'prayed_on_time' || log.status === 'prayed_late') {
        completedCount++;
      }
      if (log.status === 'prayed_late') hasLate = true;
      if (log.status === 'missed') hasMissed = true;
    }
  }

  return {
    date: dateStr,
    logs,
    completedCount,
    totalCount: 5,
    hasLate,
    hasMissed,
    isFullyLogged: completedCount === 5,
  };
}

export function getWeekSummaries(referenceDate: Date = new Date()): DayPrayerSummary[] {
  const summaries: DayPrayerSummary[] = [];
  // Calculate Saturday of current week (Arabic week starting Saturday)
  const current = new Date(referenceDate);
  const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
  const diffToSaturday = (dayOfWeek + 1) % 7; // days passed since last Saturday
  
  const startSaturday = new Date(current);
  startSaturday.setDate(current.getDate() - diffToSaturday);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startSaturday);
    day.setDate(startSaturday.getDate() + i);
    const dateStr = formatDateISO(day);
    summaries.push(getDaySummary(dateStr));
  }

  return summaries;
}

export function calculatePrayerStatistics(daysBack: number = 30): PrayerStatisticsData {
  const allLogs = getAllStoredLogs();
  const today = new Date();
  let totalLogged = 0;
  let onTimeCount = 0;
  let lateCount = 0;
  let missedCount = 0;

  const totalPossible = daysBack * 5;

  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateISO(d);
    const dayLogs = allLogs[dateStr] || {};

    const prayers: ObligatoryPrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const p of prayers) {
      const log = dayLogs[p];
      if (log) {
        totalLogged++;
        if (log.status === 'prayed_on_time') onTimeCount++;
        else if (log.status === 'prayed_late') lateCount++;
        else if (log.status === 'missed') missedCount++;
      }
    }
  }

  const unloggedCount = Math.max(0, totalPossible - totalLogged);
  const completionRate = totalPossible > 0 ? Math.round((totalLogged / totalPossible) * 100) : 0;

  // Calculate gentle streak
  let currentStreakDays = 0;
  let bestStreakDays = 0;
  let tempStreak = 0;

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateISO(d);
    const summary = getDaySummary(dateStr);

    if (summary.completedCount >= 1) {
      tempStreak++;
      if (i === currentStreakDays) {
        currentStreakDays++;
      }
      if (tempStreak > bestStreakDays) {
        bestStreakDays = tempStreak;
      }
    } else {
      if (i === 0) {
        // Today might not be finished yet, don't break streak immediately if yesterday was logged
        continue;
      }
      tempStreak = 0;
    }
  }

  return {
    totalLogged,
    totalPossible,
    onTimeCount,
    lateCount,
    missedCount,
    unloggedCount,
    completionRate,
    currentStreakDays,
    bestStreakDays,
  };
}

// ----------------------------------------------------
// API Response Caching
// ----------------------------------------------------

export function getCachedTheShiaResponse(
  lat: number,
  lng: number,
  dateStr: string,
  method: string
): TheShiaPrayerResponse | null {
  try {
    const key = `${STORAGE_KEYS.API_CACHE}${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateStr}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.cachedAt > 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch {
    return null;
  }
}

export function setCachedTheShiaResponse(
  lat: number,
  lng: number,
  dateStr: string,
  method: string,
  data: TheShiaPrayerResponse
): void {
  try {
    const key = `${STORAGE_KEYS.API_CACHE}${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateStr}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      })
    );
  } catch {
    // ignore
  }
}
