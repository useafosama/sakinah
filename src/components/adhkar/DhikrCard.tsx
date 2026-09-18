import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Copy, Check, Info, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
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

  return (
    <motion.div
      id={`dhikr-${dhikr.id}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={() => {
        if (!isCompleted) onIncrement();
      }}
      className={`relative w-full bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5.5 border transition-all duration-200 cursor-pointer select-none ${
        isCompleted
          ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs'
          : 'border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover hover:border-sand-400/80 dark:hover:border-night-muted/40'
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
        <div className="mt-3 pt-2.5 border-t border-sand-100 dark:border-night-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVirtueDetails(!showVirtueDetails);
            }}
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

      {/* Bottom Counter & Reference footer */}
      <div className="mt-4 pt-3 border-t border-sand-100 dark:border-night-border flex items-center justify-between gap-3">
        {(dhikr.source || dhikr.reference) ? (
          <div className="text-[11px] text-stone-400 dark:text-night-muted">
            <span>المصدر: </span>
            <span className="font-medium text-stone-500 dark:text-night-muted">{dhikr.source || dhikr.reference}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Counter Button */}
        <div className="mr-auto">
          <DhikrCounter
            current={count}
            target={dhikr.count}
            onIncrement={onIncrement}
            onReset={onReset}
            size="normal"
          />
        </div>
      </div>
    </motion.div>
  );
};
