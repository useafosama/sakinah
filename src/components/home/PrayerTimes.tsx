import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  MapPin,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';
import {
  PrayerLocation,
  PrayerTimesData,
  NextPrayerInfo,
  PRAYER_ORDER,
  PRAYER_NAMES_AR,
  getSavedLocation,
  saveLocation,
  fetchPrayerTimes,
  calculateNextPrayer,
  formatTime12,
  getDateKey
} from '../../services/prayerTimesService';
import { PrayerLocationModal } from './PrayerLocationModal';

const PRAYER_ICONS: Record<string, React.ElementType> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: Sun,
  Asr: Sunset,
  Maghrib: Sunset,
  Isha: Moon,
};

export const PrayerTimes: React.FC = () => {
  const [location, setLocation] = useState<PrayerLocation>(getSavedLocation);
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  // Load prayer times
  const loadTimings = useCallback(async (loc: PrayerLocation) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPrayerTimes(loc, new Date());
      setData(result);
    } catch (err: any) {
      console.error('Failed to load prayer times:', err);
      setError(err?.message || 'تعذر جلب مواقيت الصلاة');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and on location change
  useEffect(() => {
    loadTimings(location);
  }, [location, loadTimings]);

  // Live countdown timer (updates every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);

      // If midnight passed (day changed), reload timings
      if (data && getDateKey(current) !== getDateKey(new Date(data.fetchedAt))) {
        loadTimings(location);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data, location, loadTimings]);

  const handleSelectLocation = (newLoc: PrayerLocation) => {
    setLocation(newLoc);
    saveLocation(newLoc);
  };

  // Next prayer calculation
  const nextPrayer: NextPrayerInfo | null = useMemo(() => {
    if (!data || !data.timings) return null;
    return calculateNextPrayer(data.timings, now);
  }, [data, now]);

  // Countdown formatted string HH:MM:SS
  const countdownString = useMemo(() => {
    if (!nextPrayer) return '00:00:00';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(nextPrayer.hours)}:${pad(nextPrayer.minutes)}:${pad(nextPrayer.seconds)}`;
  }, [nextPrayer]);

  // Humanized remaining time in Arabic
  const humanRemaining = useMemo(() => {
    if (!nextPrayer) return '';
    const { hours, minutes } = nextPrayer;
    if (hours === 0 && minutes === 0) return 'خلال ثوانٍ معدودة';
    if (hours === 0) return `متبقي ${minutes} دقيقة`;
    if (hours === 1) return minutes > 0 ? `متبقي ساعة و ${minutes} دقيقة` : 'متبقي ساعة واحدة';
    if (hours === 2) return minutes > 0 ? `متبقي ساعتان و ${minutes} دقيقة` : 'متبقي ساعتان';
    return `متبقي ${hours} ساعة و ${minutes} دقيقة`;
  }, [nextPrayer]);

  return (
    <section className="w-full mx-auto my-4 sm:my-6" aria-label="مواقيت الصلاة">
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-sand-100 dark:border-night-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
                مواقيت الصلاة
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-night-muted font-arabic-text">
              <Calendar className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 shrink-0" />
              <span>{data?.dateGregorian || 'اليوم'}</span>
              {data?.dateHijri && (
                <>
                  <span className="text-sand-300 dark:text-night-border">•</span>
                  <span className="text-gold-700 dark:text-gold-400 font-medium">{data.dateHijri}</span>
                </>
              )}
            </div>
          </div>

          {/* Location Badge & Change Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-gold-50 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200 dark:border-night-border text-xs font-semibold transition-colors cursor-pointer group"
              title="تغيير المدينة"
            >
              <MapPin className="w-3.5 h-3.5 text-islamic-700 dark:text-gold-400 group-hover:text-gold-600 transition-colors" />
              <span className="font-arabic-text">
                {location.cityNameArabic}، {location.countryNameArabic}
              </span>
              <span className="text-[10px] text-islamic-700 dark:text-gold-400 font-normal mr-0.5 underline">
                تغيير
              </span>
            </button>

            <button
              onClick={() => loadTimings(location)}
              disabled={loading}
              className="p-1.5 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-500 dark:text-night-muted transition-colors cursor-pointer disabled:opacity-50"
              title="تحديث المواقيت"
              aria-label="تحديث المواقيت"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-7 h-7 animate-spin text-gold-500 mb-2.5" />
            <p className="text-xs text-stone-500 dark:text-night-muted font-arabic-text">
              جاري جلب مواقيت الصلاة لمدينة {location.cityNameArabic}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !data && (
          <div className="py-8 px-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-red-800 dark:text-red-300 font-arabic-text mb-1">
              {error}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-night-muted font-arabic-text mb-3">
              يرجى التحقق من الاتصال بالإنترنت أو اختيار مدينة أخرى
            </p>
            <button
              onClick={() => loadTimings(location)}
              className="px-4 py-1.5 bg-islamic-800 dark:bg-gold-500 hover:bg-islamic-900 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold font-arabic-text transition-colors cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="space-y-4">
            {/* Next Prayer Spotlight Card */}
            {nextPrayer && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-islamic-900 via-islamic-850 to-islamic-800 dark:from-night-900 dark:via-night-850 dark:to-night-800 p-4 sm:p-5 text-sand-50 border border-islamic-700/50 dark:border-night-border shadow-md">
                {/* Spiritual geometric background decor */}
                <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-gold-400/10 blur-2xl pointer-events-none" />
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-islamic-600/10 blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Next Prayer Label & Time */}
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gold-300 font-medium font-arabic-text">
                          {nextPrayer.id === 'Sunrise' ? 'الموعد القادم' : 'الصلاة القادمة'}
                        </span>
                        {nextPrayer.isTomorrow && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-sand-200">
                            غداً
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-arabic-heading text-white mt-0.5">
                        {nextPrayer.id === 'Sunrise' ? 'شروق الشمس' : `صلاة ${nextPrayer.nameArabic}`}
                      </h3>
                      <p className="text-xs text-sand-200/90 font-sans mt-0.5">
                        يحين موعدها في تمام {nextPrayer.time12}
                      </p>
                    </div>
                  </div>

                  {/* Right: Live Countdown Display */}
                  <div className="flex flex-col sm:items-end bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                    <div className="text-[11px] text-gold-300/90 font-arabic-text mb-1">
                      {humanRemaining}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 dark:bg-night-950/60 border border-white/15 backdrop-blur-xs">
                      <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-gold-300">
                        {countdownString}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6 Prayer Times Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {PRAYER_ORDER.map((prayerKey) => {
                const nameArabic = PRAYER_NAMES_AR[prayerKey];
                const rawTime = data.timings[prayerKey];
                const time12 = formatTime12(rawTime);
                const IconComponent = PRAYER_ICONS[prayerKey] || Clock;
                const isNext = nextPrayer?.id === prayerKey;

                return (
                  <div
                    key={prayerKey}
                    className={`relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-center flex flex-col items-center justify-between ${
                      isNext
                        ? 'bg-gold-50/80 dark:bg-gold-950/20 border-gold-400 dark:border-gold-500 shadow-sm ring-2 ring-gold-400/20 scale-[1.02]'
                        : 'bg-sand-50/50 dark:bg-night-900/40 hover:bg-sand-100/60 dark:hover:bg-night-800/60 border-sand-200/80 dark:border-night-border'
                    }`}
                  >
                    {/* Next Indicator Badge */}
                    {isNext && (
                      <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-full bg-gold-500 text-islamic-950 text-[10px] font-bold font-arabic-text shadow-2xs">
                        القادمة
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                        isNext
                          ? 'bg-gold-500 text-islamic-950'
                          : 'bg-white dark:bg-night-800 text-stone-600 dark:text-night-muted border border-sand-200/60 dark:border-night-border'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Prayer Name */}
                    <span
                      className={`text-xs sm:text-sm font-bold font-arabic-text mb-0.5 ${
                        isNext
                          ? 'text-gold-900 dark:text-gold-300'
                          : 'text-stone-800 dark:text-night-text'
                      }`}
                    >
                      {nameArabic}
                    </span>

                    {/* Prayer Time */}
                    <span
                      className={`text-xs sm:text-sm font-semibold font-sans dir-ltr ${
                        isNext
                          ? 'text-gold-800 dark:text-gold-400'
                          : 'text-stone-600 dark:text-night-muted'
                      }`}
                    >
                      {time12}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-stone-400 dark:text-night-muted text-[11px] font-arabic-text">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-gold-500 shrink-0" />
            <span>
              مصدر المواقيت: AlAdhan • طريقة الحساب:{' '}
              {location.country.toLowerCase().includes('egypt')
                ? 'الهيئة المصرية العامة للمساحة'
                : 'أم القرى / الحساب الفلكي المعتمد'}
            </span>
          </div>

          <span className="text-[10px] text-stone-400 dark:text-night-muted font-sans">
            يتم تحديث التوقيت ومراعاة فروق التوقيت آلياً
          </span>
        </div>
      </div>

      {/* Location Selector Modal */}
      <PrayerLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
      />
    </section>
  );
};
