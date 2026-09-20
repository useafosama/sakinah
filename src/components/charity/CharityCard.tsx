import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Flame,
  Plus,
  BookOpen
} from 'lucide-react';
import { PageType } from '../../types';
import { GoodDeedRecord } from '../../types/charity';
import { GOOD_DEED_OPTIONS } from '../../services/charityService';
import { useToast } from '../common/Toast';

interface CharityCardProps {
  todayDeeds: GoodDeedRecord[];
  hasLoggedToday: boolean;
  streakDays: number;
  onOpenLogging: () => void;
  onSnooze: () => void;
  onNavigate: (page: PageType) => void;
}

export const CharityCard: React.FC<CharityCardProps> = ({
  todayDeeds,
  hasLoggedToday,
  streakDays,
  onOpenLogging,
  onSnooze,
  onNavigate,
}) => {
  const { showToast } = useToast();

  const handleSnoozeClick = () => {
    onSnooze();
    showToast('سنذكّرك لاحقاً في المساء بإذن الله 🤍');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4.5 sm:p-5 border border-sand-300/80 dark:border-night-border shadow-card text-right font-arabic-text"
      dir="rtl"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-gold-500/10 dark:bg-gold-400/10 text-gold-600 dark:text-gold-400 shrink-0">
            <Heart className="w-4 h-4 fill-current" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading leading-tight flex items-center gap-1.5">
              <span>خير اليوم والصدقة</span>
              <span className="text-xs font-normal text-stone-400">🌱</span>
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-night-muted">
              أحب الأعمال إلى الله أدومها وإن قل
            </p>
          </div>
        </div>

        {/* Streak / Action shortcut */}
        <div className="flex items-center gap-2">
          {streakDays > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 dark:bg-gold-950/40 text-gold-800 dark:text-gold-400 text-[11px] font-bold border border-gold-200/60 dark:border-gold-800/40"
              title={`${streakDays} أيام متتالية من الخير`}
            >
              <Flame className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 fill-current" />
              <span>{streakDays} {streakDays === 1 ? 'يوم' : streakDays === 2 ? 'يومان' : streakDays <= 10 ? 'أيام' : 'يوماً'}</span>
            </span>
          )}

          <button
            onClick={() => onNavigate('charity')}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-100 dark:hover:bg-night-800 transition-colors cursor-pointer"
            title="عرض سجل وحصاد الخير"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!hasLoggedToday ? (
        /* Not logged today yet */
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sand-50 to-gold-50/40 dark:from-night-900/60 dark:to-night-850 border border-sand-200/80 dark:border-night-border flex items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-islamic-950 dark:text-night-text block mb-0.5">
                هل فعلت اليوم خيرًا؟
              </span>
              <p className="text-[11px] text-stone-600 dark:text-night-muted leading-relaxed">
                صدقة، إطعام، سقي ماء، مساعدة، أو كلمة طيبة تجبر بها خاطراً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={onOpenLogging}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>نعم، فعلت 🤍</span>
            </button>

            <button
              onClick={handleSnoozeClick}
              className="py-2.5 px-3.5 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-night-800 dark:hover:bg-night-700 text-stone-700 dark:text-night-text text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>لاحقًا</span>
            </button>
          </div>
        </div>
      ) : (
        /* Logged today */
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300 block">
                  الحمد لله، تم تسجيل خير اليوم 🤍
                </span>
                <span className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">
                  تقبّل الله طاعتك وأدام بركتك.
                </span>
              </div>
            </div>
          </div>

          {/* Today's deeds list tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {todayDeeds.map((deed) => {
              const opt = GOOD_DEED_OPTIONS.find((o) => o.id === deed.type);
              return (
                <span
                  key={deed.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sand-100/90 dark:bg-night-800 text-stone-800 dark:text-night-text text-[11px] font-bold border border-sand-200/70 dark:border-night-border"
                >
                  <span>{opt?.emoji || '✨'}</span>
                  <span>{deed.title || opt?.label}</span>
                  {deed.amount && (
                    <span className="text-[10px] text-stone-500 font-sans font-normal">
                      ({deed.amount} {deed.currency})
                    </span>
                  )}
                  {deed.isSecret && (
                    <span className="text-[9px] px-1 py-0.2 rounded-md bg-gold-200/70 dark:bg-gold-900/50 text-gold-900 dark:text-gold-300 font-normal">
                      سرّي
                    </span>
                  )}
                </span>
              );
            })}

            <button
              onClick={onOpenLogging}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-night-800 dark:hover:bg-night-700 text-stone-600 dark:text-night-muted text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة خير آخر</span>
            </button>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={() => onNavigate('charity')}
              className="text-[11px] text-gold-700 dark:text-gold-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
            >
              <span>عرض حصاد الخير والتأمل</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
