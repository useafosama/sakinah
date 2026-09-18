import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { Dhikr, Hadith, PageType } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  adhkar: Dhikr[];
  hadiths: Hadith[];
  onSelectDhikr: (dhikr: Dhikr) => void;
  onSelectHadith: (hadith: Hadith) => void;
  onNavigate: (page: PageType) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  adhkar,
  hadiths,
  onSelectDhikr,
  onSelectHadith,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'adhkar' | 'hadith'>('all');

  // Arabic normalization for search
  const normalizeArabic = (text: string) => {
    return text
      .replace(/([^\u0621-\u064A\s0-9a-zA-Z])/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  const results = useMemo(() => {
    if (!query.trim()) return { adhkar: [], hadiths: [] };
    const q = normalizeArabic(query.trim());

    const matchedAdhkar = adhkar.filter((item) => {
      const matchAr = normalizeArabic(item.arabic).includes(q);
      const matchTitle = normalizeArabic(item.title).includes(q);
      const matchEn = item.translation?.toLowerCase().includes(query.toLowerCase());
      const matchVirtue = item.virtue ? normalizeArabic(item.virtue).includes(q) : false;
      const matchRef = item.reference ? normalizeArabic(item.reference).includes(q) : false;
      return matchAr || matchTitle || matchEn || matchVirtue || matchRef;
    });

    const matchedHadiths = hadiths.filter((item) => {
      const matchAr = normalizeArabic(item.arabic).includes(q);
      const matchNarrator = normalizeArabic(item.narratorAr).includes(q);
      const matchBook = normalizeArabic(item.book).includes(q);
      const matchTopic = normalizeArabic(item.topicAr).includes(q);
      const matchEn = item.english?.toLowerCase().includes(query.toLowerCase());
      return matchAr || matchNarrator || matchBook || matchTopic || matchEn;
    });

    return { adhkar: matchedAdhkar, hadiths: matchedHadiths };
  }, [query, adhkar, hadiths]);

  const totalResults = (filterType === 'hadith' ? 0 : results.adhkar.length) + (filterType === 'adhkar' ? 0 : results.hadiths.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-islamic-950/50 dark:bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            className="relative w-full max-w-xl bg-sand-50 dark:bg-night-900 rounded-2xl sm:rounded-3xl border border-sand-300/80 dark:border-night-border p-4 sm:p-5 shadow-2xl z-10 max-h-[80vh] flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center mb-3">
              <Search className="absolute right-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالكلمة، اسم الذكر، الراوي، أو كتاب الحديث..."
                className="w-full pr-10 pl-10 py-2.5 bg-white dark:bg-night-850 rounded-xl sm:rounded-2xl border border-sand-300/80 dark:border-night-border text-stone-900 dark:text-night-text placeholder:text-stone-400 dark:placeholder:text-night-muted focus:outline-none focus:border-islamic-800 dark:focus:border-gold-400 text-xs sm:text-sm shadow-2xs"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute left-3 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-night-text rounded-full"
                  aria-label="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Quick Tags */}
            <div className="flex items-center justify-between pb-2.5 border-b border-sand-200/70 dark:border-night-border text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    filterType === 'all'
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 font-medium'
                      : 'bg-white dark:bg-night-850 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border'
                  }`}
                >
                  الكل ({results.adhkar.length + results.hadiths.length})
                </button>
                <button
                  onClick={() => setFilterType('adhkar')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    filterType === 'adhkar'
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 font-medium'
                      : 'bg-white dark:bg-night-850 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border'
                  }`}
                >
                  الأذكار ({results.adhkar.length})
                </button>
                <button
                  onClick={() => setFilterType('hadith')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    filterType === 'hadith'
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 font-medium'
                      : 'bg-white dark:bg-night-850 text-stone-600 dark:text-night-muted border border-sand-200/80 dark:border-night-border'
                  }`}
                >
                  الأحاديث ({results.hadiths.length})
                </button>
              </div>

              <span className="text-[10px] text-stone-400 dark:text-night-muted hidden sm:inline">
                اضغط <kbd className="px-1 py-0.5 rounded bg-sand-200 dark:bg-night-800 font-sans">Esc</kbd> للإغلاق
              </span>
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
              {!query.trim() ? (
                <div className="text-center py-8 text-stone-400 dark:text-night-muted">
                  <Search className="w-6 h-6 mx-auto mb-1.5 stroke-[1.5] text-stone-300 dark:text-night-muted/50" />
                  <p className="text-xs">ابحث في صحيح الأذكار والأحاديث النبوية الموثقة</p>
                  
                  {/* Topic suggestions */}
                  <div className="flex flex-wrap justify-center items-center gap-1.5 mt-3 text-xs">
                    <span className="text-[11px] text-stone-400 ml-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> اقتراحات:
                    </span>
                    {['سيد الاستغفار', 'آية الكرسي', 'النية', 'حسن الخلق', 'الصبر', 'البخاري', 'مسلم', 'النوم'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-2.5 py-0.5 bg-white dark:bg-night-850 border border-sand-200 dark:border-night-border rounded-full text-stone-600 dark:text-night-muted hover:border-gold-400 text-[11px] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-8 text-stone-400 dark:text-night-muted">
                  <p className="text-xs">لم يتم العثور على نتائج مطابقة لـ "{query}"</p>
                  <p className="text-[11px] text-stone-400 mt-1">جرب البحث بكلمات أخرى أو بجزء من النص</p>
                </div>
              ) : (
                <>
                  {/* Matched Adhkar */}
                  {filterType !== 'hadith' && results.adhkar.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-semibold text-stone-400 dark:text-night-muted uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-gold-500" /> الأذكار والأدعية ({results.adhkar.length})
                      </h4>
                      {results.adhkar.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectDhikr(item);
                            onNavigate('adhkar');
                            onClose();
                          }}
                          className="p-3 bg-white dark:bg-night-850 rounded-xl border border-sand-200/80 dark:border-night-border hover:border-islamic-800/40 dark:hover:border-gold-400/40 hover:shadow-2xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-islamic-900 dark:text-gold-400">{item.title}</span>
                            <span className="text-[10px] text-stone-400 dark:text-night-muted flex items-center gap-0.5">
                              عرض <ArrowRight className="w-2.5 h-2.5 group-hover:-translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                          <p className="font-arabic-text text-stone-800 dark:text-night-text text-xs line-clamp-2 leading-relaxed">
                            {item.arabic}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Hadiths */}
                  {filterType !== 'adhkar' && results.hadiths.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-[11px] font-semibold text-stone-400 dark:text-night-muted uppercase tracking-wider flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-islamic-800 dark:text-gold-400" /> الأحاديث النبوية ({results.hadiths.length})
                      </h4>
                      {results.hadiths.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectHadith(item);
                            onNavigate('hadith');
                            onClose();
                          }}
                          className="p-3 bg-white dark:bg-night-850 rounded-xl border border-sand-200/80 dark:border-night-border hover:border-islamic-800/40 dark:hover:border-gold-400/40 hover:shadow-2xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gold-600 dark:text-gold-400">{item.narratorAr}</span>
                            <span className="text-[10px] text-stone-400 dark:text-night-muted flex items-center gap-0.5">
                              عرض <ArrowRight className="w-2.5 h-2.5 group-hover:-translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                          <p className="font-arabic-text text-stone-800 dark:text-night-text text-xs line-clamp-2 leading-relaxed">
                            {item.arabic}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
