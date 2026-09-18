import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-islamic-800 selection:text-sand-50" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
          {/* Soft Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-islamic-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-sand-50 dark:bg-night-900 rounded-3xl border border-gold-200/70 dark:border-night-border p-6 sm:p-7 shadow-2xl z-10 text-center overflow-hidden"
          >
            {/* Top Ornamental Gold Highlight */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-24 bg-gold-400/10 dark:bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header Icon & Title */}
            <div className="flex flex-col items-center justify-center mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-night-850 border border-gold-200/80 dark:border-night-border flex items-center justify-center text-gold-600 dark:text-gold-400 shadow-2xs mb-3">
                <Heart className="w-5 h-5 fill-gold-500 text-gold-500" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 dark:bg-night-850 border border-gold-200/70 dark:border-night-border text-xs font-semibold text-islamic-900 dark:text-gold-400 mb-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                <h2 id="welcome-modal-title" className="font-arabic-heading font-bold text-sm">
                  صدقة جارية 🤍
                </h2>
              </div>
            </div>

            {/* Dua & Dedication Content */}
            <div className="relative z-10 my-4 bg-white/70 dark:bg-night-850/70 rounded-2xl p-4 sm:p-5 border border-sand-200/80 dark:border-night-border">
              <div className="space-y-3 font-arabic-text text-sm sm:text-base text-stone-800 dark:text-night-text leading-[2.1] font-normal text-center">
                <p>
                  هذا الموقع نحتسبه صدقةً جارية، ونسأل الله أن ينفع به.
                </p>

                <p className="font-medium text-islamic-900 dark:text-gold-300">
                  عن أبي وأمي وأجدادي، وعن جميع المسلمين والمسلمات.
                </p>

                <p className="text-stone-700 dark:text-night-muted">
                  اللهم تقبّل هذا العمل، وانفع به، واغفر لنا ولهم، وارحمهم برحمتك.
                </p>

                <p className="font-bold text-islamic-950 dark:text-night-text pt-1">
                  اللهم آمين.
                </p>
              </div>
            </div>

            {/* Enter Button */}
            <div className="pt-2 relative z-10">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-400 dark:hover:bg-gold-300 text-sand-50 dark:text-islamic-950 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer font-arabic-text"
              >
                <span>دخول إلى سكينة</span>
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
