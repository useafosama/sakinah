import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Copy, Check, ArrowLeft, Share2, RotateCcw } from 'lucide-react';
import { Dhikr, PageType } from '../../types';
import { DhikrCounter } from '../common/DhikrCounter';
import { formatDhikrForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface DailyDhikrProps {
  dhikr: Dhikr;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare?: (dhikr: Dhikr) => void;
  onNavigate: (page: PageType) => void;
}

export const DailyDhikr: React.FC<DailyDhikrProps> = ({
  dhikr,
  count,
  onIncrement,
  onReset,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    const formatted = formatDhikrForSharing(dhikr);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      showToast('تم نسخ الذكر');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (onOpenShare) {
      onOpenShare(dhikr);
    }
  };

  return (
    <div className="w-full mx-auto my-3 sm:my-4">
      <div className="relative bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-semibold text-islamic-900 dark:text-night-text tracking-wide">
              ذكر اليوم المستحب
            </h3>
            <span className="text-[11px] text-stone-400 dark:text-night-muted font-sans">({dhikr.title})</span>
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
              title="نسخ الذكر"
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

        {/* Content Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex-1 text-right space-y-2.5">
            {/* Arabic Text */}
            <p className="font-arabic-text text-lg sm:text-xl md:text-[22px] text-islamic-950 dark:text-night-text font-normal leading-[1.85]">
              {dhikr.arabic}
            </p>

            {/* Translation */}
            {dhikr.translation && (
              <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted leading-relaxed">
                {dhikr.translation}
              </p>
            )}

            {/* Virtue / Reference */}
            {dhikr.virtue && (
              <div className="p-3 bg-sand-50 dark:bg-night-900/60 rounded-xl border border-sand-200/70 dark:border-night-border text-xs text-stone-600 dark:text-night-muted leading-relaxed">
                <span className="font-semibold text-islamic-900 dark:text-gold-400 ml-1">الفضل:</span>
                {dhikr.virtue}
              </div>
            )}

            {(dhikr.source || dhikr.reference) && (
              <div className="text-[11px] text-stone-400 dark:text-night-muted">
                <span>المصدر: </span>
                <span className="font-medium text-stone-500 dark:text-night-muted">{dhikr.source || dhikr.reference}</span>
              </div>
            )}
          </div>

          {/* Interactive Counter & Direct Action */}
          <div className="flex flex-col items-center justify-center shrink-0 pt-2 sm:pt-0">
            {dhikr.count === 1 ? (
              count >= 1 ? (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>تمت القراءة</span>
                  </span>
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-islamic-800 dark:hover:text-gold-400 pt-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة</span>
                  </button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={onIncrement}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-sm font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>تمت القراءة</span>
                </motion.button>
              )
            ) : (
              <>
                <DhikrCounter
                  current={count}
                  target={dhikr.count}
                  onIncrement={onIncrement}
                  onReset={onReset}
                  size="large"
                />
                <span className="text-[10px] text-stone-400 dark:text-night-muted mt-1.5 font-sans">
                  اضغط للتسبيح ({count}/{dhikr.count})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Gateway link */}
        <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex items-center justify-between text-xs">
          <span className="text-stone-400 dark:text-night-muted text-[11px]">
            أذكار الصباح والمساء متوفرة بالكامل
          </span>
          <button
            onClick={() => onNavigate('adhkar')}
            className="flex items-center gap-1 text-islamic-800 dark:text-gold-400 text-xs font-medium hover:text-islamic-900 dark:hover:underline"
          >
            <span>استعراض جميع الأذكار</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
