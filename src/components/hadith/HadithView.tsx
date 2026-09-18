import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Hadith, HadithTopic, ReadingSettings } from '../../types';
import { HadithCard } from './HadithCard';

interface HadithViewProps {
  hadiths: Hadith[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onOpenShare?: (hadith: Hadith) => void;
  settings: ReadingSettings;
  activeTopic: HadithTopic;
  onSelectTopic: (topic: HadithTopic) => void;
}

export const HadithView: React.FC<HadithViewProps> = ({
  hadiths,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  settings,
  activeTopic,
  onSelectTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const topics: { id: HadithTopic; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'sincerity', label: 'النية والإخلاص' },
    { id: 'character', label: 'حسن الخلق' },
    { id: 'remembrance', label: 'فضل الذكر' },
    { id: 'patience', label: 'الصبر والتوكل' },
    { id: 'knowledge', label: 'طلب العلم' },
    { id: 'compassion', label: 'الرحمة والأخوة' },
    { id: 'prayer', label: 'الصلاة والعبادة' },
  ];

  // Filter hadiths by active topic and search query
  const filteredHadiths = hadiths.filter((item) => {
    const matchesTopic = activeTopic === 'all' || item.topic === activeTopic;
    if (!matchesTopic) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.arabic.includes(q) ||
      item.narratorAr.includes(q) ||
      item.book.includes(q) ||
      item.english.toLowerCase().includes(q) ||
      item.topicAr.includes(q)
    );
  });

  return (
    <div className="w-full mx-auto py-2 sm:py-4">
      {/* Page Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sand-100 dark:bg-night-850 text-islamic-800 dark:text-gold-400 border border-sand-200/80 dark:border-night-border mb-2">
          <BookOpen className="w-3 h-3 text-gold-500" />
          <span>صحيح السنة النبوية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic-text text-islamic-900 dark:text-night-text mb-1">
          الأحاديث النبوية الشريفة
        </h1>
        <p className="text-xs text-stone-500 dark:text-night-muted max-w-sm mx-auto">
          قبسات من هدي النبي ﷺ في الأخلاق، والذكر، والصبر، والعبادة
        </p>
      </div>

      {/* Topic Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none justify-start sm:justify-center">
        {topics.map((t) => {
          const isActive = activeTopic === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                onSelectTopic(t.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                  : 'bg-white dark:bg-night-850 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border hover:bg-sand-100/70 dark:hover:bg-night-800'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search & Counter Bar */}
      <div className="bg-white dark:bg-night-850 rounded-2xl p-3 sm:p-3.5 border border-sand-300/70 dark:border-night-border shadow-2xs mb-5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأحاديث أو الرواة..."
            className="w-full pr-8 pl-3 py-1.5 text-xs bg-sand-50 dark:bg-night-900 rounded-xl border border-sand-200 dark:border-night-border text-stone-800 dark:text-night-text placeholder:text-stone-400 focus:outline-none focus:border-islamic-800 dark:focus:border-gold-400"
          />
        </div>

        <span className="text-[11px] text-stone-400 dark:text-night-muted font-sans">
          عرض <strong>{filteredHadiths.length}</strong> من أصل {hadiths.length} حديثاً
        </span>
      </div>

      {/* Hadith List */}
      <div className="space-y-3.5">
        {filteredHadiths.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-night-850 rounded-2xl border border-sand-200/80 dark:border-night-border p-6 text-stone-400 dark:text-night-muted">
            <p className="text-xs">لم يتم العثور على أحاديث مطابقة للبحث</p>
          </div>
        ) : (
          filteredHadiths.map((item) => (
            <HadithCard
              key={item.id}
              hadith={item}
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
