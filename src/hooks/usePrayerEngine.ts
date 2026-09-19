import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TheShiaPrayerResponse,
  TheShiaPrayerDay,
  UserPrayerLocation,
  NextPrayerCountdown,
  PrayerItemView,
  ObligatoryPrayerId,
  PrayerUserSettings,
  PrayerStatisticsData,
  DayPrayerSummary
} from '../types/prayer';
import { prayerEngine } from '../services/prayerEngine';
import {
  getStoredUserSettings,
  saveStoredUserSettings,
  getDaySummary,
  getWeekSummaries,
  calculatePrayerStatistics,
  clearAllPrayerLogs
} from '../services/prayerStorage';
import {
  prayerNotificationService,
  NotificationStatus
} from '../services/prayerNotificationService';
import {
  formatDateISO,
  formatArabicDate,
  formatHijriDate
} from '../services/theShiaPrayerService';
import { useToast } from '../components/common/Toast';

export function usePrayerEngine() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<PrayerUserSettings>(getStoredUserSettings);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateISO(new Date()));
  const [data, setData] = useState<TheShiaPrayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [logsVersion, setLogsVersion] = useState<number>(0); // Trigger re-render on log updates
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>(() =>
    prayerNotificationService.getStatus()
  );

  const location = settings.location;

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

  // Current day data from API
  const currentDay: TheShiaPrayerDay | null = useMemo(() => {
    if (!data || !data.days || data.days.length === 0) return null;
    return data.days.find((d) => d.date === selectedDateStr) || data.days[0];
  }, [data, selectedDateStr]);

  // Fetch timings
  const loadTimings = useCallback(
    async (loc: UserPrayerLocation, dateStr: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await prayerEngine.getPrayerTimesByDate(loc, dateStr, settings.calculationMethod);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load prayer times:', err);
        setError(err?.message || 'تعذر تحميل مواقيت الصلاة حاليًا. حاول مرة أخرى.');
      } finally {
        setLoading(false);
      }
    },
    [settings.calculationMethod]
  );

  // Load timings whenever location or date changes
  useEffect(() => {
    loadTimings(location, selectedDateStr);
  }, [location, selectedDateStr, loadTimings]);

  // Central Countdown Timer (Once per second)
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);

      // Check if date rolled over past midnight
      if (isToday && formatDateISO(current) !== selectedDateStr) {
        setSelectedDateStr(formatDateISO(current));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isToday, selectedDateStr]);

  // Next Prayer calculation
  const nextPrayer: NextPrayerCountdown | null = useMemo(() => {
    if (!currentDay) return null;
    return prayerEngine.getNextPrayer(currentDay, undefined, undefined, now);
  }, [currentDay, now]);

  // Current active prayer
  const currentActivePrayer = useMemo(() => {
    if (!currentDay) return null;
    return prayerEngine.getCurrentPrayer(currentDay, now);
  }, [currentDay, now]);

  // Build items with logs
  const prayerItems: PrayerItemView[] = useMemo(() => {
    if (!currentDay) return [];
    // Dependency on logsVersion ensures fresh state
    const items = prayerEngine.buildPrayerItems(currentDay, selectedDateStr, now);
    if (nextPrayer && isToday) {
      const target = items.find((it) => it.id === nextPrayer.prayer.id);
      if (target) target.isNext = true;
    }
    if (currentActivePrayer && isToday) {
      const target = items.find((it) => it.id === currentActivePrayer);
      if (target) target.isCurrent = true;
    }
    return items;
  }, [currentDay, selectedDateStr, now, nextPrayer, currentActivePrayer, isToday, logsVersion]);

  // Quick log prayer
  const quickLog = useCallback(
    (prayer: ObligatoryPrayerId, scheduledTime24: string, customStatus?: 'prayed_on_time' | 'prayed_late' | 'missed') => {
      const log = prayerEngine.quickLogPrayer(selectedDateStr, prayer, scheduledTime24, customStatus);
      setLogsVersion((v) => v + 1);

      const prayerNamesAr: Record<ObligatoryPrayerId, string> = {
        fajr: 'الفجر',
        dhuhr: 'الظهر',
        asr: 'العصر',
        maghrib: 'المغرب',
        isha: 'العشاء',
      };

      const statusLabels = {
        prayed_on_time: 'في وقتها',
        prayed_late: 'متأخرة',
        missed: 'فائتة',
      };

      showToast(`تم تسجيل صلاة ${prayerNamesAr[prayer]} (${statusLabels[log.status]})`);
      return log;
    },
    [selectedDateStr, showToast]
  );

  // Remove prayer log
  const removeLog = useCallback(
    (prayer: ObligatoryPrayerId) => {
      prayerEngine.removeLog(selectedDateStr, prayer);
      setLogsVersion((v) => v + 1);
      showToast('تم إلغاء تسجيل الصلاة');
    },
    [selectedDateStr, showToast]
  );

  // Day summary
  const daySummary: DayPrayerSummary = useMemo(() => {
    return getDaySummary(selectedDateStr);
  }, [selectedDateStr, logsVersion]);

  // Week summaries
  const weekSummaries: DayPrayerSummary[] = useMemo(() => {
    return getWeekSummaries(selectedDate);
  }, [selectedDate, logsVersion]);

  // Overall statistics
  const statistics: PrayerStatisticsData = useMemo(() => {
    return calculatePrayerStatistics(30);
  }, [logsVersion]);

  // Geolocation request
  const requestLocation = useCallback(async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const newLoc = await prayerEngine.refreshLocation();
      setSettings((prev) => ({ ...prev, location: newLoc }));
      showToast(`تم تحديد موقعك: ${newLoc.cityNameAr}`);
    } catch (err: any) {
      console.warn('Geolocation failed:', err);
      setGeoError(err?.message || 'لم نتمكن من الوصول إلى موقعك. يمكنك اختيار مدينتك يدويًا.');
    } finally {
      setGeoLoading(false);
    }
  }, [showToast]);

  // City selection
  const selectCity = useCallback((newLoc: UserPrayerLocation) => {
    setGeoError(null);
    const updated = { ...getStoredUserSettings(), location: newLoc };
    saveStoredUserSettings(updated);
    setSettings(updated);
  }, []);

  // Update full settings
  const updateSettings = useCallback(
    (newSettings: Partial<PrayerUserSettings>) => {
      const updated = { ...settings, ...newSettings };
      saveStoredUserSettings(updated);
      setSettings(updated);
      showToast('تم حفظ الإعدادات');
    },
    [settings, showToast]
  );

  // Request Notifications
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await prayerNotificationService.requestPermission();
      setNotificationStatus(prayerNotificationService.getStatus());
      if (permission === 'granted') {
        await prayerNotificationService.sendTestNotification();
        showToast('تم تفعيل تنبيهات الصلاة بنجاح 🔔');
      } else {
        showToast('تم رفض إذن التنبيهات من المتصفح');
      }
    } catch (err: any) {
      showToast(err?.message || 'تعذر تفعيل التنبيهات');
    }
  }, [showToast]);

  // Clear all logs
  const clearHistory = useCallback(() => {
    clearAllPrayerLogs();
    setLogsVersion((v) => v + 1);
    showToast('تم مسح سجل الصلاة بالكامل');
  }, [showToast]);

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

  const selectSpecificDate = useCallback((date: string) => {
    setSelectedDateStr(date);
  }, []);

  return {
    settings,
    location,
    selectedDate,
    selectedDateStr,
    isToday,
    data,
    currentDay,
    prayerItems,
    nextPrayer,
    currentActivePrayer,
    daySummary,
    weekSummaries,
    statistics,
    loading,
    error,
    geoLoading,
    geoError,
    notificationStatus,
    formattedGregorianDate: formatArabicDate(selectedDate),
    formattedHijriDate: formatHijriDate(selectedDate),
    quickLog,
    removeLog,
    requestLocation,
    selectCity,
    updateSettings,
    requestNotificationPermission,
    clearHistory,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectSpecificDate,
    refresh: () => loadTimings(location, selectedDateStr),
  };
}
