import React, { useState } from 'react';
import { Bookmark, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { Dhikr, Hadith, PageType, ReadingSettings } from '../../types';
import { DhikrCard } from '../adhkar/DhikrCard';
import { HadithCard } from '../hadith/HadithCard';

interface FavoritesViewProps {
  allAdhkar: Dhikr[];
  allHadiths: Hadith[];
  favoriteAdhkarIds: string[];
  favoriteHadithIds: string[];
  counts: Record<string, number>;
  onIncrementDhikr: (id: string, target: number) => void;
  onResetDhikr: (id: string) => void;
  onToggleDhikrFavorite: (id: string) => void;
  onToggleHadithFavorite: (id: string) => void;
  onOpenShareDhikr?: (dhikr: Dhikr) => void;
  onOpenShareHadith?: (hadith: Hadith) => void;
  onClearAll: () => void;
  onNavigate: (page: PageType) => void;
  settings: ReadingSettings;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  allAdhkar,
  allHadiths,
  favoriteAdhkarIds,
  favoriteHadithIds,
  counts,
  onIncrementDhikr,
  onResetDhikr,
  onToggleDhikrFavorite,
  onToggleHadithFavorite,
  onOpenShareDhikr,
  onOpenShareHadith,
  onClearAll,
  onNavigate,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'adhkar' | 'hadith'>('all');

  const savedAdhkar = allAdhkar.filter((item) => favoriteAdhkarIds.includes(item.id));
  const savedHadiths = allHadiths.filter((item) => favoriteHadithIds.includes(item.id));

  const totalSaved = savedAdhkar.length + savedHadiths.length;

  return (
    <div className="w-full mx-auto py-2 sm:py-4">
      {/* Page Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gold-50 dark:bg-night-850 text-gold-600 dark:text-gold-400 border border-gold-200/80 dark:border-night-border mb-2">
          <Bookmark className="w-3 h-3" />
          <span>المحفوظات الشخصية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic-text text-islamic-900 dark:text-night-text mb-1">
          الأذكار والأحاديث المفضلة
        </h1>
        <p className="text-xs text-stone-500 dark:text-night-muted max-w-sm mx-auto">
          مجموعتك المحفوظة محلياً لسهولة الرجوع إليها يومياً
        </p>
      </div>

      {totalSaved === 0 ? (
        /* Empty State */
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl border border-sand-300/70 dark:border-night-border p-6 shadow-2xs max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 dark:bg-night-800 flex items-center justify-center text-stone-400 dark:text-night-muted mx-auto mb-3">
            <Bookmark className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-islamic-900 dark:text-night-text mb-1 font-arabic-text">
            لا توجد عناصر في المفضلة حتى الآن
          </h3>
          <p className="text-xs text-stone-500 dark:text-night-muted max-w-xs mx-auto mb-5 leading-relaxed">
            يمكنك حفظ أي ذكر أو حديث تفضله بالضغط على أيقونة الإشارة المرجعية أثناء التصفح.
          </p>

          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => onNavigate('adhkar')}
              className="px-4 py-2 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-medium hover:bg-islamic-900 dark:hover:bg-gold-300 transition-colors shadow-2xs"
            >
              تصفح الأذكار
            </button>
            <button
              onClick={() => onNavigate('hadith')}
              className="px-4 py-2 rounded-full bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-text text-xs font-medium hover:bg-sand-200 dark:hover:bg-night-700 border border-sand-200 dark:border-night-border transition-colors"
            >
              تصفح الأحاديث
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs and Clear Button */}
          <div className="flex items-center justify-between gap-3 mb-5 bg-white dark:bg-night-850 p-2.5 rounded-2xl border border-sand-300/70 dark:border-night-border shadow-2xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                    : 'text-stone-600 dark:text-night-muted hover:bg-sand-100 dark:hover:bg-night-800'
                }`}
              >
                الكل ({totalSaved})
              </button>
              <button
                onClick={() => setActiveTab('adhkar')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'adhkar'
                    ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                    : 'text-stone-600 dark:text-night-muted hover:bg-sand-100 dark:hover:bg-night-800'
                }`}
              >
                الأذكار ({savedAdhkar.length})
              </button>
              <button
                onClick={() => setActiveTab('hadith')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'hadith'
                    ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                    : 'text-stone-600 dark:text-night-muted hover:bg-sand-100 dark:hover:bg-night-800'
                }`}
              >
                الأحاديث ({savedHadiths.length})
              </button>
            </div>

            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 px-2.5 py-1 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="مسح جميع المحفوظات"
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-[11px]">مسح الكل</span>
            </button>
          </div>

          {/* List Content */}
          <div className="space-y-6">
            {/* Adhkar Section */}
            {(activeTab === 'all' || activeTab === 'adhkar') && savedAdhkar.length > 0 && (
              <div className="space-y-3">
                {activeTab === 'all' && (
                  <h3 className="text-xs font-bold text-islamic-900 dark:text-night-text flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    الأذكار المحفوظة ({savedAdhkar.length})
                  </h3>
                )}
                <div className="space-y-3.5">
                  {savedAdhkar.map((item) => (
                    <DhikrCard
                      key={item.id}
                      dhikr={item}
                      count={counts[item.id] || 0}
                      onIncrement={() => onIncrementDhikr(item.id, item.count)}
                      onReset={() => onResetDhikr(item.id)}
                      isFavorite={true}
                      onToggleFavorite={() => onToggleDhikrFavorite(item.id)}
                      onOpenShare={onOpenShareDhikr}
                      settings={settings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hadiths Section */}
            {(activeTab === 'all' || activeTab === 'hadith') && savedHadiths.length > 0 && (
              <div className="space-y-3 pt-2">
                {activeTab === 'all' && (
                  <h3 className="text-xs font-bold text-islamic-900 dark:text-night-text flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
                    الأحاديث المحفوظة ({savedHadiths.length})
                  </h3>
                )}
                <div className="space-y-3.5">
                  {savedHadiths.map((item) => (
                    <HadithCard
                      key={item.id}
                      hadith={item}
                      isFavorite={true}
                      onToggleFavorite={() => onToggleHadithFavorite(item.id)}
                      onOpenShare={onOpenShareHadith}
                      settings={settings}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
