import React, { useState } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Navigation,
  Compass,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Info
} from 'lucide-react';
import { useTheShiaPrayerTimes } from '../../hooks/useTheShiaPrayerTimes';
import { PrayerCityModal } from './PrayerCityModal';
import { PrayerId } from '../../types/prayer';

const PRAYER_ICONS: Record<PrayerId, React.ElementType> = {
  imsak: Moon,
  fajr: Sunrise,
  sunrise: Sun,
  dhuhr: Sun,
  asr: Sunset,
  sunset: Sunset,
  maghrib: Sunset,
  isha: Moon,
  midnight: Moon,
};

export const PrayerTimesView: React.FC = () => {
  const {
    location,
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
    requestLocation,
    selectCity,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    refresh,
  } = useTheShiaPrayerTimes();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Group prayer items into primary and extra
  const primaryPrayers = prayerItems.filter((p) =>
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p.id)
  );

  const extraPrayers = prayerItems.filter((p) =>
    ['imsak', 'midnight', 'sunset'].includes(p.id)
  );

  return (
    <div className="space-y-4 sm:space-y-6 text-right font-arabic-text animate-fade-in" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border shadow-2xs">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                  مواقيت الصلاة
                </h1>
                <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-arabic-text">
                  مواقيت الصلاة اليوم حسب موقعك
                </p>
              </div>
            </div>

            {/* Location & Dates details */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-stone-600 dark:text-night-muted">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sand-100/80 dark:bg-night-800 border border-sand-200/60 dark:border-night-border font-medium">
                <MapPin className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
                <span className="font-bold text-islamic-900 dark:text-night-text">
                  {location.cityNameAr}
                </span>
                {location.countryNameAr && (
                  <span className="text-stone-400 dark:text-night-muted">({location.countryNameAr})</span>
                )}
                {location.isGeolocation && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-islamic-800 text-sand-50 dark:bg-gold-400 dark:text-islamic-950 font-bold mr-1">
                    GPS
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sand-100/60 dark:bg-night-800 border border-sand-200/60 dark:border-night-border">
                <Calendar className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                <span>{formattedGregorianDate}</span>
                {formattedHijriDate && (
                  <>
                    <span className="text-sand-300 dark:text-night-border">•</span>
                    <span className="text-gold-700 dark:text-gold-400 font-medium">{formattedHijriDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* GPS Request Button */}
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-400 dark:hover:bg-gold-500 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="استخدام موقعي عبر GPS"
              aria-label="استخدام موقعي"
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>استخدام موقعي</span>
            </button>

            {/* Change City Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-night-800 hover:bg-sand-100 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200/80 dark:border-night-border text-xs font-medium transition-colors cursor-pointer"
              title="اختيار مدينة أخرى"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span>تغيير المدينة</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-xl bg-white dark:bg-night-800 hover:bg-sand-100 dark:hover:bg-night-700 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border transition-colors cursor-pointer disabled:opacity-50"
              title="تحديث المواقيت"
              aria-label="تحديث المواقيت"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Geolocation Warning / Error Banner if denied */}
        {geoError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{geoError}</p>
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="mt-1 text-islamic-800 dark:text-gold-400 underline font-bold cursor-pointer"
              >
                اضغط هنا لاختيار مدينتك من القائمة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Day Navigation Bar */}
      <div className="bg-white dark:bg-night-850 rounded-2xl p-3 sm:p-4 border border-sand-300/70 dark:border-night-border shadow-card flex items-center justify-between gap-2">
        <button
          onClick={goToPreviousDay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 hover:bg-sand-100 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-xs font-semibold text-stone-700 dark:text-night-text transition-colors cursor-pointer"
          aria-label="اليوم السابق"
        >
          <ChevronRight className="w-4 h-4" />
          <span>اليوم السابق</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-islamic-950 dark:text-night-text">
            {formattedGregorianDate}
          </span>
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-2.5 py-1 rounded-lg bg-gold-100 dark:bg-night-800 text-gold-800 dark:text-gold-400 border border-gold-200/60 dark:border-night-border text-[11px] font-bold transition-colors cursor-pointer hover:bg-gold-200"
            >
              العودة لليوم
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 hover:bg-sand-100 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-xs font-semibold text-stone-700 dark:text-night-text transition-colors cursor-pointer"
          aria-label="اليوم التالي"
        >
          <span>اليوم التالي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && !currentDay && (
        <div className="space-y-4">
          <div className="h-36 rounded-3xl bg-sand-200/60 dark:bg-night-800 animate-pulse border border-sand-300/40 dark:border-night-border" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-sand-200/50 dark:bg-night-800 animate-pulse border border-sand-300/40 dark:border-night-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !currentDay && (
        <div className="p-8 rounded-3xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-300">
            {error}
          </h3>
          <p className="text-xs text-stone-500 dark:text-night-muted max-w-sm mx-auto">
            يرجى التحقق من اتصالك بالإنترنت أو اختيار مدينة أخرى من القائمة
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={refresh}
              className="px-4 py-2 bg-islamic-800 dark:bg-gold-500 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2 bg-white dark:bg-night-800 border border-sand-200 dark:border-night-border text-stone-700 dark:text-night-text rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              اختيار مدينة يدوياً
            </button>
          </div>
        </div>
      )}

      {/* Main Content when Day is Loaded */}
      {currentDay && (
        <>
          {/* Highlighted Next Prayer Hero Card (Active when viewing Today) */}
          {nextPrayer && isToday && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-islamic-900 via-islamic-850 to-islamic-800 dark:from-night-900 dark:via-night-850 dark:to-night-800 p-5 sm:p-6 text-sand-50 border border-islamic-700/50 dark:border-night-border shadow-md">
              {/* Background ambient lighting */}
              <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
              <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-islamic-600/15 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Left side: Next Prayer Identity */}
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles className="w-7 h-7" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gold-300 font-medium font-arabic-text">
                        {nextPrayer.prayer.id === 'sunrise' ? 'الموعد القادم' : 'الصلاة القادمة'}
                      </span>
                      {nextPrayer.isTomorrow && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-sand-200 font-sans">
                          غداً
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-arabic-heading text-white mt-0.5">
                      {nextPrayer.prayer.id === 'sunrise' ? 'شروق الشمس' : `صلاة ${nextPrayer.prayer.nameAr}`}
                    </h2>
                    <p className="text-xs sm:text-sm text-sand-200/90 font-sans mt-0.5">
                      يحين موعدها في تمام <strong className="text-gold-300 font-bold">{nextPrayer.prayer.time12}</strong>
                    </p>
                  </div>
                </div>

                {/* Right side: Realtime Countdown Box */}
                <div className="flex flex-col sm:items-end bg-black/25 sm:bg-transparent p-3.5 sm:p-0 rounded-2xl sm:rounded-none">
                  <span className="text-xs text-gold-300/90 font-arabic-text mb-1">
                    {nextPrayer.humanRemaining}
                  </span>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 dark:bg-night-950/70 border border-white/15 backdrop-blur-xs shadow-inner">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-gold-300">
                      {nextPrayer.formattedCountdown}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6 Primary Prayer Cards Grid */}
          <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-sand-100 dark:border-night-border">
              <h3 className="text-sm font-bold text-islamic-900 dark:text-night-text font-arabic-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                <span>مواقيت الصلوات المفروضة</span>
              </h3>
              <span className="text-xs text-stone-400 dark:text-night-muted font-sans">
                حساب الجعفري (Jafari Method)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {primaryPrayers.map((prayer) => {
                const IconComponent = PRAYER_ICONS[prayer.id] || Clock;
                const isNext = prayer.isNext && isToday;

                return (
                  <div
                    key={prayer.id}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-center flex flex-col items-center justify-between ${
                      isNext
                        ? 'bg-gold-50/90 dark:bg-gold-950/25 border-gold-400 dark:border-gold-500 shadow-sm ring-2 ring-gold-400/20 scale-[1.02]'
                        : prayer.isPassed && isToday
                        ? 'bg-sand-50/30 dark:bg-night-900/30 border-sand-200/60 dark:border-night-border opacity-75'
                        : 'bg-sand-50/60 dark:bg-night-900/40 hover:bg-sand-100/60 dark:hover:bg-night-800/60 border-sand-200/80 dark:border-night-border'
                    }`}
                  >
                    {/* Next Badge */}
                    {isNext && (
                      <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gold-500 text-islamic-950 text-[10px] font-bold font-arabic-text shadow-2xs">
                        القادمة
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                        isNext
                          ? 'bg-gold-500 text-islamic-950 shadow-xs'
                          : 'bg-white dark:bg-night-800 text-stone-600 dark:text-night-muted border border-sand-200/60 dark:border-night-border'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Prayer Name */}
                    <span
                      className={`text-xs sm:text-sm font-bold font-arabic-text mb-1 ${
                        isNext
                          ? 'text-gold-950 dark:text-gold-300'
                          : 'text-stone-800 dark:text-night-text'
                      }`}
                    >
                      {prayer.nameAr}
                    </span>

                    {/* Prayer Time in 12h Arabic */}
                    <span
                      className={`text-xs sm:text-sm font-bold font-sans dir-ltr ${
                        isNext
                          ? 'text-gold-900 dark:text-gold-400'
                          : 'text-stone-600 dark:text-night-muted'
                      }`}
                    >
                      {prayer.time12}
                    </span>

                    {/* Passed / Upcoming Subtitle */}
                    {isToday && (
                      <span className="text-[10px] text-stone-400 dark:text-night-muted mt-1 font-arabic-text">
                        {isNext ? 'حان وقت التجهيز' : prayer.isPassed ? 'مضت' : 'قادمة'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplementary Details (Midnight, Imsak, Qibla) */}
          <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card">
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-sand-100 dark:border-night-border text-xs font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
              <Info className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              <span>مواقيت وتفاصيل إضافية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Midnight */}
              <div className="p-3.5 rounded-2xl bg-sand-50/70 dark:bg-night-900/50 border border-sand-200/80 dark:border-night-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white dark:bg-night-800 text-stone-700 dark:text-night-muted border border-sand-200/60 dark:border-night-border">
                    <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-islamic-950 dark:text-night-text">منتصف الليل الشرعي</div>
                    <div className="text-[10px] text-stone-400 dark:text-night-muted">نهاية وقت العشاء</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-sans dir-ltr text-stone-800 dark:text-night-text">
                  {extraPrayers.find((p) => p.id === 'midnight')?.time12 || '--:--'}
                </span>
              </div>

              {/* Imsak */}
              <div className="p-3.5 rounded-2xl bg-sand-50/70 dark:bg-night-900/50 border border-sand-200/80 dark:border-night-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white dark:bg-night-800 text-stone-700 dark:text-night-muted border border-sand-200/60 dark:border-night-border">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-islamic-950 dark:text-night-text">الإمساك</div>
                    <div className="text-[10px] text-stone-400 dark:text-night-muted">قبل الفجر بـ 10 دقائق</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-sans dir-ltr text-stone-800 dark:text-night-text">
                  {extraPrayers.find((p) => p.id === 'imsak')?.time12 || '--:--'}
                </span>
              </div>

              {/* Qibla Angle */}
              <div className="p-3.5 rounded-2xl bg-sand-50/70 dark:bg-night-900/50 border border-sand-200/80 dark:border-night-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white dark:bg-night-800 text-stone-700 dark:text-night-muted border border-sand-200/60 dark:border-night-border">
                    <Compass className="w-4 h-4 text-islamic-700 dark:text-gold-400" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-islamic-950 dark:text-night-text">اتجاه القبلة</div>
                    <div className="text-[10px] text-stone-400 dark:text-night-muted">من الشمال الحقيقي</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-sans dir-ltr text-islamic-900 dark:text-gold-400">
                  {data?.meta?.qibla ? `${data.meta.qibla.toFixed(1)}°` : '--°'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attribution & Source Footer */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-night-850/60 border border-sand-200/70 dark:border-night-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-night-muted">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>طريقة الحساب: الجعفري (Jafari) • يتم الحساب فلكياً بناءً على إحداثيات موقعك الدقيقة</span>
        </div>

        <a
          href="https://theshia.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-islamic-800 dark:text-gold-400 hover:underline font-semibold text-xs"
        >
          <span>مواقيت الصلاة بواسطة TheShia</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* City Selection Modal */}
      <PrayerCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentLocation={location}
        onSelectCity={selectCity}
        onRequestGeolocation={requestLocation}
        geoLoading={geoLoading}
      />
    </div>
  );
};
