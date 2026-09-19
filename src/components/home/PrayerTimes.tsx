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
  Navigation,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Compass,
  Flame,
  Database
} from 'lucide-react';
import { PageType } from '../../types';
import { usePrayerEngine } from '../../hooks/usePrayerEngine';
import { PrayerCityModal } from '../prayer/PrayerCityModal';
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

interface PrayerTimesProps {
  onNavigate?: (page: PageType) => void;
}

export const PrayerTimes: React.FC<PrayerTimesProps> = ({ onNavigate }) => {
  const {
    location,
    currentDay,
    prayerItems,
    nextPrayer,
    streakData,
    isOnline,
    cachedMeta,
    isFromCache,
    loading,
    error,
    geoLoading,
    formattedGregorianDate,
    formattedHijriDate,
    requestLocation,
    selectCity,
    refresh,
  } = usePrayerEngine();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const primaryPrayers = prayerItems.filter((p) =>
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p.id)
  );

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
              {streakData && streakData.currentStreak > 0 && (
                <button
                  onClick={() => onNavigate && onNavigate('prayer-times')}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-[11px] font-bold cursor-pointer hover:bg-amber-100 transition-colors"
                  title="سلسلة الالتزام في الصلاة"
                >
                  <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-current" />
                  <span className="font-sans">{streakData.currentStreak} {streakData.currentStreak === 1 ? 'يوم' : 'أيام'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-night-muted font-arabic-text">
              <Calendar className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 shrink-0" />
              <span>{formattedGregorianDate}</span>
              {formattedHijriDate && (
                <>
                  <span className="text-sand-300 dark:text-night-border">•</span>
                  <span className="text-gold-700 dark:text-gold-400 font-medium">{formattedHijriDate}</span>
                </>
              )}
            </div>
          </div>

          {/* Location Badge & Change Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* GPS Quick Trigger */}
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className="p-1.5 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-gold-50 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200 dark:border-night-border transition-colors cursor-pointer disabled:opacity-50"
              title="تحديد موقعي التلقائي عبر GPS"
              aria-label="تحديد موقعي"
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
              )}
            </button>

            {/* City Selector Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-gold-50 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200 dark:border-night-border text-xs font-semibold transition-colors cursor-pointer group"
              title="تغيير المدينة"
            >
              <MapPin className="w-3.5 h-3.5 text-islamic-700 dark:text-gold-400 group-hover:text-gold-600 transition-colors" />
              <span className="font-arabic-text">
                {location.cityNameAr}
              </span>
              <span className="text-[10px] text-islamic-700 dark:text-gold-400 font-normal mr-0.5 underline">
                تغيير
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-1.5 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-500 dark:text-night-muted transition-colors cursor-pointer disabled:opacity-50"
              title="تحديث المواقيت"
              aria-label="تحديث المواقيت"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !currentDay && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-7 h-7 animate-spin text-gold-500 mb-2.5" />
            <p className="text-xs text-stone-500 dark:text-night-muted font-arabic-text">
              جاري جلب مواقيت الصلاة لمدينة {location.cityNameAr}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !currentDay && (
          <div className="py-8 px-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-red-800 dark:text-red-300 font-arabic-text mb-1">
              {error}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-night-muted font-arabic-text mb-3">
              يرجى التحقق من الاتصال بالإنترنت أو اختيار مدينة أخرى
            </p>
            <button
              onClick={refresh}
              className="px-4 py-1.5 bg-islamic-800 dark:bg-gold-500 hover:bg-islamic-900 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold font-arabic-text transition-colors cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Offline Cache Notice */}
        {(!isOnline || isFromCache) && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-sand-100/80 dark:bg-night-800 text-[11px] text-stone-600 dark:text-night-muted flex items-center justify-between border border-sand-200/80 dark:border-night-border">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-gold-600 dark:text-gold-400" />
              <span>بيانات محفوظة محلياً • {cachedMeta?.humanAge || 'جاهزة دون اتصال'}</span>
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-sans">
              Offline
            </span>
          </div>
        )}

        {/* Main Content */}
        {currentDay && (
          <div className="space-y-4">
            {/* Next Prayer Highlight Card */}
            {nextPrayer && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-islamic-900 via-islamic-850 to-islamic-800 dark:from-night-900 dark:via-night-850 dark:to-night-800 p-4 sm:p-5 text-sand-50 border border-islamic-700/50 dark:border-night-border shadow-md">
                <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-gold-400/10 blur-2xl pointer-events-none" />
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-islamic-600/10 blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Next Prayer Info */}
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gold-300 font-medium font-arabic-text">
                          {nextPrayer.prayer.id === 'sunrise' ? 'الموعد القادم' : 'الصلاة القادمة'}
                        </span>
                        {nextPrayer.isTomorrow && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-sand-200">
                            غداً
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-arabic-heading text-white mt-0.5">
                        {nextPrayer.prayer.id === 'sunrise' ? 'شروق الشمس' : `صلاة ${nextPrayer.prayer.nameAr}`}
                      </h3>
                      <p className="text-xs text-sand-200/90 font-sans mt-0.5">
                        يحين موعدها في تمام {nextPrayer.prayer.time12}
                      </p>
                    </div>
                  </div>

                  {/* Right: Live Realtime Countdown */}
                  <div className="flex flex-col sm:items-end bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                    <div className="text-[11px] text-gold-300/90 font-arabic-text mb-1">
                      {nextPrayer.humanRemaining}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 dark:bg-night-950/60 border border-white/15 backdrop-blur-xs">
                      <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-gold-300">
                        {nextPrayer.formattedCountdown}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6 Primary Prayer Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {primaryPrayers.map((prayer) => {
                const IconComponent = PRAYER_ICONS[prayer.id] || Clock;
                const isNext = prayer.isNext;

                return (
                  <div
                    key={prayer.id}
                    className={`relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-center flex flex-col items-center justify-between ${
                      isNext
                        ? 'bg-gold-50/80 dark:bg-gold-950/20 border-gold-400 dark:border-gold-500 shadow-sm ring-2 ring-gold-400/20 scale-[1.02]'
                        : prayer.isPassed
                        ? 'bg-sand-50/30 dark:bg-night-900/30 border-sand-200/60 dark:border-night-border opacity-80'
                        : 'bg-sand-50/50 dark:bg-night-900/40 hover:bg-sand-100/60 dark:hover:bg-night-800/60 border-sand-200/80 dark:border-night-border'
                    }`}
                  >
                    {isNext && (
                      <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-full bg-gold-500 text-islamic-950 text-[10px] font-bold font-arabic-text shadow-2xs">
                        القادمة
                      </span>
                    )}

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                        isNext
                          ? 'bg-gold-500 text-islamic-950'
                          : 'bg-white dark:bg-night-800 text-stone-600 dark:text-night-muted border border-sand-200/60 dark:border-night-border'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-bold font-arabic-text mb-0.5 ${
                        isNext
                          ? 'text-gold-900 dark:text-gold-300'
                          : 'text-stone-800 dark:text-night-text'
                      }`}
                    >
                      {prayer.nameAr}
                    </span>

                    <span
                      className={`text-xs sm:text-sm font-semibold font-sans dir-ltr ${
                        isNext
                          ? 'text-gold-800 dark:text-gold-400'
                          : 'text-stone-600 dark:text-night-muted'
                      }`}
                    >
                      {prayer.time12}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Note & View Full Page Link */}
        <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-stone-400 dark:text-night-muted text-[11px] font-arabic-text">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
            <a
              href="https://theshia.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-stone-500 dark:text-night-muted inline-flex items-center gap-1"
            >
              <span>مواقيت الصلاة بواسطة TheShia</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {onNavigate && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('qibla')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-night-800 dark:hover:bg-night-700 text-islamic-900 dark:text-gold-400 font-bold text-xs transition-colors cursor-pointer border border-sand-200 dark:border-night-border"
              >
                <Compass className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                <span>بوصلة القبلة</span>
              </button>

              <button
                onClick={() => onNavigate('prayer-times')}
                className="inline-flex items-center gap-1 text-islamic-800 dark:text-gold-400 font-bold hover:underline cursor-pointer"
              >
                <span>صفحة المواقيت والتنقل</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <PrayerCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentLocation={location}
        onSelectCity={selectCity}
        onRequestGeolocation={requestLocation}
        geoLoading={geoLoading}
      />
    </section>
  );
};
