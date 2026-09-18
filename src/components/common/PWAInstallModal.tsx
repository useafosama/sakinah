import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Smartphone, Sparkles, Check } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
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
            className="fixed inset-0 bg-islamic-950/60 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-sand-50 dark:bg-night-900 rounded-3xl border border-sand-300/80 dark:border-night-border p-6 shadow-2xl z-10 text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 dark:border-night-border mb-4">
              <div className="flex items-center gap-2 text-islamic-900 dark:text-night-text">
                <div className="w-8 h-8 rounded-xl bg-islamic-800 dark:bg-gold-400 flex items-center justify-center text-gold-400 dark:text-islamic-950">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-arabic-text">أضف سكينة إلى الشاشة الرئيسية</h3>
                  <p className="text-[11px] text-stone-400 dark:text-night-muted">تطبيق سريع وبدون إنترنت</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-200 dark:hover:bg-night-800 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3.5 my-4">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-night-850 rounded-2xl border border-sand-200/80 dark:border-night-border">
                <div className="p-2 rounded-xl bg-sand-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-islamic-900 dark:text-night-text mb-0.5">
                    1. اضغط على زر المشاركة (Share)
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-night-muted leading-relaxed">
                    ستجده في شريط أدوات Safari أسفل الشاشة (أو بأعلى المتصفح على iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-night-850 rounded-2xl border border-sand-200/80 dark:border-night-border">
                <div className="p-2 rounded-xl bg-sand-100 dark:bg-night-800 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-islamic-900 dark:text-night-text mb-0.5">
                    2. اختر «إضافة إلى الشاشة الرئيسية»
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-night-muted leading-relaxed">
                    مرر القائمة للأسفل واضغط على خيار (Add to Home Screen).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-night-850 rounded-2xl border border-sand-200/80 dark:border-night-border">
                <div className="p-2 rounded-xl bg-sand-100 dark:bg-night-800 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-islamic-900 dark:text-night-text mb-0.5">
                    3. اضغط «إضافة» (Add)
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-night-muted leading-relaxed">
                    ستظهر أيقونة تطبيق سكينة على شاشتك الرئيسية لفتحها وتصفحها كأي تطبيق بدون إنترنت.
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-gold-50/60 dark:bg-night-800/80 rounded-2xl border border-gold-200/50 dark:border-gold-900/40 text-[11px] text-gold-800 dark:text-gold-300 leading-relaxed mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
              <span>على أجهزة iPhone وiPad، تتم الإضافة من خلال قائمة المشاركة.</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-semibold hover:bg-islamic-900 dark:hover:bg-gold-300 transition-colors shadow-2xs"
            >
              فهمت ذلك
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
