import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Clock,
  CircleDashed,
  Award,
  Trash2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PrayerStatisticsData } from '../../types/prayer';

interface PrayerStatsTabProps {
  statistics: PrayerStatisticsData;
  onClearHistory: () => void;
}

export const PrayerStatsTab: React.FC<PrayerStatsTabProps> = ({
  statistics,
  onClearHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in text-right font-arabic-text" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              إحصائيات الصلاة (آخر 30 يوم)
            </h2>
            <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
              متابعة التزامك الشخصي بالصلاة بروحانية وهدوء
            </p>
          </div>
        </div>

        {/* Current Streak Badge */}
        {statistics.currentStreakDays > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 to-gold-500/20 border border-amber-400/40 text-amber-900 dark:text-amber-200 self-start sm:self-center shadow-2xs">
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current animate-pulse" />
            <div className="text-right">
              <span className="text-xs font-bold font-arabic-text">التتابع الحالي: </span>
              <span className="text-xs font-bold font-sans">{statistics.currentStreakDays} أيام متتالية</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Completion Rate */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-night-muted mb-2 font-bold">
            <span>نسبة الصلوات المسجلة</span>
            <Award className="w-4 h-4 text-gold-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-islamic-950 dark:text-night-text my-1">
            {statistics.completionRate}%
          </div>
          <div className="text-[11px] text-stone-400 dark:text-night-muted mt-1 font-sans">
            {statistics.totalLogged} صلاة من أصل {statistics.totalPossible}
          </div>
        </div>

        {/* Prayed on time */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-night-850 border border-emerald-200/80 dark:border-emerald-950/40 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 mb-2 font-bold">
            <span>صليت في وقتها</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-emerald-700 dark:text-emerald-300 my-1">
            {statistics.onTimeCount}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-night-muted mt-1">
            في أول الوقت أو خلاله
          </div>
        </div>

        {/* Prayed Late */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-night-850 border border-amber-200/80 dark:border-amber-950/40 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 mb-2 font-bold">
            <span>صليت متأخراً (قضاء)</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-amber-700 dark:text-amber-300 my-1">
            {statistics.lateCount}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-night-muted mt-1">
            تمت تأديتها بعد الوقت
          </div>
        </div>

        {/* Missed / Unlogged */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-night-muted mb-2 font-bold">
            <span>فائتة / غير مسجلة</span>
            <CircleDashed className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-stone-700 dark:text-night-text my-1">
            {statistics.missedCount + statistics.unloggedCount}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-night-muted mt-1 font-sans">
            فائتة: {statistics.missedCount} • لم تسجل: {statistics.unloggedCount}
          </div>
        </div>
      </div>

      {/* Spiritual Encouragement Note */}
      <div className="bg-sand-50/80 dark:bg-night-900/60 rounded-2xl sm:rounded-3xl p-5 border border-sand-200/80 dark:border-night-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-islamic-900 dark:text-night-text">
          <ShieldCheck className="w-4 h-4 text-islamic-800 dark:text-gold-400" />
          <span>ملاحظة حول المتابعة الشخصية</span>
        </div>
        <p className="text-xs text-stone-600 dark:text-night-muted leading-relaxed">
          هذه الإحصائيات هي أداة شخصية لمساعدتك على المحافظة على الصلاة في أوقاتها. إن الصلاة كانت على المؤمنين كتاباً موقوتاً، ولا تعتبر هذه الأرقام مقياساً إلا لغرض التذكير والتشجيع الشخصي.
        </p>
      </div>

      {/* Privacy & Clear Data */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border">
          <h3 className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-heading flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>خصوصية البيانات وإدارة السجل</span>
          </h3>
        </div>

        <p className="text-xs text-stone-500 dark:text-night-muted">
          بيانات تسجيل الصلاة مخزنة بشكل آمن ومحلي على جهازك فقط. يمكنك مسح جميع السجلات في أي وقت.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors cursor-pointer"
          >
            مسح سجل الصلوات بالكامل
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>هل أنت متأكد من مسح جميع سجلات الصلاة السابقة؟</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                نعم، مسح السجل
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 bg-white dark:bg-night-800 border border-sand-200 dark:border-night-border text-stone-700 dark:text-night-text rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
