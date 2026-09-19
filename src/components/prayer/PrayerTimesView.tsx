import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Navigation,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Sparkles,
  BarChart3,
  Sliders,
  CalendarDays
} from 'lucide-react';
import { usePrayerEngine } from '../../hooks/usePrayerEngine';
import { PrayerCityModal } from './PrayerCityModal';
import { PrayerTodayTab } from './PrayerTodayTab';
import { PrayerHistoryTab } from './PrayerHistoryTab';
import { PrayerStatsTab } from './PrayerStatsTab';
import { PrayerSettingsTab } from './PrayerSettingsTab';

type TabType = 'today' | 'history' | 'stats' | 'settings';

export const PrayerTimesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const {
    settings,
    location,
    selectedDateStr,
    isToday,
    data,
    currentDay,
    prayerItems,
    nextPrayer,
    daySummary,
    weekSummaries,
    statistics,
    loading,
    error,
    geoLoading,
    geoError,
    notificationStatus,
    formattedGregorianDate,
    formattedHijriDate,
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
    refresh,
  } = usePrayerEngine();

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

            {/* Location & Dates info */}
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
            {/* GPS Trigger */}
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

            {/* Change City */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-night-800 hover:bg-sand-100 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200/80 dark:border-night-border text-xs font-medium transition-colors cursor-pointer"
              title="اختيار مدينة أخرى"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span>تغيير المدينة</span>
            </button>

            {/* Refresh */}
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

        {/* Geolocation Warning if denied */}
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

      {/* Tabs Navigation Bar */}
      <div className="bg-white dark:bg-night-850 rounded-2xl p-1.5 border border-sand-300/70 dark:border-night-border shadow-card flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'today' as const, label: 'اليوم والصلوات', icon: Clock },
          { id: 'history' as const, label: 'السجل والتقويم', icon: CalendarDays },
          { id: 'stats' as const, label: 'الإحصائيات', icon: BarChart3 },
          { id: 'settings' as const, label: 'الإعدادات والتنبيهات', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-xs'
                  : 'text-stone-600 dark:text-night-muted hover:bg-sand-100/60 dark:hover:bg-night-800 hover:text-stone-900 dark:hover:text-night-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Day Navigation Bar (Shown when in Today tab) */}
      {activeTab === 'today' && (
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
      )}

      {/* Loading Skeleton */}
      {loading && !currentDay && (
        <div className="space-y-4">
          <div className="h-36 rounded-3xl bg-sand-200/60 dark:bg-night-800 animate-pulse border border-sand-300/40 dark:border-night-border" />
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-sand-200/50 dark:bg-night-800 animate-pulse border border-sand-300/40 dark:border-night-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !currentDay && (
        <div className="p-8 rounded-3xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-center space-y-3">
          <p className="text-sm font-bold text-red-900 dark:text-red-300">{error}</p>
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

      {/* Active Tab View */}
      {currentDay && (
        <>
          {activeTab === 'today' && (
            <PrayerTodayTab
              currentDay={currentDay}
              prayerItems={prayerItems}
              nextPrayer={nextPrayer}
              daySummary={daySummary}
              isToday={isToday}
              qiblaAngle={data?.meta?.qibla}
              onQuickLog={quickLog}
              onRemoveLog={removeLog}
            />
          )}

          {activeTab === 'history' && (
            <PrayerHistoryTab
              weekSummaries={weekSummaries}
              selectedDateStr={selectedDateStr}
              onSelectDate={selectSpecificDate}
              onQuickLog={quickLog}
              onRemoveLog={removeLog}
            />
          )}

          {activeTab === 'stats' && (
            <PrayerStatsTab
              statistics={statistics}
              onClearHistory={clearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <PrayerSettingsTab
              settings={settings}
              notificationStatus={notificationStatus}
              geoLoading={geoLoading}
              onOpenCityModal={() => setIsCityModalOpen(true)}
              onRequestLocation={requestLocation}
              onUpdateSettings={updateSettings}
              onRequestNotificationPermission={requestNotificationPermission}
            />
          )}
        </>
      )}

      {/* Footer Attribution */}
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

      {/* City Modal */}
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
