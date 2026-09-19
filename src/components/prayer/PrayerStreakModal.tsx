import React from 'react';
import {
  X,
  Flame,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { PrayerStreakData } from '../../types/prayer';
import { getAllStoredLogs } from '../../services/prayerStorage';
import { isDayComplete, getCompletedPrayersCount } from '../../services/streakService';
import { formatDateISO } from '../../services/theShiaPrayerService';

interface PrayerStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: PrayerStreakData;
}

export const PrayerStreakModal: React.FC<PrayerStreakModalProps> = ({
  isOpen,
  onClose,
  streakData,
}) => {
  if (!isOpen) return null;

  const allLogs = getAllStoredLogs();
  const today = new Date();
  const todayStr = formatDateISO(today);

  // Generate last 30 days grid for the mini calendar
  const past30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const dStr = formatDateISO(d);
    const dayLogs = allLogs[dStr];
    const isToday = dStr === todayStr;
    const completed = isDayComplete(dayLogs);
    const count = getCompletedPrayersCount(dayLogs);

    return {
      date: dStr,
      dayNumber: d.getDate(),
      isToday,
      completed,
      count,
    };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-night-850 border border-sand-300/80 dark:border-night-border shadow-2xl p-6 sm:p-7 overflow-hidden text-right font-arabic-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-600 dark:text-night-muted transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
            <Flame className="w-6 h-6 fill-current" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              استمراريتك في الصلاة
            </h2>
            <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
              مؤشر هادئ لمتابعة دوام محافظتك على الصلوات الخمس
            </p>
          </div>
        </div>

        {/* Top Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {/* Current Streak */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 text-center">
            <span className="text-[11px] text-stone-500 dark:text-night-muted block">التتابع الحالي</span>
            <span className="text-xl sm:text-2xl font-bold font-sans text-amber-700 dark:text-amber-300 block my-0.5">
              {streakData.currentStreak}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              {streakData.currentStreak === 1 ? 'يوم مكتمل' : 'أيام متتالية'}
            </span>
          </div>

          {/* Longest Streak */}
          <div className="p-3.5 rounded-2xl bg-sand-50/80 dark:bg-night-800 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-[11px] text-stone-500 dark:text-night-muted block">أطول تتابع</span>
            <span className="text-xl sm:text-2xl font-bold font-sans text-islamic-900 dark:text-gold-400 block my-0.5">
              {streakData.longestStreak}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-night-muted font-medium">أيام</span>
          </div>

          {/* This Week */}
          <div className="p-3.5 rounded-2xl bg-sand-50/80 dark:bg-night-800 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-[11px] text-stone-500 dark:text-night-muted block">هذا الأسبوع</span>
            <span className="text-xl sm:text-2xl font-bold font-sans text-islamic-900 dark:text-night-text block my-0.5">
              {streakData.weeklyCompletedCount}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-night-muted font-medium">من أصل 7 أيام</span>
          </div>

          {/* This Month */}
          <div className="p-3.5 rounded-2xl bg-sand-50/80 dark:bg-night-800 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-[11px] text-stone-500 dark:text-night-muted block">هذا الشهر</span>
            <span className="text-xl sm:text-2xl font-bold font-sans text-islamic-900 dark:text-night-text block my-0.5">
              {streakData.monthlyCompletedCount}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-night-muted font-medium">
              من أصل {streakData.monthlyTotalDays} يوماً
            </span>
          </div>
        </div>

        {/* 30-Day Mini Completion Calendar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sand-50/60 dark:bg-night-900/40 border border-sand-200/80 dark:border-night-border mb-5">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-islamic-900 dark:text-night-text">
              <Calendar className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span>سجل الأيام المكتملة (آخر 30 يوم)</span>
            </div>
            <span className="text-[11px] text-stone-400 dark:text-night-muted">
              {streakData.completionPercentage}% نسبة الالتزام
            </span>
          </div>

          {/* Grid of 30 days */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {past30Days.map((d) => (
              <div
                key={d.date}
                className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                  d.completed
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : d.isToday
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/40'
                    : d.count > 0
                    ? 'bg-sand-200/70 dark:bg-night-800 text-stone-700 dark:text-night-muted border border-sand-300/60 dark:border-night-border'
                    : 'bg-sand-100/50 dark:bg-night-900/60 text-stone-400 dark:text-night-muted'
                }`}
                title={`${d.date}: ${d.completed ? 'مكتمل (5/5)' : `${d.count}/5 صلوات`}`}
              >
                <span className="text-[11px] font-sans font-bold">{d.dayNumber}</span>
                <span className="text-[8px] mt-0.5">
                  {d.completed ? '✓' : d.isToday ? 'اليوم' : `${d.count}/5`}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-sand-200/60 dark:border-night-border/60 text-[10px] text-stone-500 dark:text-night-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>مكتمل (5/5)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>اليوم (مستمر)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sand-200 dark:bg-night-800 inline-block" />
              <span>غير مكتمل</span>
            </span>
          </div>
        </div>

        {/* Spiritual Privacy & Meaning Footer */}
        <div className="space-y-2 text-center text-stone-500 dark:text-night-muted text-xs border-t border-sand-200/60 dark:border-night-border pt-4">
          <p className="font-arabic-text text-islamic-900 dark:text-night-text font-medium text-xs">
            «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
          </p>
          <p className="text-[10px] text-stone-400 dark:text-night-muted flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
            <span>سجل استمراريتك خاص بك ومحفوظ على جهازك لتشجيعك على المداومة</span>
          </p>
        </div>
      </div>
    </div>
  );
};
