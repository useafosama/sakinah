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

export type PrayerId = 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'sunset' | 'maghrib' | 'isha' | 'midnight';

export interface PrayerItemView {
  id: PrayerId;
  nameAr: string;
  time12: string;
  time24: string;
  utcIso: string;
  isPrimary: boolean;
  isPassed: boolean;
  isNext: boolean;
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
