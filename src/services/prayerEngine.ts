import {
  TheShiaPrayerResponse,
  TheShiaPrayerDay,
  UserPrayerLocation,
  PrayerId,
  ObligatoryPrayerId,
  PrayerItemView,
  NextPrayerCountdown,
  PrayerStatus,
  PrayerLogRecord
} from '../types/prayer';
import {
  fetchTheShiaPrayerTimes,
  formatTime12,
  formatDateISO,
  getUserTimeZone,
  PRAYER_NAMES_AR,
  DISPLAY_PRAYERS_ORDER,
  requestBrowserLocation,
  PRESET_PRAYER_CITIES
} from './theShiaPrayerService';
import {
  getCachedTheShiaWithMeta,
  setCachedTheShiaResponse,
  getLogsForDate,
  savePrayerLog,
  removePrayerLog,
  getStoredUserSettings,
  saveStoredUserSettings
} from './prayerStorage';
import { prayerRepository } from './prayerRepository';
import { CachedPrayerTimesMeta } from '../types/prayer';

export class PrayerEngine {
  private static instance: PrayerEngine;

  private constructor() {}

  public static getInstance(): PrayerEngine {
    if (!PrayerEngine.instance) {
      PrayerEngine.instance = new PrayerEngine();
    }
    return PrayerEngine.instance;
  }

  /**
   * Fetch prayer times with offline caching, metadata and network fallback
   */
  public async getPrayerTimesWithMeta(
    location: UserPrayerLocation,
    dateStr: string = formatDateISO(new Date()),
    method: string = 'Jafari'
  ): Promise<{ data: TheShiaPrayerResponse; meta: CachedPrayerTimesMeta; isFromCache: boolean }> {
    const isOnline = prayerRepository.isOnline();

    if (!isOnline) {
      const cached = getCachedTheShiaWithMeta(location.lat, location.lng, dateStr, method);
      if (cached) {
        return { data: cached.data, meta: cached.meta, isFromCache: true };
      }
      throw new Error('لا توجد بيانات محفوظة لهذا اليوم. يرجى الاتصال بالإنترنت لتحميل المواقيت.');
    }

    try {
      const response = await fetchTheShiaPrayerTimes({
        lat: location.lat,
        lng: location.lng,
        date: dateStr,
        tz: location.tz || getUserTimeZone(),
        method,
      });

      setCachedTheShiaResponse(location.lat, location.lng, dateStr, method, response);
      const cached = getCachedTheShiaWithMeta(location.lat, location.lng, dateStr, method);
      return {
        data: response,
        meta: cached?.meta || {
          source: 'TheShia',
          cachedAt: Date.now(),
          humanAge: 'مباشر الآن',
          date: dateStr,
          lat: location.lat,
          lng: location.lng,
          tz: location.tz || '',
          method,
          isStale: false,
        },
        isFromCache: false,
      };
    } catch (networkErr: any) {
      // Network failed - fallback to cached data if available
      const cached = getCachedTheShiaWithMeta(location.lat, location.lng, dateStr, method);
      if (cached) {
        return { data: cached.data, meta: cached.meta, isFromCache: true };
      }
      throw new Error(
        networkErr?.message || 'تعذر جلب مواقيت الصلاة ولا توجد بيانات محفوظة محلياً.'
      );
    }
  }

  /**
   * Standard fetch prayer times
   */
  public async getPrayerTimesByDate(
    location: UserPrayerLocation,
    dateStr: string = formatDateISO(new Date()),
    method: string = 'Jafari'
  ): Promise<TheShiaPrayerResponse> {
    const result = await this.getPrayerTimesWithMeta(location, dateStr, method);
    return result.data;
  }

  public async getTodayPrayerTimes(location: UserPrayerLocation): Promise<TheShiaPrayerResponse> {
    return this.getPrayerTimesByDate(location, formatDateISO(new Date()));
  }

  /**
   * Determine Prayer Status based on actual logs and current time
   */
  public getPrayerStatus(
    _prayerId: PrayerId,
    utcIso: string,
    log?: PrayerLogRecord,
    now: Date = new Date()
  ): PrayerStatus {
    // If the user already logged this prayer, return their logged status
    if (log) {
      return log.status;
    }

    const nowMs = now.getTime();
    const targetMs = new Date(utcIso).getTime();

    if (nowMs < targetMs) {
      return 'upcoming';
    }

    // If time has passed and no log exists, the status is unlogged (NOT missed)
    return 'unlogged';
  }

  /**
   * Build complete PrayerItemView array for a given day
   */
  public buildPrayerItems(
    day: TheShiaPrayerDay,
    dateStr: string,
    now: Date = new Date()
  ): PrayerItemView[] {
    const logs = getLogsForDate(dateStr);
    const nowMs = now.getTime();

    const ids: PrayerId[] = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'];

    return ids.map((id) => {
      const utcIso = day[id];
      const time24 = day.local[id] || '';
      const time12 = formatTime12(time24);
      const timeMs = new Date(utcIso).getTime();
      const isPassed = timeMs <= nowMs;
      const log = (id === 'fajr' || id === 'dhuhr' || id === 'asr' || id === 'maghrib' || id === 'isha')
        ? logs[id]
        : undefined;

      return {
        id,
        nameAr: PRAYER_NAMES_AR[id],
        time12,
        time24,
        utcIso,
        isPrimary: DISPLAY_PRAYERS_ORDER.includes(id) || id === 'midnight',
        isPassed,
        isNext: false,
        isCurrent: false,
        log,
      };
    });
  }

  /**
   * Calculate Next upcoming prayer with realtime countdown
   */
  public getNextPrayer(
    day: TheShiaPrayerDay,
    nextDayFajrUtcIso?: string,
    nextDayFajrLocal?: string,
    now: Date = new Date()
  ): NextPrayerCountdown | null {
    const nowMs = now.getTime();
    const sequenceIds: PrayerId[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const items = sequenceIds.map((id) => {
      const utcIso = day[id];
      const time24 = day.local[id] || '';
      const time12 = formatTime12(time24);
      const timeMs = new Date(utcIso).getTime();
      return {
        id,
        nameAr: PRAYER_NAMES_AR[id],
        time12,
        time24,
        utcIso,
        isPrimary: true,
        isPassed: timeMs <= nowMs,
        isNext: false,
        isCurrent: false,
      };
    });

    for (const item of items) {
      const targetMs = new Date(item.utcIso).getTime();
      if (targetMs > nowMs) {
        item.isNext = true;
        const diffMs = targetMs - nowMs;
        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;

        const pad = (n: number) => String(n).padStart(2, '0');
        const formattedCountdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        let humanRemaining = '';
        if (hours === 0 && minutes === 0) humanRemaining = 'خلال ثوانٍ معدودة';
        else if (hours === 0) humanRemaining = `متبقي ${minutes} دقيقة`;
        else if (hours === 1) humanRemaining = minutes > 0 ? `متبقي ساعة و ${minutes} دقيقة` : 'متبقي ساعة واحدة';
        else if (hours === 2) humanRemaining = minutes > 0 ? `متبقي ساعتان و ${minutes} دقيقة` : 'متبقي ساعتان';
        else humanRemaining = `متبقي ${hours} ساعة و ${minutes} دقيقة`;

        return {
          prayer: item,
          remainingMs: diffMs,
          hours,
          minutes,
          seconds,
          formattedCountdown,
          humanRemaining,
          isTomorrow: false,
        };
      }
    }

    // Tomorrow Fajr fallback
    const targetFajrMs = nextDayFajrUtcIso
      ? new Date(nextDayFajrUtcIso).getTime()
      : new Date(day.fajr).getTime() + 86400000;

    const diffMs = Math.max(0, targetFajrMs - nowMs);
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedCountdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    let humanRemaining = '';
    if (hours === 0 && minutes === 0) humanRemaining = 'خلال ثوانٍ معدودة';
    else if (hours === 0) humanRemaining = `متبقي ${minutes} دقيقة`;
    else if (hours === 1) humanRemaining = minutes > 0 ? `متبقي ساعة و ${minutes} دقيقة` : 'متبقي ساعة واحدة';
    else if (hours === 2) humanRemaining = minutes > 0 ? `متبقي ساعتان و ${minutes} دقيقة` : 'متبقي ساعتان';
    else humanRemaining = `متبقي ${hours} ساعة و ${minutes} دقيقة`;

    const fajrTomorrow: PrayerItemView = {
      id: 'fajr',
      nameAr: 'الفجر',
      time12: nextDayFajrLocal ? formatTime12(nextDayFajrLocal) : formatTime12(day.local.fajr),
      time24: nextDayFajrLocal || day.local.fajr,
      utcIso: nextDayFajrUtcIso || new Date(targetFajrMs).toISOString(),
      isPrimary: true,
      isPassed: false,
      isNext: true,
      isCurrent: false,
    };

    return {
      prayer: fajrTomorrow,
      remainingMs: diffMs,
      hours,
      minutes,
      seconds,
      formattedCountdown,
      humanRemaining,
      isTomorrow: true,
    };
  }

  /**
   * Determine Current Prayer
   */
  public getCurrentPrayer(day: TheShiaPrayerDay, now: Date = new Date()): PrayerId | null {
    const nowMs = now.getTime();
    const sequence: PrayerId[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight'];

    let current: PrayerId | null = null;
    for (const id of sequence) {
      const utcMs = new Date(day[id]).getTime();
      if (nowMs >= utcMs) {
        current = id;
      }
    }
    return current;
  }

  /**
   * Quick Log Prayer (One-tap in under a second)
   */
  public quickLogPrayer(
    dateStr: string,
    prayer: ObligatoryPrayerId,
    scheduledTime24: string = '',
    customStatus?: 'prayed_on_time' | 'prayed_late' | 'missed'
  ): PrayerLogRecord {
    let status: 'prayed_on_time' | 'prayed_late' | 'missed' = customStatus || 'prayed_on_time';

    // If no custom status provided, determine automatically based on time comparison
    if (!customStatus && scheduledTime24) {
      const now = new Date();
      const [hS, mS] = scheduledTime24.split(':').map(Number);
      const scheduledMinutes = hS * 60 + mS;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // If logged more than 45 minutes after prayer scheduled time (or past prayer window) -> prayed_late
      if (currentMinutes > scheduledMinutes + 45) {
        status = 'prayed_late';
      } else {
        status = 'prayed_on_time';
      }
    }

    return savePrayerLog(dateStr, prayer, status, scheduledTime24);
  }

  /**
   * Remove or edit log
   */
  public removeLog(dateStr: string, prayer: ObligatoryPrayerId): void {
    removePrayerLog(dateStr, prayer);
  }

  /**
   * Refresh Geolocation
   */
  public async refreshLocation(): Promise<UserPrayerLocation> {
    const coords = await requestBrowserLocation();
    const tz = getUserTimeZone();

    const matched = PRESET_PRAYER_CITIES.find(
      (c) => Math.abs(c.lat - coords.lat) < 0.3 && Math.abs(c.lng - coords.lng) < 0.3
    );

    const location: UserPrayerLocation = {
      lat: coords.lat,
      lng: coords.lng,
      cityName: matched ? matched.cityName : 'Current Location',
      cityNameAr: matched ? matched.cityNameAr : 'موقعي الحالي',
      countryName: matched?.countryName,
      countryNameAr: matched?.countryNameAr,
      tz,
      isGeolocation: true,
    };

    const settings = getStoredUserSettings();
    settings.location = location;
    saveStoredUserSettings(settings);

    return location;
  }
}

export const prayerEngine = PrayerEngine.getInstance();
