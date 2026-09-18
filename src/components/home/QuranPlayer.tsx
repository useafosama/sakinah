import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Youtube, ExternalLink, Sparkles, Mic2, Search, Play, Volume2 } from 'lucide-react';
import surahsData from '../../data/surahs.json';

interface SurahItem {
  number: number;
  name: string;
  ayahs: number;
  type: string;
}

const surahs = surahsData as SurahItem[];
const PLAYLIST_ID = "PL2hoGhz2jBSqpWTv6svf4e3HCtPMwqY0g";
const PLAYLIST_URL = `https://youtube.com/playlist?list=${PLAYLIST_ID}`;

export const QuranPlayer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // 0-indexed for playlist
  const [hasSelected, setHasSelected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const currentSurah = surahs[selectedIndex] || surahs[0];

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.trim().toLowerCase();
    return surahs.filter(
      (s) =>
        s.name.includes(q) ||
        `سورة ${s.name}`.includes(q) ||
        String(s.number).includes(q)
    );
  }, [searchQuery]);

  // YouTube embed URL with playlist and current index
  const embedUrl = useMemo(() => {
    return `https://www.youtube.com/embed?listType=playlist&list=${PLAYLIST_ID}&index=${selectedIndex}${
      hasSelected ? '&autoplay=1' : ''
    }&enablejsapi=1&rel=0`;
  }, [selectedIndex, hasSelected]);

  const handleSelectSurah = (index: number) => {
    setSelectedIndex(index);
    setHasSelected(true);
  };

  // Scroll active item into view when selected
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <section className="w-full mx-auto my-4 sm:my-6" aria-label="القرآن الكريم كاملًا">
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-sand-100 dark:border-night-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
                القرآن الكريم كاملًا
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-arabic-text">
              تلاوة القرآن الكريم كاملًا
            </p>
          </div>

          {/* Reader Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold-50 dark:bg-night-800 text-gold-700 dark:text-gold-400 border border-gold-200/60 dark:border-night-border text-xs font-semibold w-fit">
            <Mic2 className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span className="font-arabic-text">الشيخ مشاري راشد العفاسي</span>
          </div>
        </div>

        {/* Desktop 2-Column / Mobile Stacked Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Video Player Column (8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
            {/* 16:9 Responsive Player Wrapper */}
            <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-sand-200 dark:bg-night-900 border border-sand-300/80 dark:border-night-border shadow-inner">
              <iframe
                key={`${selectedIndex}-${hasSelected}`}
                src={embedUrl}
                title={`تلاوة سورة ${currentSurah.name} — الشيخ مشاري العفاسي`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Currently Selected Surah Meta & YouTube Link */}
            <div className="p-3.5 bg-sand-50/80 dark:bg-night-900/60 rounded-xl border border-sand-200/70 dark:border-night-border flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 flex items-center justify-center text-xs font-bold font-sans">
                  {String(currentSurah.number).padStart(3, '0')}
                </span>
                <div>
                  <h3 className="font-arabic-text text-sm font-bold text-islamic-950 dark:text-night-text">
                    سورة {currentSurah.name}
                  </h3>
                  <span className="text-[11px] text-stone-400 dark:text-night-muted font-sans">
                    {currentSurah.ayahs} آية • {currentSurah.type}
                  </span>
                </div>
              </div>

              <a
                href={PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-night-800 text-stone-600 dark:text-night-muted hover:text-red-600 dark:hover:text-red-400 border border-sand-200/80 dark:border-night-border text-xs font-medium transition-colors"
                title="فتح قائمة التشغيل على YouTube"
              >
                <Youtube className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>فتح على YouTube</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Surah Selector Column (5 cols on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-2.5 bg-sand-50/60 dark:bg-night-900/40 p-3 sm:p-3.5 rounded-2xl border border-sand-200/80 dark:border-night-border">
            {/* Search Filter Header */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-islamic-900 dark:text-night-text font-arabic-text">
                <Volume2 className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                <span>فهرس السور (114 سورة)</span>
              </div>
              <span className="text-[10px] text-stone-400 dark:text-night-muted font-sans">
                اختر أي سورة للتشغيل
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم أو رقم السورة..."
                className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-white dark:bg-night-850 border border-sand-200/90 dark:border-night-border text-stone-900 dark:text-night-text placeholder:text-stone-400 dark:placeholder:text-night-muted focus:outline-none focus:ring-2 focus:ring-islamic-700/20 transition-all text-right"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 dark:text-night-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Scrollable Surah List */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5 pr-0.5 pl-1 custom-scrollbar">
              {filteredSurahs.length === 0 ? (
                <p className="text-center py-6 text-xs text-stone-400 dark:text-night-muted">
                  لا توجد سورة تطابق بحثك
                </p>
              ) : (
                filteredSurahs.map((surah) => {
                  const surahIndex = surah.number - 1;
                  const isSelected = selectedIndex === surahIndex;

                  return (
                    <button
                      key={surah.number}
                      ref={isSelected ? activeItemRef : null}
                      onClick={() => handleSelectSurah(surahIndex)}
                      className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 font-semibold shadow-2xs'
                          : 'bg-white dark:bg-night-850 hover:bg-sand-100 dark:hover:bg-night-800 text-stone-800 dark:text-night-text border border-sand-200/60 dark:border-night-border'
                      }`}
                    >
                      {/* Left side: Surah Number & Name */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-sans font-medium ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-black/15 dark:text-islamic-950'
                              : 'bg-sand-100 dark:bg-night-800 text-stone-500 dark:text-night-muted'
                          }`}
                        >
                          {surah.number}
                        </span>
                        <span className="font-arabic-text text-xs sm:text-[13px]">
                          سورة {surah.name}
                        </span>
                      </div>

                      {/* Right side: Ayahs & Status Indicator */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-sans ${
                            isSelected
                              ? 'text-sand-100/90 dark:text-islamic-950/80'
                              : 'text-stone-400 dark:text-night-muted'
                          }`}
                        >
                          {surah.ayahs} آية
                        </span>

                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/15 flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 fill-current text-sand-50 dark:text-islamic-950 mr-0.5" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex items-center gap-1.5 text-stone-400 dark:text-night-muted text-[11px] font-arabic-text">
          <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
          <span>التلاوة متصلة ومباشرة مع كامل خيارات التحكم والصوت وجودة الفيديو دون مغادرة الموقع</span>
        </div>
      </div>
    </section>
  );
};
