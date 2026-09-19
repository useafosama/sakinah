import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Sparkles,
  ExternalLink,
  Smartphone,
  Clock,
  Loader2,
  HelpCircle,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { PageType } from '../../types';
import { usePrayerEngine } from '../../hooks/usePrayerEngine';
import { useQibla } from '../../hooks/useQibla';
import { QiblaCompass } from './QiblaCompass';
import { PrayerCityModal } from '../prayer/PrayerCityModal';

interface QiblaViewProps {
  onNavigate?: (page: PageType) => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ onNavigate }) => {
  const {
    location,
    selectCity,
    requestLocation,
    geoLoading,
    geoError,
  } = usePrayerEngine();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const {
    qiblaInfo,
    loading,
    error,
    orientation,
    requestPermission,
  } = useQibla({ location });

  return (
    <div className="space-y-4 sm:space-y-6 text-right font-arabic-text animate-fade-in" dir="rtl">
      
      {/* Page Header Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border shadow-2xs">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                  اتجاه القبلة
                </h1>
                <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-arabic-text">
                  تحديد اتجاه الكعبة المشرفة بدقة فلكية حسب موقعك الجغرافي
                </p>
              </div>
            </div>

            {/* Current Location Badge */}
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

              {qiblaInfo && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-50 dark:bg-gold-950/30 border border-gold-200/60 dark:border-gold-900/40 text-gold-900 dark:text-gold-300 font-semibold">
                  <span>المسافة لمكة:</span>
                  <span className="font-sans font-bold dir-ltr">{qiblaInfo.distanceKm.toLocaleString('ar-EG')} كم</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-400 dark:hover:bg-gold-500 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="تحديد الموقع عبر GPS للحصول على أعلى دقة"
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>موقعي الحالي</span>
            </button>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-night-800 hover:bg-sand-100 dark:hover:bg-night-700 text-stone-700 dark:text-night-text border border-sand-200/80 dark:border-night-border text-xs font-medium transition-colors cursor-pointer"
              title="اختيار مدينة أخرى"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span>تغيير المدينة</span>
            </button>
          </div>
        </div>

        {/* GPS Error Notification */}
        {geoError && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span>{geoError}</span>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="text-islamic-800 dark:text-gold-400 font-bold underline cursor-pointer"
            >
              اختر مدينة من القائمة
            </button>
          </div>
        )}

        {/* API Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error} — تم استخدام الحساب الفلكي الرياضي التلقائي.</span>
          </div>
        )}
      </div>

      {/* Main Interactive Compass Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-sand-300/70 dark:border-night-border shadow-card relative overflow-hidden flex flex-col items-center justify-center">
        
        {/* Top Info Banner */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-night-muted">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>بوصلة القبلة التفاعلية</span>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="inline-flex items-center gap-1 text-islamic-800 dark:text-gold-400 hover:underline font-semibold cursor-pointer text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showTips ? 'إخفاء الإرشادات' : 'إرشادات الاستخدام'}</span>
          </button>
        </div>

        {/* Dynamic Compass */}
        <QiblaCompass
          orientation={orientation}
          qiblaInfo={qiblaInfo}
          onRequestPermission={requestPermission}
          loading={loading}
        />
      </div>

      {/* Helpful Calibration & Usage Tips (Collapsible or Shown) */}
      {showTips && (
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-sand-50/80 dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-islamic-950 dark:text-night-text flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gold-600 dark:text-gold-400" />
            <span>إرشادات للحصول على أقصى دقة للبوصلة</span>
          </h3>

          <ul className="space-y-2 text-xs text-stone-600 dark:text-night-muted list-disc list-inside leading-relaxed pr-1">
            <li>
              <strong>ضع الهاتف أفقياً:</strong> أمسك الهاتف بشكل مستوٍ تماماً في راحة يدك أو ضعه على سطح مستوٍ.
            </li>
            <li>
              <strong>ابتعد عن المعادن والمغناطيس:</strong> الأغطية المحتوية على مغناطيس أو وجود أجهزة كهربائية قريبة قد يشوش على مستشعر البوصلة.
            </li>
            <li>
              <strong>معايرة المستشعر:</strong> في حال كان المؤشر غير مستقر، حرّك الهاتف في الهواء على شكل رقم ثمانية بالإنجليزية (<span className="font-sans font-bold">8</span>) لثوانٍ معدودة.
            </li>
            <li>
              <strong>دقة الموقع GPS:</strong> للحصول على أعلى دقة، فعّل خاصية تحديد الموقع الجغرافي (GPS) عند استخدام البوصلة في الأماكن المفتوحة.
            </li>
          </ul>
        </div>
      )}

      {/* Qibla Details & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Bearing */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-islamic-50 dark:bg-night-800 text-islamic-800 dark:text-gold-400 flex items-center justify-center shrink-0 border border-sand-200/60 dark:border-night-border">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[11px] text-stone-400 dark:text-night-muted">زاوية القبلة من الشمال</div>
            <div className="text-lg font-bold font-sans text-islamic-950 dark:text-night-text dir-ltr text-right mt-0.5">
              {qiblaInfo ? `${qiblaInfo.qiblaAngle.toFixed(1)}°` : '—'}
            </div>
            <div className="text-[11px] text-gold-600 dark:text-gold-400 font-medium">
              {qiblaInfo ? `${qiblaInfo.cardinalAr} (${qiblaInfo.cardinalEn})` : '—'}
            </div>
          </div>
        </div>

        {/* Card 2: Distance to Kaaba */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-gold-50 dark:bg-night-800 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 border border-gold-200/60 dark:border-night-border">
            <MapPin className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[11px] text-stone-400 dark:text-night-muted">المسافة إلى مكة المكرمة</div>
            <div className="text-lg font-bold font-sans text-islamic-950 dark:text-night-text dir-ltr text-right mt-0.5">
              {qiblaInfo ? `${qiblaInfo.distanceKm.toLocaleString('ar-EG')} كم` : '—'}
            </div>
            <div className="text-[11px] text-stone-400 dark:text-night-muted">
              خط مستقيم (Great Circle)
            </div>
          </div>
        </div>

        {/* Card 3: Location Coordinates */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted flex items-center justify-center shrink-0 border border-sand-200/60 dark:border-night-border">
            <Navigation className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[11px] text-stone-400 dark:text-night-muted">إحداثيات موقعك</div>
            <div className="text-xs font-bold font-sans text-islamic-950 dark:text-night-text dir-ltr text-right mt-0.5">
              {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
            </div>
            <div className="text-[11px] text-stone-500 dark:text-night-muted">
              {location.cityNameAr}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar to Prayer Companion */}
      {onNavigate && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-islamic-900 to-islamic-800 dark:from-night-900 dark:to-night-800 text-sand-50 border border-islamic-700/50 dark:border-night-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-400 shrink-0">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white font-arabic-heading">
                هل حان وقت الصلاة؟
              </h4>
              <p className="text-xs text-sand-200/80 mt-0.5">
                تابع مواقيت الصلاة وسجل أداء صلواتك اليومية مع العداد المباشر
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('prayer-times')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-islamic-950 text-xs font-bold transition-all shadow-xs cursor-pointer self-end sm:self-center"
          >
            <span>عرض مواقيت الصلاة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Attribution */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-night-850/60 border border-sand-200/70 dark:border-night-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-night-muted">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>يتم حساب اتجاه القبلة فلكياً استناداً إلى إحداثيات الكعبة المشرفة في مكة المكرمة</span>
        </div>

        <a
          href="https://theshia.org/ar/api/qibla/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-islamic-800 dark:text-gold-400 hover:underline font-semibold text-xs"
        >
          <span>بيانات القبلة بواسطة TheShia.org</span>
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
