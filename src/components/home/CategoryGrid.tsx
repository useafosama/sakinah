import React from 'react';
import { Sun, Moon, Sparkles, BookOpen, Compass, Bed, ArrowLeft } from 'lucide-react';
import { PageType, AdhkarCategory } from '../../types';

interface CategoryGridProps {
  onNavigate: (page: PageType) => void;
  onSelectCategory?: (category: AdhkarCategory) => void;
  onOpenTasbeeh: () => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onNavigate,
  onSelectCategory,
  onOpenTasbeeh,
}) => {
  const categories = [
    {
      id: 'morning',
      title: 'أذكار الصباح',
      desc: 'حصن المسلم وحفظ اليوم وبركته',
      icon: <Sun className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 border-sand-200/80 dark:border-night-border',
      action: () => {
        if (onSelectCategory) onSelectCategory('morning');
        onNavigate('adhkar');
      },
    },
    {
      id: 'evening',
      title: 'أذكار المساء',
      desc: 'سكينة المساء والحفظ من كل سوء',
      icon: <Moon className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border-sand-200/80 dark:border-night-border',
      action: () => {
        if (onSelectCategory) onSelectCategory('evening');
        onNavigate('adhkar');
      },
    },
    {
      id: 'sleep',
      title: 'أذكار النوم',
      desc: 'راحة النفس وأدعية ما قبل المنام',
      icon: <Bed className="w-4.5 h-4.5 text-stone-600 dark:text-night-muted" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-stone-50 dark:hover:bg-night-800 border-sand-200/80 dark:border-night-border',
      action: () => {
        if (onSelectCategory) onSelectCategory('sleep');
        onNavigate('adhkar');
      },
    },
    {
      id: 'hadith',
      title: 'الأحاديث النبوية',
      desc: 'رياض الصالحين وصحيح السنة',
      icon: <BookOpen className="w-4.5 h-4.5 text-islamic-800 dark:text-gold-400" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-islamic-50/30 dark:hover:bg-night-800 border-sand-200/80 dark:border-night-border',
      action: () => onNavigate('hadith'),
    },
    {
      id: 'tasbeeh',
      title: 'السبحة الإلكترونية',
      desc: 'تسبيح واستغفار بعداد هادئ',
      icon: <Compass className="w-4.5 h-4.5 text-gold-600 dark:text-gold-400" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-gold-50/30 dark:hover:bg-night-800 border-sand-200/80 dark:border-night-border',
      action: onOpenTasbeeh,
    },
    {
      id: 'favorites',
      title: 'المفضلة والورد',
      desc: 'أذكارك وأحاديثك المحفوظة محلياً',
      icon: <Sparkles className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-white dark:bg-night-850 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 border-sand-200/80 dark:border-night-border',
      action: () => onNavigate('favorites'),
    },
  ];

  return (
    <div className="w-full mx-auto my-4 sm:my-6">
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-arabic-text text-islamic-900 dark:text-night-text">
          أقسام الذكر والتأمل
        </h2>
        <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
          تصفح الأذكار المأثورة وصحيح الأحاديث بكل يسر
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={cat.action}
            className={`group p-4 rounded-2xl border text-right transition-all duration-200 shadow-2xs hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between ${cat.bg}`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="p-2 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200/60 dark:border-night-border shadow-2xs">
                {cat.icon}
              </div>
              <ArrowLeft className="w-3.5 h-3.5 text-stone-300 dark:text-night-muted group-hover:-translate-x-0.5 group-hover:text-islamic-900 dark:group-hover:text-gold-400 transition-all" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold font-arabic-text text-islamic-950 dark:text-night-text mb-0.5">
                {cat.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-night-muted leading-relaxed line-clamp-1 sm:line-clamp-none">
                {cat.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
