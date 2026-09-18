import React, { useState } from 'react';
import { BookOpen, Bookmark, Copy, Check, ArrowLeft, Share2 } from 'lucide-react';
import { Hadith, PageType } from '../../types';
import { formatHadithForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface HadithSpotlightProps {
  hadith: Hadith;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare?: (hadith: Hadith) => void;
  onNavigate: (page: PageType) => void;
}

export const HadithSpotlight: React.FC<HadithSpotlightProps> = ({
  hadith,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onNavigate,
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
    <div className="w-full mx-auto my-3 sm:my-4">
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-islamic-900 dark:text-night-text">
              حديث اليوم المختار
            </span>
            <span className="text-[11px] text-stone-400 dark:text-night-muted font-sans">
              • {hadith.topicAr}
            </span>
          </div>

          <div className="flex items-center gap-1">
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
              title="نسخ الحديث"
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
              title={isFavorite ? 'محفوظ في المفضلة' : 'إضافة للمفضلة'}
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

        {/* Hadith Arabic Text */}
        <p className="font-arabic-text text-base sm:text-lg md:text-xl text-stone-900 dark:text-night-text font-normal leading-[1.85] mb-2.5">
          {hadith.arabic}
        </p>

        {/* English Translation */}
        {hadith.english && (
          <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted font-serif italic leading-relaxed mb-3">
            "{hadith.english}"
          </p>
        )}

        {/* Footer info & Link */}
        <div className="pt-3 border-t border-sand-100 dark:border-night-border flex items-center justify-between text-xs text-stone-400 dark:text-night-muted">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-text font-medium text-[11px]">
              {hadith.book} ({hadith.number})
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">{hadith.grade}</span>
          </div>

          <button
            onClick={() => onNavigate('hadith')}
            className="flex items-center gap-1 text-islamic-800 dark:text-gold-400 text-xs font-medium hover:text-islamic-900 dark:hover:underline"
          >
            <span>المزيد من الأحاديث</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
