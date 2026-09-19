import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  CircleDashed,
  Moon,
  Sunrise,
  Sun,
  Sunset,
  Info,
  Check
} from 'lucide-react';
import {
  TheShiaPrayerDay,
  PrayerItemView,
  NextPrayerCountdown,
  DayPrayerSummary,
  ObligatoryPrayerId,
  PrayerId
} from '../../types/prayer';
import { PrayerStatusModal } from './PrayerStatusModal';

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

interface PrayerTodayTabProps {
  currentDay: TheShiaPrayerDay;
  prayerItems: PrayerItemView[];
  nextPrayer: NextPrayerCountdown | null;
  daySummary: DayPrayerSummary;
  isToday: boolean;
  qiblaAngle?: number;
  onQuickLog: (prayer: ObligatoryPrayerId, scheduledTime24: string, status?: 'prayed_on_time' | 'prayed_late' | 'missed') => void;
  onRemoveLog: (prayer: ObligatoryPrayerId) => void;
}

export const PrayerTodayTab: React.FC<PrayerTodayTabProps> = ({
  prayerItems,
  nextPrayer,
  daySummary,
  isToday,
  qiblaAngle,
  onQuickLog,
  onRemoveLog,
}) => {
  const [editingPrayer, setEditingPrayer] = useState<{
    id: ObligatoryPrayerId;
    scheduledTime24: string;
  } | null>(null);

  const obligatoryPrayers = prayerItems.filter((p) =>
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p.id)
  ) as Array<PrayerItemView & { id: ObligatoryPrayerId }>;

  const sunriseItem = prayerItems.find((p) => p.id === 'sunrise');
  const imsakItem = prayerItems.find((p) => p.id === 'imsak');
  const midnightItem = prayerItems.find((p) => p.id === 'midnight');

  const activeEditingItem = editingPrayer
    ? prayerItems.find((p) => p.id === editingPrayer.id)
    : null;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in text-right font-arabic-text">
      {/* Highlighted Next Prayer Hero Card */}
      {nextPrayer && isToday && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-islamic-900 via-islamic-850 to-islamic-800 dark:from-night-900 dark:via-night-850 dark:to-night-800 p-5 sm:p-6 text-sand-50 border border-islamic-700/50 dark:border-night-border shadow-md">
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-islamic-600/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
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

      {/* Daily Progress / Tracker Banner */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sand-300/70 dark:border-night-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 flex items-center justify-center font-bold font-sans text-sm border border-islamic-200/50 dark:border-night-border">
            {daySummary.completedCount}/5
          </div>
          <div>
            <h3 className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              متابعة صلوات اليوم
            </h3>
            <p className="text-xs text-stone-500 dark:text-night-muted">
              {daySummary.completedCount === 5
                ? 'ما شاء الله، أتممت صلواتك الخمس اليوم'
                : `تم تسجيل ${daySummary.completedCount} من أصل 5 صلوات مفروضة`}
            </p>
          </div>
        </div>

        {/* 5 Dots Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {obligatoryPrayers.map((p) => {
            const isCompleted = p.log?.status === 'prayed_on_time' || p.log?.status === 'prayed_late';
            return (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : p.log?.status === 'missed'
                    ? 'bg-red-500 text-white'
                    : 'bg-sand-100 dark:bg-night-800 text-stone-400 dark:text-night-muted border border-sand-200 dark:border-night-border'
                }`}
                title={`صلاة ${p.nameAr}`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : p.nameAr.charAt(0)}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Obligatory Prayers List */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border">
          <h3 className="text-sm font-bold text-islamic-900 dark:text-night-text font-arabic-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400" />
            <span>الصلوات المفروضة والتسجيل السريع</span>
          </h3>
          <span className="text-xs text-stone-400 dark:text-night-muted">
            اضغط [✓ صليت] للتسجيل في ثانية
          </span>
        </div>

        <div className="space-y-2.5">
          {obligatoryPrayers.map((prayer) => {
            const IconComponent = PRAYER_ICONS[prayer.id] || Clock;
            const log = prayer.log;
            const isCompleted = log?.status === 'prayed_on_time' || log?.status === 'prayed_late';
            const isNext = prayer.isNext && isToday;

            return (
              <div
                key={prayer.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isNext
                    ? 'bg-gold-50/70 dark:bg-gold-950/20 border-gold-400 dark:border-gold-500/80 shadow-sm ring-2 ring-gold-400/20'
                    : 'bg-sand-50/50 dark:bg-night-900/40 hover:bg-sand-100/60 dark:hover:bg-night-800/60 border-sand-200/80 dark:border-night-border'
                }`}
              >
                {/* Left: Prayer identity & Time */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isNext
                        ? 'bg-gold-500 text-islamic-950 shadow-xs'
                        : 'bg-white dark:bg-night-800 text-stone-600 dark:text-night-muted border border-sand-200/60 dark:border-night-border'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-text">
                        صلاة {prayer.nameAr}
                      </span>
                      {isNext && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-gold-500 text-islamic-950 font-bold">
                          القادمة
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold font-sans text-stone-600 dark:text-night-muted mt-0.5 dir-ltr text-right">
                      {prayer.time12}
                    </div>
                  </div>
                </div>

                {/* Right: Status & One-Tap Log Action */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Status Indicator / Edit Trigger */}
                  {log ? (
                    <button
                      onClick={() => setEditingPrayer({ id: prayer.id, scheduledTime24: prayer.time24 })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        log.status === 'prayed_on_time'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/50'
                          : log.status === 'prayed_late'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/50'
                          : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300/60 dark:border-red-800/50'
                      }`}
                      title="اضغط لتعديل حالة الصلاة"
                    >
                      {log.status === 'prayed_on_time' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : log.status === 'prayed_late' ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      )}
                      <span>
                        {log.status === 'prayed_on_time'
                          ? 'في وقتها ✓'
                          : log.status === 'prayed_late'
                          ? 'متأخرة 🕐'
                          : 'فاتتني ❌'}
                      </span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-night-muted px-2 py-1">
                      <CircleDashed className="w-3.5 h-3.5" />
                      <span>لم تسجل</span>
                    </div>
                  )}

                  {/* One-Tap Quick Log Button (if unlogged) */}
                  {!log && (
                    <button
                      onClick={() => onQuickLog(prayer.id, prayer.time24)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title={`تسجيل أداء صلاة ${prayer.nameAr}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>صليت</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sunrise & Extra Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sunrise */}
        {sunriseItem && (
          <div className="p-4 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gold-100 dark:bg-night-800 text-gold-700 dark:text-gold-400 border border-gold-200/50 dark:border-night-border">
                <Sun className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-islamic-950 dark:text-night-text">شروق الشمس</div>
                <div className="text-[10px] text-stone-400 dark:text-night-muted">نهاية وقت الفجر</div>
              </div>
            </div>
            <span className="text-xs font-bold font-sans dir-ltr text-stone-800 dark:text-night-text">
              {sunriseItem.time12}
            </span>
          </div>
        )}

        {/* Midnight */}
        {midnightItem && (
          <div className="p-4 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-night-800 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-night-border">
                <Moon className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-islamic-950 dark:text-night-text">منتصف الليل الشرعي</div>
                <div className="text-[10px] text-stone-400 dark:text-night-muted">نهاية وقت العشاء</div>
              </div>
            </div>
            <span className="text-xs font-bold font-sans dir-ltr text-stone-800 dark:text-night-text">
              {midnightItem.time12}
            </span>
          </div>
        )}

        {/* Imsak / Qibla */}
        {imsakItem && (
          <div className="p-4 rounded-2xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-muted border border-sand-200/50 dark:border-night-border">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <div className="text-xs font-bold text-islamic-950 dark:text-night-text">الإمساك • القبلة</div>
                <div className="text-[10px] text-stone-400 dark:text-night-muted">
                  {qiblaAngle ? `القبلة: ${qiblaAngle.toFixed(0)}°` : 'قبل الفجر بـ 10 دقائق'}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold font-sans dir-ltr text-stone-800 dark:text-night-text">
              {imsakItem.time12}
            </span>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      <PrayerStatusModal
        isOpen={!!editingPrayer}
        onClose={() => setEditingPrayer(null)}
        prayerId={editingPrayer?.id || null}
        scheduledTime24={editingPrayer?.scheduledTime24 || ''}
        currentLog={activeEditingItem?.log}
        onSaveStatus={(status) => {
          if (editingPrayer) {
            onQuickLog(editingPrayer.id, editingPrayer.scheduledTime24, status);
          }
        }}
        onRemoveLog={() => {
          if (editingPrayer) {
            onRemoveLog(editingPrayer.id);
          }
        }}
      />
    </div>
  );
};
