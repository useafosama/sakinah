import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { QuranVerse } from '../../types';
import { formatVerseForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface HeroVerseProps {
  verses: QuranVerse[];
}

export const HeroVerse: React.FC<HeroVerseProps> = ({ verses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const currentVerse = verses[currentIndex] || verses[0];

  const handleNextVerse = () => {
    setCurrentIndex((prev) => (prev + 1) % verses.length);
  };

  const handleCopy = async () => {
    if (!currentVerse) return;
    const formatted = formatVerseForSharing(currentVerse);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      showToast('تم نسخ الآية الكريمة');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full mx-auto my-3 sm:my-4">
      <div className="relative bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-sand-300/70 dark:border-night-border shadow-card text-center overflow-hidden">
        
        {/* Subtle decorative Islamic arch line */}
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
        
        {/* Top Tag & Actions */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gold-50 dark:bg-night-800 text-gold-600 dark:text-gold-400 border border-gold-200/60 dark:border-night-border">
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span>آية وطمأنينة</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
              title="نسخ الآية"
              aria-label="نسخ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNextVerse}
              className="p-1.5 rounded-full text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 transition-transform active:rotate-180 duration-300"
              title="آية أخرى"
              aria-label="آية أخرى"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verse Arabic Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVerse.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <p className="font-quran-verse text-xl sm:text-2xl md:text-[26px] text-islamic-950 dark:text-night-text font-normal leading-[1.95] tracking-normal px-2">
              « {currentVerse.arabic} »
            </p>

            {/* English Translation */}
            <p className="text-stone-500 dark:text-night-muted text-xs sm:text-sm font-serif italic max-w-xl mx-auto leading-relaxed pt-1">
              "{currentVerse.translation}"
            </p>

            {/* Surah Citation */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-medium text-stone-400 dark:text-night-muted">
              <span className="w-6 h-px bg-sand-200 dark:bg-night-border" />
              <span className="text-islamic-800 dark:text-gold-400 font-arabic-text">{currentVerse.surahAr}</span>
              <span>—</span>
              <span>الآية {currentVerse.ayahNumber}</span>
              <span className="w-6 h-px bg-sand-200 dark:bg-night-border" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
