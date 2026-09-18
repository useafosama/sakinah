import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { Dhikr, Hadith } from '../../types';
import { formatDhikrForSharing, formatHadithForSharing, copyToClipboard } from '../../utils/clipboard';
import { useToast } from './Toast';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Dhikr | Hadith | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!item) return null;

  const isDhikr = 'count' in item;
  const dhikr = isDhikr ? (item as Dhikr) : null;
  const hadith = !isDhikr ? (item as Hadith) : null;

  const handleCopyText = async () => {
    let formatted = '';
    if (dhikr) {
      formatted = formatDhikrForSharing(dhikr);
    } else if (hadith) {
      formatted = formatHadithForSharing(hadith);
    }
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      showToast('تم نسخ النص بنجاح');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-islamic-950/60 dark:bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-sand-50 dark:bg-night-900 rounded-3xl border border-sand-300 dark:border-night-border p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 dark:border-night-border mb-4">
              <div className="flex items-center gap-2 text-islamic-900 dark:text-night-text">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <h3 className="text-base font-bold font-arabic-text">بطاقة المشاركة الأنيقة</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-200 dark:hover:bg-night-800 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Share Card Box */}
            <div
              id="share-card-preview"
              className="relative bg-white dark:bg-night-850 rounded-2xl p-6 sm:p-7 border border-gold-200 dark:border-gold-900/60 shadow-card text-center my-3 overflow-hidden"
            >
              {/* Gold Ornamental Top Bar */}
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

              {/* Watermark / Header Icon */}
              <div className="flex items-center justify-center gap-1.5 mb-4 text-xs font-semibold text-gold-600 dark:text-gold-400">
                {isDhikr ? <Sparkles className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                <span className="font-arabic-text">
                  {dhikr ? dhikr.title : hadith?.topicAr}
                </span>
              </div>

              {/* Narrator if Hadith */}
              {hadith && (
                <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-2 font-arabic-text">
                  {hadith.narratorAr}
                </p>
              )}

              {/* Arabic Text */}
              <p className="font-arabic-text text-lg sm:text-xl md:text-2xl text-islamic-950 dark:text-night-text font-normal leading-[1.95] tracking-normal mb-3 px-2">
                « {item.arabic} »
              </p>

              {/* English Translation */}
              {((dhikr && dhikr.translation) || (hadith && hadith.english)) && (
                <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted font-serif italic max-w-md mx-auto leading-relaxed pt-2 border-t border-sand-100 dark:border-night-border mb-3">
                  "{dhikr ? dhikr.translation : hadith?.english}"
                </p>
              )}

              {/* Footer Citation & Sakinah Watermark */}
              <div className="pt-3 border-t border-sand-100 dark:border-night-border flex items-center justify-between text-[11px] text-stone-400 dark:text-night-muted">
                <span className="font-medium text-stone-500 dark:text-night-muted">
                  {dhikr ? dhikr.reference : `${hadith?.book} (${hadith?.number})`}
                </span>
                <span className="font-bold text-islamic-900 dark:text-gold-400 font-arabic-text">
                  سَكِينَة | Sakinah
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <span className="text-xs text-stone-400 dark:text-night-muted">
                جاهز للمشاركة مع الأهل والأصدقاء
              </span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص المنسق'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
