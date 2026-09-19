import {
  TheShiaPrayerResponse,
  TheShiaPrayerDay,
  UserPrayerLocation,
  CitiesResponse,
  CityMatch,
  PrayerItemView,
  NextPrayerCountdown,
  PrayerId
} from '../types/prayer';

const BASE_URL = 'https://theshia.org/api/v1';
const DEFAULT_METHOD = 'Jafari';

export const DEFAULT_PRAYER_LOCATION: UserPrayerLocation = {
  lat: 30.0444,
  lng: 31.2357,
  cityName: 'Cairo',
  cityNameAr: 'القاهرة',
  countryName: 'Egypt',
  countryNameAr: 'مصر',
  tz: 'Africa/Cairo',
  isGeolocation: false,
};

export const PRESET_PRAYER_CITIES: UserPrayerLocation[] = [
  { lat: 30.0444, lng: 31.2357, cityName: 'Cairo', cityNameAr: 'القاهرة', countryName: 'Egypt', countryNameAr: 'مصر', tz: 'Africa/Cairo', isGeolocation: false },
  { lat: 31.2001, lng: 29.9187, cityName: 'Alexandria', cityNameAr: 'الإسكندرية', countryName: 'Egypt', countryNameAr: 'مصر', tz: 'Africa/Cairo', isGeolocation: false },
  { lat: 21.4225, lng: 39.8262, cityName: 'Makkah', cityNameAr: 'مكة المكرمة', countryName: 'Saudi Arabia', countryNameAr: 'السعودية', tz: 'Asia/Riyadh', isGeolocation: false },
  { lat: 24.5247, lng: 39.5692, cityName: 'Madinah', cityNameAr: 'المدينة المنورة', countryName: 'Saudi Arabia', countryNameAr: 'السعودية', tz: 'Asia/Riyadh', isGeolocation: false },
  { lat: 24.7136, lng: 46.6753, cityName: 'Riyadh', cityNameAr: 'الرياض', countryName: 'Saudi Arabia', countryNameAr: 'السعودية', tz: 'Asia/Riyadh', isGeolocation: false },
  { lat: 21.5433, lng: 39.1728, cityName: 'Jeddah', cityNameAr: 'جدة', countryName: 'Saudi Arabia', countryNameAr: 'السعودية', tz: 'Asia/Riyadh', isGeolocation: false },
  { lat: 31.7683, lng: 35.2137, cityName: 'Jerusalem', cityNameAr: 'القدس الشريف', countryName: 'Palestine', countryNameAr: 'فلسطين', tz: 'Asia/Jerusalem', isGeolocation: false },
  { lat: 32.0000, lng: 44.3333, cityName: 'Najaf', cityNameAr: 'النجف الأشرف', countryName: 'Iraq', countryNameAr: 'العراق', tz: 'Asia/Baghdad', isGeolocation: false },
  { lat: 32.6160, lng: 44.0249, cityName: 'Karbala', cityNameAr: 'كربلاء المقدسة', countryName: 'Iraq', countryNameAr: 'العراق', tz: 'Asia/Baghdad', isGeolocation: false },
  { lat: 33.3152, lng: 44.3661, cityName: 'Baghdad', cityNameAr: 'بغداد', countryName: 'Iraq', countryNameAr: 'العراق', tz: 'Asia/Baghdad', isGeolocation: false },
  { lat: 30.5085, lng: 47.7804, cityName: 'Basra', cityNameAr: 'البصرة', countryName: 'Iraq', countryNameAr: 'العراق', tz: 'Asia/Baghdad', isGeolocation: false },
  { lat: 36.2972, lng: 59.6067, cityName: 'Mashhad', cityNameAr: 'مشهد المقدسة', countryName: 'Iran', countryNameAr: 'إيران', tz: 'Asia/Tehran', isGeolocation: false },
  { lat: 34.6399, lng: 50.8759, cityName: 'Qom', cityNameAr: 'قم المقدسة', countryName: 'Iran', countryNameAr: 'إيران', tz: 'Asia/Tehran', isGeolocation: false },
  { lat: 35.6892, lng: 51.3890, cityName: 'Tehran', cityNameAr: 'طهران', countryName: 'Iran', countryNameAr: 'إيران', tz: 'Asia/Tehran', isGeolocation: false },
  { lat: 25.2048, lng: 55.2708, cityName: 'Dubai', cityNameAr: 'دبي', countryName: 'United Arab Emirates', countryNameAr: 'الإمارات', tz: 'Asia/Dubai', isGeolocation: false },
  { lat: 24.4539, lng: 54.3773, cityName: 'Abu Dhabi', cityNameAr: 'أبوظبي', countryName: 'United Arab Emirates', countryNameAr: 'الإمارات', tz: 'Asia/Dubai', isGeolocation: false },
  { lat: 25.2854, lng: 51.5310, cityName: 'Doha', cityNameAr: 'الدوحة', countryName: 'Qatar', countryNameAr: 'قطر', tz: 'Asia/Qatar', isGeolocation: false },
  { lat: 29.3759, lng: 47.9774, cityName: 'Kuwait City', cityNameAr: 'الكويت', countryName: 'Kuwait', countryNameAr: 'الكويت', tz: 'Asia/Kuwait', isGeolocation: false },
  { lat: 26.2285, lng: 50.5860, cityName: 'Manama', cityNameAr: 'المنامة', countryName: 'Bahrain', countryNameAr: 'البحرين', tz: 'Asia/Bahrain', isGeolocation: false },
  { lat: 23.5880, lng: 58.3829, cityName: 'Muscat', cityNameAr: 'مسقط', countryName: 'Oman', countryNameAr: 'عُمان', tz: 'Asia/Muscat', isGeolocation: false },
  { lat: 33.8938, lng: 35.5018, cityName: 'Beirut', cityNameAr: 'بيروت', countryName: 'Lebanon', countryNameAr: 'لبنان', tz: 'Asia/Beirut', isGeolocation: false },
  { lat: 33.5138, lng: 36.2765, cityName: 'Damascus', cityNameAr: 'دمشق', countryName: 'Syria', countryNameAr: 'سوريا', tz: 'Asia/Damascus', isGeolocation: false },
  { lat: 31.9454, lng: 35.9284, cityName: 'Amman', cityNameAr: 'عمّان', countryName: 'Jordan', countryNameAr: 'الأردن', tz: 'Asia/Amman', isGeolocation: false },
  { lat: 36.7538, lng: 3.0588, cityName: 'Algiers', cityNameAr: 'الجزائر', countryName: 'Algeria', countryNameAr: 'الجزائر', tz: 'Africa/Algiers', isGeolocation: false },
  { lat: 36.8065, lng: 10.1815, cityName: 'Tunis', cityNameAr: 'تونس', countryName: 'Tunisia', countryNameAr: 'تونس', tz: 'Africa/Tunis', isGeolocation: false },
  { lat: 34.0209, lng: -6.8416, cityName: 'Rabat', cityNameAr: 'الرباط', countryName: 'Morocco', countryNameAr: 'المغرب', tz: 'Africa/Casablanca', isGeolocation: false },
  { lat: 32.8872, lng: 13.1913, cityName: 'Tripoli', cityNameAr: 'طرابلس', countryName: 'Libya', countryNameAr: 'ليبيا', tz: 'Africa/Tripoli', isGeolocation: false },
  { lat: 15.3694, lng: 44.1910, cityName: 'Sanaa', cityNameAr: 'صنعاء', countryName: 'Yemen', countryNameAr: 'اليمن', tz: 'Asia/Aden', isGeolocation: false },
  { lat: 15.5007, lng: 32.5599, cityName: 'Khartoum', cityNameAr: 'الخرطوم', countryName: 'Sudan', countryNameAr: 'السودان', tz: 'Africa/Khartoum', isGeolocation: false },
  { lat: 41.0082, lng: 28.9784, cityName: 'Istanbul', cityNameAr: 'إسطنبول', countryName: 'Turkey', countryNameAr: 'تركيا', tz: 'Europe/Istanbul', isGeolocation: false },
  { lat: 51.5074, lng: -0.1278, cityName: 'London', cityNameAr: 'لندن', countryName: 'United Kingdom', countryNameAr: 'بريطانيا', tz: 'Europe/London', isGeolocation: false },
  { lat: 48.8566, lng: 2.3522, cityName: 'Paris', cityNameAr: 'باريس', countryName: 'France', countryNameAr: 'فرنسا', tz: 'Europe/Paris', isGeolocation: false },
  { lat: 40.7128, lng: -74.0060, cityName: 'New York', cityNameAr: 'نيويورك', countryName: 'United States', countryNameAr: 'أمريكا', tz: 'America/New_York', isGeolocation: false },
];

export const PRAYER_NAMES_AR: Record<PrayerId, string> = {
  imsak: 'الإمساك',
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  sunset: 'الغروب',
  maghrib: 'المغرب',
  isha: 'العشاء',
  midnight: 'منتصف الليل',
};

/**
 * Ordered primary prayers to display prominently
 */
export const DISPLAY_PRAYERS_ORDER: PrayerId[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

/**
 * Format "16:17" or "05:31" to Arabic 12-hour format e.g. "4:17 م" or "5:31 ص"
 */
export function formatTime12(time24: string): string {
  if (!time24) return '';
  const cleanTime = time24.split(' ')[0];
  const [hStr, mStr] = cleanTime.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;

  const isPm = h >= 12;
  const suffix = isPm ? 'م' : 'ص';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  const minutePadded = String(m).padStart(2, '0');
  return `${h}:${minutePadded} ${suffix}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * User Timezone helper
 */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
  } catch {
    return 'Africa/Cairo';
  }
}

const CACHE_PREFIX = 'sakinah_theshia_prayer_v1_';

export function getCachedPrayerData(
  lat: number,
  lng: number,
  dateStr: string,
  method: string = DEFAULT_METHOD
): TheShiaPrayerResponse | null {
  try {
    const key = `${CACHE_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateStr}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    // Cache valid for 24 hours
    if (Date.now() - item.cachedAt > 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data as TheShiaPrayerResponse;
  } catch {
    return null;
  }
}

export function setCachedPrayerData(
  lat: number,
  lng: number,
  dateStr: string,
  data: TheShiaPrayerResponse,
  method: string = DEFAULT_METHOD
): void {
  try {
    const key = `${CACHE_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateStr}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage quota
  }
}

export function getSavedUserLocation(): UserPrayerLocation {
  try {
    const raw = localStorage.getItem('sakinah_theshia_user_location_v1');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_PRAYER_LOCATION;
}

export function saveUserLocation(loc: UserPrayerLocation): void {
  try {
    localStorage.setItem('sakinah_theshia_user_location_v1', JSON.stringify(loc));
  } catch {
    // ignore
  }
}

/**
 * Request Geolocation permission from the browser
 */
export function requestBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم خاصية تحديد الموقع'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'لم نتمكن من الوصول إلى موقعك. يمكنك اختيار مدينتك يدويًا.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'تم رفض إذن تحديد الموقع. يمكنك اختيار مدينتك يدوياً أو تفعيل الإذن من إعدادات المتصفح.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'انتهت مهلة طلب تحديد الموقع. يرجى المحاولة مجدداً أو اختيار المدينة يدوياً.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Fetch Prayer Times from TheShia API
 */
export async function fetchTheShiaPrayerTimes(params: {
  lat: number;
  lng: number;
  date?: string;
  tz?: string;
  method?: string;
}): Promise<TheShiaPrayerResponse> {
  const dateStr = params.date || formatDateISO();
  const method = params.method || DEFAULT_METHOD;
  const tz = params.tz || getUserTimeZone();

  // Check cache first
  const cached = getCachedPrayerData(params.lat, params.lng, dateStr, method);
  if (cached) {
    return cached;
  }

  const query = new URLSearchParams({
    lat: params.lat.toFixed(4),
    lng: params.lng.toFixed(4),
    method,
    tz,
    date: dateStr,
  });

  const url = `${BASE_URL}/prayer-times?${query.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`خطأ في استجابة الخادم: ${res.status}`);
    }

    const json = (await res.json()) as TheShiaPrayerResponse;
    if (!json.days || json.days.length === 0) {
      throw new Error('لم يتم استلام مواقيت الصلاة لهذا التاريخ');
    }

    // Save to cache
    setCachedPrayerData(params.lat, params.lng, dateStr, json, method);
    return json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    // If offline, check if any cache exists
    if (cached) return cached;
    throw new Error(err?.message || 'تعذر تحميل مواقيت الصلاة حاليًا. حاول مرة أخرى.');
  }
}

/**
 * Search cities using TheShia cities API
 */
export async function searchTheShiaCities(query: string): Promise<CityMatch[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const url = `${BASE_URL}/cities?q=${encodeURIComponent(cleanQ)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as CitiesResponse;
    return data.matches || [];
  } catch (err) {
    console.warn('City search failed:', err);
    return [];
  }
}

/**
 * Convert TheShiaPrayerDay into structured display items
 */
export function buildPrayerItems(day: TheShiaPrayerDay, nowMs: number = Date.now()): PrayerItemView[] {
  const ids: PrayerId[] = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'];

  return ids.map((id) => {
    const utcIso = day[id];
    const time24 = day.local[id] || '';
    const time12 = formatTime12(time24);
    const timeMs = new Date(utcIso).getTime();
    const isPassed = timeMs <= nowMs;

    return {
      id,
      nameAr: PRAYER_NAMES_AR[id],
      time12,
      time24,
      utcIso,
      isPrimary: DISPLAY_PRAYERS_ORDER.includes(id) || id === 'midnight',
      isPassed,
      isNext: false,
    };
  });
}

/**
 * Calculate the next upcoming prayer using exact UTC timestamps
 */
export function calculateNextPrayer(
  day: TheShiaPrayerDay,
  nextDayFajrUtcIso?: string,
  nextDayFajrLocal?: string,
  nowDate: Date = new Date()
): NextPrayerCountdown | null {
  const nowMs = nowDate.getTime();

  // Primary prayers in sequence to check for upcoming
  const sequenceIds: PrayerId[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const items: PrayerItemView[] = sequenceIds.map((id) => {
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
    };
  });

  // Find first prayer whose UTC timestamp is greater than nowMs
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

  // If all prayers today have passed, the next prayer is Fajr of tomorrow
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
 * Format Arabic date with weekday, day, month, and year
 */
export function formatArabicDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-EG');
  }
}

/**
 * Calculate Hijri Date approximately or using Intl
 */
export function formatHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}
