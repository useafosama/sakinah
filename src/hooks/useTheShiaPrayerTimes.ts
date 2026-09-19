import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TheShiaPrayerResponse,
  TheShiaPrayerDay,
  UserPrayerLocation,
  NextPrayerCountdown,
  PrayerItemView
} from '../types/prayer';
import {
  getSavedUserLocation,
  saveUserLocation,
  fetchTheShiaPrayerTimes,
  requestBrowserLocation,
  calculateNextPrayer,
  buildPrayerItems,
  formatDateISO,
  formatArabicDate,
  formatHijriDate,
  getUserTimeZone,
  PRESET_PRAYER_CITIES
} from '../services/theShiaPrayerService';

export function useTheShiaPrayerTimes() {
  const [location, setLocation] = useState<UserPrayerLocation>(getSavedUserLocation);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateISO(new Date()));
  const [data, setData] = useState<TheShiaPrayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Current day data
  const currentDay: TheShiaPrayerDay | null = useMemo(() => {
    if (!data || !data.days || data.days.length === 0) return null;
    return data.days.find((d) => d.date === selectedDateStr) || data.days[0];
  }, [data, selectedDateStr]);

  // Selected date as Date object
  const selectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  }, [selectedDateStr]);

  const isToday = useMemo(() => {
    return selectedDateStr === formatDateISO(new Date());
  }, [selectedDateStr]);

  // Fetch timings
  const loadPrayerTimes = useCallback(
    async (loc: UserPrayerLocation, dateStr: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTheShiaPrayerTimes({
          lat: loc.lat,
          lng: loc.lng,
          date: dateStr,
          tz: loc.tz || getUserTimeZone(),
          method: 'Jafari',
        });
        setData(res);
      } catch (err: any) {
        console.error('Error fetching prayer times:', err);
        setError(err?.message || 'تعذر تحميل مواقيت الصلاة حاليًا. حاول مرة أخرى.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load on location or date change
  useEffect(() => {
    loadPrayerTimes(location, selectedDateStr);
  }, [location, selectedDateStr, loadPrayerTimes]);

  // Real-time live countdown updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request browser geolocation
  const handleRequestLocation = useCallback(async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const coords = await requestBrowserLocation();
      const tz = getUserTimeZone();

      // Check if matches any known preset city closely
      let matchedCity = PRESET_PRAYER_CITIES.find(
        (c) => Math.abs(c.lat - coords.lat) < 0.3 && Math.abs(c.lng - coords.lng) < 0.3
      );

      const newLoc: UserPrayerLocation = {
        lat: coords.lat,
        lng: coords.lng,
        cityName: matchedCity ? matchedCity.cityName : 'Current Location',
        cityNameAr: matchedCity ? matchedCity.cityNameAr : 'موقعي الحالي',
        countryName: matchedCity?.countryName,
        countryNameAr: matchedCity?.countryNameAr,
        tz,
        isGeolocation: true,
      };

      setLocation(newLoc);
      saveUserLocation(newLoc);
    } catch (err: any) {
      console.warn('Geolocation failed:', err);
      setGeoError(err?.message || 'لم نتمكن من الوصول إلى موقعك. يمكنك اختيار مدينتك يدويًا.');
    } finally {
      setGeoLoading(false);
    }
  }, []);

  // Set city manually
  const handleSelectCity = useCallback((newLoc: UserPrayerLocation) => {
    setGeoError(null);
    setLocation(newLoc);
    saveUserLocation(newLoc);
  }, []);

  // Day navigation
  const goToNextDay = useCallback(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(formatDateISO(d));
  }, [selectedDate]);

  const goToPreviousDay = useCallback(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(formatDateISO(d));
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDateStr(formatDateISO(new Date()));
  }, []);

  // Next prayer calculation
  const nextPrayer: NextPrayerCountdown | null = useMemo(() => {
    if (!currentDay) return null;
    return calculateNextPrayer(currentDay, undefined, undefined, now);
  }, [currentDay, now]);

  // Structured prayer items for display
  const prayerItems: PrayerItemView[] = useMemo(() => {
    if (!currentDay) return [];
    const items = buildPrayerItems(currentDay, now.getTime());
    if (nextPrayer && isToday) {
      const target = items.find((it) => it.id === nextPrayer.prayer.id);
      if (target) target.isNext = true;
    }
    return items;
  }, [currentDay, nextPrayer, now, isToday]);

  // Formatted date labels
  const formattedGregorianDate = useMemo(() => formatArabicDate(selectedDate), [selectedDate]);
  const formattedHijriDate = useMemo(() => formatHijriDate(selectedDate), [selectedDate]);

  return {
    location,
    selectedDate,
    selectedDateStr,
    isToday,
    data,
    currentDay,
    prayerItems,
    nextPrayer,
    loading,
    error,
    geoLoading,
    geoError,
    formattedGregorianDate,
    formattedHijriDate,
    requestLocation: handleRequestLocation,
    selectCity: handleSelectCity,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    refresh: () => loadPrayerTimes(location, selectedDateStr),
  };
}
