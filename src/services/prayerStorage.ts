import {
  ObligatoryPrayerId,
  PrayerLogRecord,
  PrayerUserSettings,
  PrayerStatisticsData,
  DayPrayerSummary,
  TheShiaPrayerResponse,
  PrayerStreakData,
  CachedPrayerTimesMeta
} from '../types/prayer';
import { formatDateISO } from './theShiaPrayerService';
import { prayerRepository, DEFAULT_USER_SETTINGS } from './prayerRepository';
import { calculatePrayerStreak, isDayComplete } from './streakService';

export { DEFAULT_USER_SETTINGS };

// ----------------------------------------------------
// Settings Management (via prayerRepository)
// ----------------------------------------------------

export function getStoredUserSettings(): PrayerUserSettings {
  return prayerRepository.getSettings();
}

export function saveStoredUserSettings(settings: PrayerUserSettings): void {
  prayerRepository.saveSettings(settings);
}

// ----------------------------------------------------
// Prayer Logs Storage & Queries (via prayerRepository)
// ----------------------------------------------------

export function getAllStoredLogs(): Record<string, Partial<Record<ObligatoryPrayerId, PrayerLogRecord>>> {
  return prayerRepository.getAllLogs();
}

export function getLogsForDate(dateStr: string): Partial<Record<ObligatoryPrayerId, PrayerLogRecord>> {
  return prayerRepository.getLogsForDate(dateStr);
}

export function savePrayerLog(
  dateStr: string,
  prayer: ObligatoryPrayerId,
  status: 'prayed_on_time' | 'prayed_late' | 'missed',
  scheduledTime: string = ''
): PrayerLogRecord {
  return prayerRepository.saveLog(dateStr, prayer, status, scheduledTime);
}

export function removePrayerLog(dateStr: string, prayer: ObligatoryPrayerId): void {
  prayerRepository.removeLog(dateStr, prayer);
}

export function clearAllPrayerLogs(): void {
  prayerRepository.clearAllLogs();
}

// ----------------------------------------------------
// Day & Week Summaries
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
    isFullyLogged: isDayComplete(logs),
  };
}

export function getWeekSummaries(referenceDate: Date = new Date()): DayPrayerSummary[] {
  const summaries: DayPrayerSummary[] = [];
  const current = new Date(referenceDate);
  const dayOfWeek = current.getDay(); // 0 = Sun, 6 = Sat
  const diffToSaturday = (dayOfWeek + 1) % 7; // days passed since Saturday
  
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

// ----------------------------------------------------
// Streak & Statistics Calculations
// ----------------------------------------------------

export function getPrayerStreak(referenceDate: Date = new Date()): PrayerStreakData {
  const allLogs = getAllStoredLogs();
  return calculatePrayerStreak(allLogs, referenceDate);
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

  const streakData = calculatePrayerStreak(allLogs, today);

  return {
    totalLogged,
    totalPossible,
    onTimeCount,
    lateCount,
    missedCount,
    unloggedCount,
    completionRate,
    currentStreakDays: streakData.currentStreak,
    bestStreakDays: streakData.longestStreak,
  };
}

// ----------------------------------------------------
// API Response Caching (via prayerRepository)
// ----------------------------------------------------

export function getCachedTheShiaResponse(
  lat: number,
  lng: number,
  dateStr: string,
  method: string
): TheShiaPrayerResponse | null {
  const cached = prayerRepository.getCachedPrayerTimes(lat, lng, dateStr, method);
  return cached?.data || null;
}

export function getCachedTheShiaWithMeta(
  lat: number,
  lng: number,
  dateStr: string,
  method: string
): { data: TheShiaPrayerResponse; meta: CachedPrayerTimesMeta } | null {
  return prayerRepository.getCachedPrayerTimes(lat, lng, dateStr, method);
}

export function setCachedTheShiaResponse(
  lat: number,
  lng: number,
  dateStr: string,
  method: string,
  data: TheShiaPrayerResponse
): void {
  prayerRepository.setCachedPrayerTimes(lat, lng, dateStr, method, data);
}
