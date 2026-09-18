import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Dhikr, ReadingSettings } from '../../types';
import { DhikrCounter } from './DhikrCounter';

interface ReadingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Dhikr[];
  initialIndex?: number;
  counts: Record<string, number>;
  onIncrement: (id: string, target: number) => void;
  onReset: (id: string) => void;
  settings: ReadingSettings;
}

export const ReadingModeModal: React.FC<ReadingModeModalProps> = ({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  counts,
  onIncrement,
  onReset,
  settings,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const currentItem = items[currentIndex] || items[0];
  const totalItems = items.length;
  const currentCount = currentItem ? counts[currentItem.id] || 0 : 0;
  const isDone = currentItem ? currentCount >= currentItem.count : false;

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleNext();
      } else if (e.key === 'ArrowRight') {
        handlePrev();
      } else if (e.key === ' ' && currentItem && !isDone) {
        e.preventDefault();
        onIncrement(currentItem.id, currentItem.count);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, currentItem, isDone, onIncrement, onClose]);

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-sand-50 dark:bg-night-950 flex flex-col justify-between overflow-y-auto selection:bg-islamic-800 selection:text-sand-50">
        
        {/* Top Header Bar */}
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sand-100 dark:bg-night-850 text-gold-600 dark:text-gold-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-islamic-900 dark:text-night-text font-arabic-text">
              وضع القراءة الهادئ — {currentItem.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-sans text-stone-400 dark:text-night-muted font-medium">
              {currentIndex + 1} / {totalItems}
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 dark:text-night-muted hover:text-stone-900 dark:hover:text-night-text hover:bg-sand-200/80 dark:hover:bg-night-800 transition-colors"
              title="خروج من وضع القراءة (Esc)"
              aria-label="خروج"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar at the top */}
        <div className="w-full bg-sand-200 dark:bg-night-800 h-1">
          <div
            className="h-full bg-islamic-800 dark:bg-gold-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
          />
        </div>

        {/* Center Content Reading Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-5 sm:px-8 py-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6"
            >
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-sand-100 dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-xs font-semibold text-islamic-900 dark:text-night-text">
                {currentItem.title}
              </div>

              {/* Large Arabic Text */}
              <div className="py-2 cursor-pointer" onClick={() => !isDone && onIncrement(currentItem.id, currentItem.count)}>
                <p
                  className="font-arabic-text text-islamic-950 dark:text-night-text font-normal leading-[2.1] tracking-normal"
                  style={{ fontSize: `${Math.max(settings.arabicFontSize + 2, 28)}px` }}
                >
                  « {currentItem.arabic} »
                </p>
              </div>

              {/* Translation if enabled */}
              {settings.showTranslation && currentItem.translation && (
                <p className="text-sm sm:text-base text-stone-500 dark:text-night-muted font-serif italic max-w-lg mx-auto leading-relaxed">
                  "{currentItem.translation}"
                </p>
              )}

              {/* Virtue if present */}
              {currentItem.virtue && settings.showVirtue && (
                <div className="p-3 bg-gold-50/60 dark:bg-night-850 rounded-2xl border border-gold-200/50 dark:border-night-border text-xs text-stone-600 dark:text-night-muted max-w-md mx-auto leading-relaxed">
                  <span className="font-bold text-islamic-900 dark:text-gold-400 ml-1">الفضل:</span>
                  {currentItem.virtue}
                </div>
              )}

              {/* Central Counter Display */}
              <div className="pt-4 flex flex-col items-center justify-center">
                <DhikrCounter
                  current={currentCount}
                  target={currentItem.count}
                  onIncrement={() => onIncrement(currentItem.id, currentItem.count)}
                  onReset={() => onReset(currentItem.id)}
                  size="large"
                />
                <span className="text-xs text-stone-400 dark:text-night-muted mt-2 font-sans">
                  اضغط على الشاشة أو زر المسافة (Space) للعد
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Dock */}
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between border-t border-sand-200/80 dark:border-night-border">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-night-850 border border-sand-300 dark:border-night-border text-stone-700 dark:text-night-text disabled:opacity-30 hover:bg-sand-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <span className="text-[11px] text-stone-400 dark:text-night-muted">
            {(currentItem.source || currentItem.reference) ? `المصدر: ${currentItem.source || currentItem.reference}` : (currentItem.count === 1 ? 'مرة واحدة' : `${currentItem.count} مرات`)}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalItems - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 disabled:opacity-30 hover:bg-islamic-900 transition-colors"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </AnimatePresence>
  );
};
