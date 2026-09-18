export interface PrayerLocation {
  city: string;
  cityNameArabic: string;
  country: string;
  countryNameArabic: string;
  method?: number;
}

export interface PrayerTimeItem {
  id: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  nameArabic: string;
  time24: string;
  time12: string;
}

export interface PrayerTimesData {
  timings: Record<string, string>;
  dateGregorian: string;
  dateHijri: string;
  location: PrayerLocation;
  methodName: string;
  fetchedAt: number;
}

export interface NextPrayerInfo {
  id: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  nameArabic: string;
  time12: string;
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isTomorrow: boolean;
}

export const DEFAULT_LOCATION: PrayerLocation = {
  city: 'Cairo',
  cityNameArabic: 'القاهرة',
  country: 'Egypt',
  countryNameArabic: 'مصر',
  method: 5, // Egyptian General Authority of Survey
};

export const PRESET_LOCATIONS: PrayerLocation[] = [
  { city: 'Cairo', cityNameArabic: 'القاهرة', country: 'Egypt', countryNameArabic: 'مصر', method: 5 },
  { city: 'Alexandria', cityNameArabic: 'الإسكندرية', country: 'Egypt', countryNameArabic: 'مصر', method: 5 },
  { city: 'Giza', cityNameArabic: 'الجيزة', country: 'Egypt', countryNameArabic: 'مصر', method: 5 },
  { city: 'Makkah', cityNameArabic: 'مكة المكرمة', country: 'Saudi Arabia', countryNameArabic: 'السعودية', method: 4 },
  { city: 'Madinah', cityNameArabic: 'المدينة المنورة', country: 'Saudi Arabia', countryNameArabic: 'السعودية', method: 4 },
  { city: 'Riyadh', cityNameArabic: 'الرياض', country: 'Saudi Arabia', countryNameArabic: 'السعودية', method: 4 },
  { city: 'Jeddah', cityNameArabic: 'جدة', country: 'Saudi Arabia', countryNameArabic: 'السعودية', method: 4 },
  { city: 'Jerusalem', cityNameArabic: 'القدس الشريف', country: 'Palestine', countryNameArabic: 'فلسطين', method: 3 },
  { city: 'Dubai', cityNameArabic: 'دبي', country: 'United Arab Emirates', countryNameArabic: 'الإمارات', method: 4 },
  { city: 'Abu Dhabi', cityNameArabic: 'أبوظبي', country: 'United Arab Emirates', countryNameArabic: 'الإمارات', method: 4 },
  { city: 'Doha', cityNameArabic: 'الدوحة', country: 'Qatar', countryNameArabic: 'قطر', method: 4 },
  { city: 'Kuwait City', cityNameArabic: 'مدينة الكويت', country: 'Kuwait', countryNameArabic: 'الكويت', method: 4 },
  { city: 'Manama', cityNameArabic: 'المنامة', country: 'Bahrain', countryNameArabic: 'البحرين', method: 4 },
  { city: 'Muscat', cityNameArabic: 'مسقط', country: 'Oman', countryNameArabic: 'عُمان', method: 4 },
  { city: 'Amman', cityNameArabic: 'عمّان', country: 'Jordan', countryNameArabic: 'الأردن', method: 3 },
  { city: 'Beirut', cityNameArabic: 'بيروت', country: 'Lebanon', countryNameArabic: 'لبنان', method: 3 },
  { city: 'Damascus', cityNameArabic: 'دمشق', country: 'Syria', countryNameArabic: 'سوريا', method: 3 },
  { city: 'Baghdad', cityNameArabic: 'بغداد', country: 'Iraq', countryNameArabic: 'العراق', method: 3 },
  { city: 'Tripoli', cityNameArabic: 'طرابلس', country: 'Libya', countryNameArabic: 'ليبيا', method: 5 },
  { city: 'Tunis', cityNameArabic: 'تونس', country: 'Tunisia', countryNameArabic: 'تونس', method: 3 },
  { city: 'Algiers', cityNameArabic: 'الجزائر', country: 'Algeria', countryNameArabic: 'الجزائر', method: 3 },
  { city: 'Rabat', cityNameArabic: 'الرباط', country: 'Morocco', countryNameArabic: 'المغرب', method: 3 },
  { city: 'Khartoum', cityNameArabic: 'الخرطوم', country: 'Sudan', countryNameArabic: 'السودان', method: 5 },
  { city: 'Sanaa', cityNameArabic: 'صنعاء', country: 'Yemen', countryNameArabic: 'اليمن', method: 4 },
  { city: 'Istanbul', cityNameArabic: 'إسطنبول', country: 'Turkey', countryNameArabic: 'تركيا', method: 13 },
  { city: 'London', cityNameArabic: 'لندن', country: 'United Kingdom', countryNameArabic: 'بريطانيا', method: 2 },
  { city: 'Paris', cityNameArabic: 'باريس', country: 'France', countryNameArabic: 'فرنسا', method: 12 },
  { city: 'New York', cityNameArabic: 'نيويورك', country: 'United States', countryNameArabic: 'أمريكا', method: 2 }
];

export const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const PRAYER_ORDER: Array<'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'> = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

/**
 * Format "16:18" or "05:14" to Arabic 12-hour format e.g. "4:18 م" or "5:14 ص"
 */
export function formatTime12(time24: string): string {
  if (!time24) return '';
  // Strip any (EET) or timezone text
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
 * Get date string in DD-MM-YYYY format
 */
export function getDateKey(date: Date = new Date()): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const CACHE_PREFIX = 'sakinah_prayer_times_v1_';

export function getCachedPrayerTimes(location: PrayerLocation, dateKey: string): PrayerTimesData | null {
  try {
    const key = `${CACHE_PREFIX}${location.city}_${location.country}_${dateKey}`.toLowerCase();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PrayerTimesData;
  } catch {
    return null;
  }
}

export function setCachedPrayerTimes(location: PrayerLocation, dateKey: string, data: PrayerTimesData): void {
  try {
    const key = `${CACHE_PREFIX}${location.city}_${location.country}_${dateKey}`.toLowerCase();
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage limit
  }
}

export function getSavedLocation(): PrayerLocation {
  try {
    const raw = localStorage.getItem('sakinah_user_prayer_location');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(loc: PrayerLocation): void {
  try {
    localStorage.setItem('sakinah_user_prayer_location', JSON.stringify(loc));
  } catch {
    // ignore
  }
}

/**
 * Fetch prayer timings from AlAdhan API with timeout, caching and retry
 */
export async function fetchPrayerTimes(location: PrayerLocation, date: Date = new Date()): Promise<PrayerTimesData> {
  const dateKey = getDateKey(date);
  const method = location.method || (location.country.toLowerCase().includes('egypt') ? 5 : 4);
  const url = `https://api.aladhan.com/v1/timingsByCity/${dateKey}?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=${method}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();
    if (json.code !== 200 || !json.data || !json.data.timings) {
      throw new Error(json.data?.message || 'Invalid API response');
    }

    const timings = json.data.timings;
    const greg = json.data.date?.gregorian;
    const hijri = json.data.date?.hijri;

    // Format Arabic dates
    let dateGregorian = '';
    try {
      dateGregorian = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      dateGregorian = `${greg?.day || date.getDate()} ${greg?.month?.en || ''} ${greg?.year || date.getFullYear()}`;
    }

    const dateHijri = hijri
      ? `${hijri.day} ${hijri.month?.ar || hijri.month?.en} ${hijri.year} هـ`
      : '';

    const methodName = json.data.meta?.method?.name || (method === 5 ? 'الهيئة المصرية العامة للمساحة' : 'أم القرى');

    const result: PrayerTimesData = {
      timings,
      dateGregorian,
      dateHijri,
      location,
      methodName,
      fetchedAt: Date.now()
    };

    // Cache the result
    setCachedPrayerTimes(location, dateKey, result);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    // Try to load cached data for this day
    const cached = getCachedPrayerTimes(location, dateKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Calculate the next upcoming prayer and countdown
 */
export function calculateNextPrayer(timings: Record<string, string>, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  const totalCurrentSeconds = currentMinutes * 60 + currentSeconds;

  const prayerSecondsList: Array<{ id: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'; totalSec: number; time12: string }> = [];

  for (const id of PRAYER_ORDER) {
    const rawTime = timings[id];
    if (!rawTime) continue;
    const cleanTime = rawTime.split(' ')[0];
    const [hStr, mStr] = cleanTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) continue;

    prayerSecondsList.push({
      id,
      totalSec: (h * 60 + m) * 60,
      time12: formatTime12(rawTime)
    });
  }

  // Find first prayer that is strictly greater than current time
  for (const p of prayerSecondsList) {
    if (p.totalSec > totalCurrentSeconds) {
      const diffSec = p.totalSec - totalCurrentSeconds;
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      return {
        id: p.id,
        nameArabic: PRAYER_NAMES_AR[p.id] || p.id,
        time12: p.time12,
        remainingMs: diffSec * 1000,
        hours,
        minutes,
        seconds,
        isTomorrow: false
      };
    }
  }

  // If all prayers passed for today, next is Fajr tomorrow
  const fajr = prayerSecondsList.find(p => p.id === 'Fajr') || {
    id: 'Fajr' as const,
    totalSec: 5 * 3600,
    time12: formatTime12(timings['Fajr'] || '05:00')
  };

  const diffSec = (86400 - totalCurrentSeconds) + fajr.totalSec;
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  return {
    id: 'Fajr',
    nameArabic: 'الفجر',
    time12: fajr.time12,
    remainingMs: diffSec * 1000,
    hours,
    minutes,
    seconds,
    isTomorrow: true
  };
}
