import React, { useState } from 'react';
import { Flame, Check, ChevronLeft, Sparkles } from 'lucide-react';
import { PrayerStreakData } from '../../types/prayer';
import { PrayerStreakModal } from './PrayerStreakModal';

interface PrayerStreakCardProps {
  streakData: PrayerStreakData;
  className?: string;
}

export const PrayerStreakCard: React.FC<PrayerStreakCardProps> = ({
  streakData,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-night-850 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer text-right group ${className}`}
        dir="rtl"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true);
          }
        }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sand-100 dark:border-night-border">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                  الاستمرارية
                </h3>
                {streakData.currentStreak > 0 && (
                  <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold font-sans">
                    🔥 {streakData.currentStreak} {streakData.currentStreak === 1 ? 'يوم' : 'أيام'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-night-muted mt-0.5">
                {streakData.todayStatus === 'completed' ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 inline" />
                    اكتملت صلوات اليوم (5 / 5)
                  </span>
                ) : streakData.todayStatus === 'in_progress' ? (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    يومك مستمر ({streakData.todayCompletedCount} / 5)
                  </span>
                ) : (
                  <span>استمر في متابعة صلواتك الخمس</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-islamic-800 dark:text-gold-400 font-bold group-hover:underline">
            <span>التفاصيل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 7-Day Weekly Streak Tracker */}
        <div className="mt-3.5 flex items-center justify-between gap-1 sm:gap-2">
          {streakData.weeklyDays.map((day) => {
            const isCompleted = day.status === 'completed';
            const isTodayInProgress = day.status === 'today_in_progress';

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1.5"
                title={`${day.dayNameAr} (${day.date}): ${
                  isCompleted
                    ? 'مكتمل (5/5)'
                    : isTodayInProgress
                    ? `اليوم (${day.completedPrayersCount}/5)`
                    : 'غير مكتمل'
                }`}
              >
                {/* Dot / Indicator */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-2xs font-bold'
                      : isTodayInProgress
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-2 border-amber-400/80 ring-2 ring-amber-400/20'
                      : day.isFuture
                      ? 'bg-sand-50 dark:bg-night-900 text-stone-300 dark:text-stone-700 border border-sand-200/50 dark:border-night-border/50'
                      : 'bg-sand-100 dark:bg-night-800 text-stone-400 dark:text-night-muted border border-sand-200 dark:border-night-border'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isTodayInProgress ? (
                    <span className="text-[10px] font-sans font-bold">{day.completedPrayersCount}/5</span>
                  ) : (
                    <span className="text-[10px] text-stone-400 dark:text-stone-600">○</span>
                  )}
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] font-medium ${
                    day.isToday
                      ? 'font-bold text-islamic-950 dark:text-gold-400'
                      : 'text-stone-500 dark:text-night-muted'
                  }`}
                >
                  {day.dayNameAr.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Details Modal */}
      <PrayerStreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streakData={streakData}
      />
    </>
  );
};
