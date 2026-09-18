import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bed, RotateCcw, CheckCircle2, Search, BookOpenText } from 'lucide-react';
import { Dhikr, AdhkarCategory, ReadingSettings, LastPosition } from '../../types';
import { DhikrCard } from './DhikrCard';

interface AdhkarViewProps {
  adhkar: Dhikr[];
  counts: Record<string, number>;
  onIncrement: (id: string, target: number) => void;
  onReset: (id: string) => void;
  onResetAllCategory: (ids: string[]) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onOpenShare: (dhikr: Dhikr) => void;
  onOpenReadingMode: () => void;
  onSavePosition: (category: AdhkarCategory, dhikrId: string) => void;
  lastPosition: LastPosition | null;
  settings: ReadingSettings;
  selectedCategory: AdhkarCategory;
  onSelectCategory: (cat: AdhkarCategory) => void;
}

export const AdhkarView: React.FC<AdhkarViewProps> = ({
  adhkar,
  counts,
  onIncrement,
  onReset,
  onResetAllCategory,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onOpenReadingMode,
  onSavePosition,
  lastPosition,
  settings,
  selectedCategory,
  onSelectCategory,
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const categories: { id: AdhkarCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'morning', label: 'أذكار الصباح', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'evening', label: 'أذكار المساء', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'sleep', label: 'أذكار النوم', icon: <Bed className="w-3.5 h-3.5 text-stone-500" /> },
  ];

  // Auto-scroll to last read dhikr if it belongs to this category
  useEffect(() => {
    if (lastPosition && lastPosition.category === selectedCategory && lastPosition.dhikrId) {
      const el = document.getElementById(`dhikr-${lastPosition.dhikrId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [selectedCategory, lastPosition]);

  // Filter adhkar by selected category
  const categoryAdhkar = adhkar.filter((item) => item.category === selectedCategory);

  // Apply search query if typed
  const filteredAdhkar = categoryAdhkar.filter((item) => {
    if (!localSearch.trim()) return true;
    const q = localSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.arabic.includes(q) ||
      item.translation?.toLowerCase().includes(q)
    );
  });

  // Calculate completion progress for current category
  const completedCount = categoryAdhkar.filter(
    (item) => (counts[item.id] || 0) >= item.count
  ).length;
  const totalCount = categoryAdhkar.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleResetCurrentCategory = () => {
    const ids = categoryAdhkar.map((item) => item.id);
    onResetAllCategory(ids);
  };

  const handleDhikrCount = (id: string, target: number) => {
    onSavePosition(selectedCategory, id);
    onIncrement(id, target);
  };

  return (
    <div className="w-full mx-auto py-2 sm:py-4">
      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic-text text-islamic-900 dark:text-night-text mb-1">
          الأذكار والأدعية الصحيحة
        </h1>
        <p className="text-xs text-stone-500 dark:text-night-muted max-w-sm mx-auto">
          حصن نفسك بذكر الله في الصباح والمساء ودبر كل صلاة
        </p>
      </div>

      {/* Category Pills Navigation & Reading Mode trigger */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setLocalSearch('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                    : 'bg-white dark:bg-night-850 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border hover:bg-sand-100/70 dark:hover:bg-night-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenReadingMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold-50 dark:bg-night-800 text-gold-700 dark:text-gold-400 border border-gold-200 dark:border-night-border whitespace-nowrap hover:bg-gold-100 dark:hover:bg-night-700 transition-colors shrink-0"
          title="بدء وضع القراءة الهادئ"
        >
          <BookOpenText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">وضع القراءة</span>
        </button>
      </div>

      {/* Category Progress & Controls Bar */}
      <div className="bg-white dark:bg-night-850 rounded-2xl p-3 sm:p-4 border border-sand-300/70 dark:border-night-border shadow-2xs mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Progress Display */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-full bg-sand-100 dark:bg-night-800 flex items-center justify-center text-islamic-900 dark:text-gold-400 font-bold text-[11px] font-sans">
            {progressPercent}%
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-islamic-900 dark:text-night-text">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                أنجزت {completedCount} من {totalCount} أذكار
              </span>
            </div>
            <div className="w-32 sm:w-40 h-1 bg-sand-200 dark:bg-night-800 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-islamic-800 dark:bg-gold-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </div>
        </div>

        {/* Search & Reset Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-44">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="تصفية الأذكار..."
              className="w-full pr-7 pl-2.5 py-1 text-xs bg-sand-50 dark:bg-night-900 rounded-xl border border-sand-200 dark:border-night-border text-stone-800 dark:text-night-text placeholder:text-stone-400 focus:outline-none focus:border-islamic-800 dark:focus:border-gold-400"
            />
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleResetCurrentCategory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-600 dark:text-night-muted text-xs font-medium transition-colors"
              title="إعادة ضبط أذكار هذا القسم"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Dhikr Cards List */}
      <div className="space-y-3.5">
        {filteredAdhkar.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-night-850 rounded-2xl border border-sand-200/80 dark:border-night-border p-6 text-stone-400 dark:text-night-muted">
            <p className="text-xs">لم يتم العثور على أذكار مطابقة للبحث</p>
          </div>
        ) : (
          filteredAdhkar.map((item) => (
            <DhikrCard
              key={item.id}
              dhikr={item}
              count={counts[item.id] || 0}
              onIncrement={() => handleDhikrCount(item.id, item.count)}
              onReset={() => onReset(item.id)}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => onToggleFavorite(item.id)}
              onOpenShare={onOpenShare}
              settings={settings}
            />
          ))
        )}
      </div>
    </div>
  );
};
