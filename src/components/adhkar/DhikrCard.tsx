import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Copy, Check, Info, ChevronDown, ChevronUp, Share2, RotateCcw } from 'lucide-react';
import { Dhikr, ReadingSettings } from '../../types';
import { DhikrCounter } from '../common/DhikrCounter';
import { formatDhikrForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface DhikrCardProps {
  dhikr: Dhikr;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare?: (dhikr: Dhikr) => void;
  settings: ReadingSettings;
}

export const DhikrCard: React.FC<DhikrCardProps> = ({
  dhikr,
  count,
  onIncrement,
  onReset,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [showVirtueDetails, setShowVirtueDetails] = useState(false);
  const { showToast } = useToast();

  const isCompleted = count >= dhikr.count;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = formatDhikrForSharing(dhikr);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      showToast('تم نسخ الذكر');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenShare) {
      onOpenShare(dhikr);
    }
  };

  const handleCardClick = () => {
    if (!isCompleted) {
      onIncrement();
    }
  };

  return (
    <motion.div
      id={`dhikr-${dhikr.id}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={handleCardClick}
      className={`relative w-full bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5.5 border transition-all duration-200 select-none ${
        isCompleted
          ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/25 dark:bg-emerald-950/20 shadow-2xs'
          : 'border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover hover:border-sand-400/80 dark:hover:border-night-muted/40 cursor-pointer'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-sand-100 dark:border-night-border mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-islamic-900 dark:text-gold-400 bg-sand-100/80 dark:bg-night-800 px-2.5 py-0.5 rounded-full">
            {dhikr.title}
          </span>
          <span className="text-[11px] font-sans text-stone-400 dark:text-night-muted">
            {dhikr.count === 1 ? 'مرة واحدة' : `${dhikr.count} مرات`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
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
            aria-label="نسخ الذكر"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleToggleFavorite}
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

      {/* Main Arabic Text */}
      <div className="text-right py-1">
        <p
          className="font-arabic-text text-islamic-950 dark:text-night-text font-normal leading-[1.85] tracking-normal transition-all duration-150"
          style={{ fontSize: `${settings.arabicFontSize}px` }}
        >
          {dhikr.arabic}
        </p>
      </div>

      {/* Transliteration if enabled */}
      {settings.showTransliteration && dhikr.transliteration && (
        <p className="text-[11px] text-stone-400 dark:text-night-muted font-serif italic mt-2 text-left dir-ltr leading-relaxed bg-sand-50 dark:bg-night-900 p-2 rounded-lg border border-sand-200/50 dark:border-night-border">
          {dhikr.transliteration}
        </p>
      )}

      {/* Translation if enabled */}
      {settings.showTranslation && dhikr.translation && (
        <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted leading-relaxed mt-2.5 pt-2 border-t border-sand-100 dark:border-night-border text-right">
          {dhikr.translation}
        </p>
      )}

      {/* Virtue / Reward toggle & view */}
      {dhikr.virtue && settings.showVirtue && (
        <div className="mt-3 pt-2.5 border-t border-sand-100 dark:border-night-border" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowVirtueDetails(!showVirtueDetails)}
            className="flex items-center gap-1 text-[11px] text-gold-600 dark:text-gold-400 hover:text-gold-700 font-medium focus:outline-none"
          >
            <Info className="w-3 h-3" />
            <span>فضل هذا الذكر</span>
            {showVirtueDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showVirtueDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-2.5 bg-gold-50/50 dark:bg-night-900/60 rounded-xl border border-gold-200/50 dark:border-night-border text-xs text-stone-600 dark:text-night-muted leading-relaxed text-right">
                  {dhikr.virtue}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Counter & Clear Action Bar */}
      <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Source / Reference citation */}
        {(dhikr.source || dhikr.reference) ? (
          <div className="text-[11px] text-stone-400 dark:text-night-muted">
            <span>المصدر: </span>
            <span className="font-medium text-stone-500 dark:text-night-muted">{dhikr.source || dhikr.reference}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Action Button & Counter Area */}
        <div className="mr-auto flex items-center gap-2">
          {dhikr.count === 1 ? (
            /* Single Count: Clear Big "تمت القراءة" Button */
            isCompleted ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>تمت القراءة</span>
                </span>
                <button
                  onClick={onReset}
                  className="p-1.5 rounded-lg text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
                  title="إعادة القراءة"
                  aria-label="إعادة القراءة"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onIncrement}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-all shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تمت القراءة</span>
              </motion.button>
            )
          ) : (
            /* Multi-Count: Ergonomic Tap Button + Circular Counter */
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onIncrement}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-all shadow-2xs cursor-pointer"
                >
                  <span>تسبيح</span>
                  <span className="text-[11px] opacity-90 font-sans">
                    ({count}/{dhikr.count})
                  </span>
                </motion.button>
              )}

              <DhikrCounter
                current={count}
                target={dhikr.count}
                onIncrement={onIncrement}
                onReset={onReset}
                size="normal"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
