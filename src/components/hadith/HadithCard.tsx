import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Copy, Check, BookOpen, ShieldCheck, Share2 } from 'lucide-react';
import { Hadith, ReadingSettings } from '../../types';
import { formatHadithForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface HadithCardProps {
  hadith: Hadith;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare?: (hadith: Hadith) => void;
  settings: ReadingSettings;
}

export const HadithCard: React.FC<HadithCardProps> = ({
  hadith,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    const formatted = formatHadithForSharing(hadith);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      showToast('تم نسخ الحديث الشريف');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (onOpenShare) {
      onOpenShare(hadith);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="relative w-full bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5.5 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-sand-100 dark:border-night-border mb-3">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400">
            <BookOpen className="w-3 h-3" />
          </span>
          <span className="text-xs font-semibold text-islamic-900 dark:text-night-text bg-sand-100/80 dark:bg-night-800 px-2 py-0.5 rounded-full">
            {hadith.topicAr}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {onOpenShare && (
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
              title="بطاقة مشاركة أنيقة"
              aria-label="مشاركة"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
            title="نسخ الحديث الشريف"
            aria-label="نسخ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorite
                ? 'text-gold-500 hover:bg-gold-50 dark:hover:bg-night-800'
                : 'text-stone-400 dark:text-night-muted hover:text-gold-500 hover:bg-sand-100 dark:hover:bg-night-800'
            }`}
            title={isFavorite ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
            aria-label="حفظ في المفضلة"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-gold-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Narrator */}
      <p className="text-xs sm:text-sm font-semibold text-gold-600 dark:text-gold-400 mb-1.5 font-arabic-text">
        {hadith.narratorAr}
      </p>

      {/* Arabic Hadith Matn */}
      <div className="py-1">
        <p
          className="font-arabic-text text-stone-900 dark:text-night-text font-normal leading-[1.85] tracking-normal transition-all duration-150"
          style={{ fontSize: `${settings.arabicFontSize}px` }}
        >
          {hadith.arabic}
        </p>
      </div>

      {/* English Translation */}
      {settings.showTranslation && hadith.english && (
        <div className="mt-3 pt-2.5 border-t border-sand-100 dark:border-night-border">
          <p className="text-[11px] font-sans text-stone-400 dark:text-night-muted mb-0.5">
            {hadith.narratorEn}:
          </p>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted font-serif italic leading-relaxed text-right">
            "{hadith.english}"
          </p>
        </div>
      )}

      {/* Footer Citation & Grade */}
      <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-text font-medium text-[11px]">
            {hadith.book} — حديث رقم {hadith.number}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800">
            <ShieldCheck className="w-3 h-3" />
            {hadith.grade}
          </span>
        </div>

        <span className="text-[10px] text-stone-400 dark:text-night-muted font-sans">
          {hadith.bookEn} #{hadith.number}
        </span>
      </div>
    </motion.div>
  );
};
