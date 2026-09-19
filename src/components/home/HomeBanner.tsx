import React from 'react';
import { Sparkles, ChevronLeft } from 'lucide-react';
import { PageType } from '../../types';

interface HomeBannerProps {
  onNavigate: (page: PageType) => void;
  displayName?: string;
  isSkippedOnboarding?: boolean;
  onOpenSetup?: () => void;
}

export const HomeBanner: React.FC<HomeBannerProps> = ({
  onNavigate,
  displayName,
  isSkippedOnboarding,
  onOpenSetup,
}) => {
  return (
    <div className="w-full mx-auto my-3 sm:my-4 space-y-3 font-arabic-text" dir="rtl">
      {/* Personalized Greeting Bar */}
      {displayName && displayName.trim() && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sand-100 to-white dark:from-night-850 dark:to-night-900 border border-sand-200/80 dark:border-night-border shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">👋</span>
            <div>
              <span className="text-xs font-bold text-islamic-950 dark:text-night-text">
                السلام عليكم، {displayName.trim()}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-night-muted block sm:inline sm:mr-1.5">
                نسأل الله أن يجعل يومك عامراً بالطمأنينة والذكر
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Resume Setup Banner if user skipped onboarding */}
      {isSkippedOnboarding && onOpenSetup && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-gold-50/80 dark:bg-night-850 border border-gold-200/80 dark:border-gold-500/20 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-islamic-950 dark:text-night-text block">
                لم تكمل إعداد التطبيق بعد
              </span>
              <span className="text-[11px] text-stone-600 dark:text-night-muted">
                خصص مواقيت الصلاة لمدينتك والتنبيهات وترتيب الصفحة الرئيسية في أقل من دقيقة.
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSetup}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer"
          >
            <span>إعداد التطبيق الآن</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Visual Banner */}
      <div
        onClick={() => onNavigate('adhkar')}
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group bg-white dark:bg-night-850"
        title="سكينة | أذكار وأحاديث صحيحة"
      >
        <img
          src="/banner.png"
          alt="سكينة - طريقك إلى طمأنينة أكبر"
          className="w-full h-auto object-cover block group-hover:scale-[1.01] transition-transform duration-500 ease-out"
          loading="eager"
        />

        {/* Subtle hover overlay hint */}
        <div className="absolute inset-0 bg-islamic-950/0 dark:bg-black/0 group-hover:bg-islamic-950/[0.03] dark:group-hover:bg-white/[0.02] transition-colors pointer-events-none" />
      </div>
    </div>
  );
};
