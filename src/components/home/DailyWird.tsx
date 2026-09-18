import React from 'react';
import { Sun, Moon, ArrowLeft, CheckCircle2, Flame } from 'lucide-react';
import { Dhikr, AdhkarCategory, PageType, LastPosition } from '../../types';

interface DailyWirdProps {
  allAdhkar: Dhikr[];
  counts: Record<string, number>;
  lastPosition: LastPosition | null;
  onNavigate: (page: PageType) => void;
  onSelectCategory: (category: AdhkarCategory) => void;
}

export const DailyWird: React.FC<DailyWirdProps> = ({
  allAdhkar,
  counts,
  lastPosition,
  onNavigate,
  onSelectCategory,
}) => {
  // Determine current time period (Morning: 4 AM - 3 PM, Evening: 3 PM - 4 AM)
  const currentHour = new Date().getHours();
  const isMorningTime = currentHour >= 4 && currentHour < 15;
  const targetCategory: AdhkarCategory = isMorningTime ? 'morning' : 'evening';

  // If user was last reading morning or evening, use that, otherwise use time-based recommendation
  const activeCategory: AdhkarCategory =
    lastPosition && (lastPosition.category === 'morning' || lastPosition.category === 'evening')
      ? lastPosition.category
      : targetCategory;

  const wirdAdhkar = allAdhkar.filter((item) => item.category === activeCategory);
  const completedCount = wirdAdhkar.filter(
    (item) => (counts[item.id] || 0) >= item.count
  ).length;
  const totalCount = wirdAdhkar.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = progressPercent === 100;

  // Find the first uncompleted dhikr or last viewed dhikr
  const nextUncompleted = wirdAdhkar.find((item) => (counts[item.id] || 0) < item.count);

  const handleContinueWird = () => {
    onSelectCategory(activeCategory);
    onNavigate('adhkar');
  };

  return (
    <div className="w-full mx-auto my-3 sm:my-4">
      <div className="relative bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Info / Status */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              activeCategory === 'morning'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40'
            }`}>
              {activeCategory === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-islamic-900 dark:text-night-text font-arabic-text">
                  وردك اليومي — {activeCategory === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
                </h3>
                {isAllCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> مكتمل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/60 px-2 py-0.2 rounded-full border border-gold-200 dark:border-gold-800">
                    <Flame className="w-3 h-3" /> {progressPercent}%
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
                {isAllCompleted
                  ? 'هنيئاً لك، أتممت ورد اليوم كاملاً بحمد الله'
                  : nextUncompleted
                  ? `التالي: ${nextUncompleted.title} (${completedCount} من ${totalCount} منجز)`
                  : `أنجزت ${completedCount} من أصل ${totalCount} أذكار`}
              </p>
            </div>
          </div>

          {/* Right Action Button & Progress */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-sand-100 dark:border-night-border">
            {/* Mini Progress Bar */}
            <div className="hidden md:block w-24">
              <div className="w-full h-1.5 bg-sand-200 dark:bg-night-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-islamic-800 dark:bg-gold-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleContinueWird}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl sm:rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-all shadow-2xs group w-full sm:w-auto justify-center"
            >
              <span>{isAllCompleted ? 'مراجعة الورد' : 'متابعة الورد'}</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
