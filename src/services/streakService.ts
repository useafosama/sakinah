import {
  ObligatoryPrayerId,
  PrayerLogRecord,
  PrayerStreakData,
  DailyStreakDay,
  DayCompletionStatus
} from '../types/prayer';
import { formatDateISO } from './theShiaPrayerService';

export const OBLIGATORY_PRAYERS: ObligatoryPrayerId[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

const ARABIC_DAYS = [
  { name: 'الأحد', letter: 'ح' },
  { name: 'الإثنين', letter: 'ن' },
  { name: 'الثلاثاء', letter: 'ث' },
  { name: 'الأربعاء', letter: 'ر' },
  { name: 'الخميس', letter: 'خ' },
  { name: 'الجمعة', letter: 'ج' },
  { name: 'السبت', letter: 'س' },
];

type LogsMap = Record<string, Partial<Record<ObligatoryPrayerId, PrayerLogRecord>>>;

/**
 * Determines whether a given day has all 5 obligatory prayers successfully completed.
 * Allowed statuses: 'prayed_on_time' | 'prayed_late'
 * 'missed' or missing (unlogged) means the day is incomplete.
 */
export function isDayComplete(
  dayLogs: Partial<Record<ObligatoryPrayerId, PrayerLogRecord>> | undefined
): boolean {
  if (!dayLogs) return false;
  for (const prayer of OBLIGATORY_PRAYERS) {
    const log = dayLogs[prayer];
    if (!log) return false;
    if (log.status !== 'prayed_on_time' && log.status !== 'prayed_late') {
      return false;
    }
  }
  return true;
}

/**
 * Counts the number of completed obligatory prayers for a given day (0 - 5)
 */
export function getCompletedPrayersCount(
  dayLogs: Partial<Record<ObligatoryPrayerId, PrayerLogRecord>> | undefined
): number {
  if (!dayLogs) return 0;
  let count = 0;
  for (const prayer of OBLIGATORY_PRAYERS) {
    const log = dayLogs[prayer];
    if (log && (log.status === 'prayed_on_time' || log.status === 'prayed_late')) {
      count++;
    }
  }
  return count;
}

/**
 * Calculates comprehensive, private personal prayer streaks and consistency metrics
 */
export function calculatePrayerStreak(
  allLogs: LogsMap,
  referenceDate: Date = new Date()
): PrayerStreakData {
  const todayStr = formatDateISO(referenceDate);
  const todayLogs = allLogs[todayStr] || {};
  const todayCompletedCount = getCompletedPrayersCount(todayLogs);
  const todayIsComplete = isDayComplete(todayLogs);

  const todayStatus: 'completed' | 'in_progress' | 'not_started' = todayIsComplete
    ? 'completed'
    : todayCompletedCount > 0
    ? 'in_progress'
    : 'not_started';

  // ----------------------------------------------------
  // Current Streak Calculation
  // ----------------------------------------------------
  let currentStreak = 0;

  if (todayIsComplete) {
    // If today is complete, streak includes today and counts backwards
    currentStreak = 1;
    let daysBack = 1;
    while (daysBack < 365) {
      const d = new Date(referenceDate);
      d.setDate(referenceDate.getDate() - daysBack);
      const dStr = formatDateISO(d);
      if (isDayComplete(allLogs[dStr])) {
        currentStreak++;
        daysBack++;
      } else {
        break;
      }
    }
  } else {
    // If today is in progress / not yet finished, streak is preserved from yesterday
    let daysBack = 1;
    while (daysBack < 365) {
      const d = new Date(referenceDate);
      d.setDate(referenceDate.getDate() - daysBack);
      const dStr = formatDateISO(d);
      if (isDayComplete(allLogs[dStr])) {
        currentStreak++;
        daysBack++;
      } else {
        break;
      }
    }
  }

  // ----------------------------------------------------
  // Longest Streak & Total Completed Days Calculation
  // ----------------------------------------------------
  let longestStreak = currentStreak;
  let tempStreak = 0;
  let completedDaysTotal = 0;

  // Scan up to 365 days back
  for (let i = 0; i < 365; i++) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    const dStr = formatDateISO(d);
    const complete = isDayComplete(allLogs[dStr]);

    if (complete) {
      completedDaysTotal++;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      // If inspecting today and it's not completed, don't reset the running streak for past days
      if (i === 0) {
        tempStreak = 0;
        continue;
      }
      tempStreak = 0;
    }
  }

  // ----------------------------------------------------
  // Weekly View (Last 7 days ending with today)
  // ----------------------------------------------------
  const weeklyDays: DailyStreakDay[] = [];
  let weeklyCompletedCount = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    const dStr = formatDateISO(d);
    const dayOfWeekIdx = d.getDay();
    const dayNameAr = ARABIC_DAYS[dayOfWeekIdx].name;
    const dayLetterAr = ARABIC_DAYS[dayOfWeekIdx].letter;
    const isThisDayToday = dStr === todayStr;

    const dayLogs = allLogs[dStr] || {};
    const count = getCompletedPrayersCount(dayLogs);
    const complete = isDayComplete(dayLogs);

    let status: DayCompletionStatus = 'incomplete';
    if (complete) {
      status = 'completed';
      weeklyCompletedCount++;
    } else if (isThisDayToday) {
      status = 'today_in_progress';
    } else {
      status = 'incomplete';
    }

    weeklyDays.push({
      date: dStr,
      dayNameAr,
      dayLetterAr,
      completedPrayersCount: count,
      totalPrayersCount: 5,
      status,
      isToday: isThisDayToday,
      isFuture: false,
    });
  }

  // ----------------------------------------------------
  // Monthly View (Days in current calendar month)
  // ----------------------------------------------------
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let monthlyCompletedCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    if (d.getTime() > referenceDate.getTime() && formatDateISO(d) !== todayStr) {
      continue; // skip future days of month
    }
    const dStr = formatDateISO(d);
    if (isDayComplete(allLogs[dStr])) {
      monthlyCompletedCount++;
    }
  }

  const completionPercentage =
    daysInMonth > 0 ? Math.round((monthlyCompletedCount / daysInMonth) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    completedDaysTotal,
    weeklyDays,
    weeklyCompletedCount,
    monthlyCompletedCount,
    monthlyTotalDays: daysInMonth,
    todayStatus,
    todayCompletedCount,
    completionPercentage,
  };
}
