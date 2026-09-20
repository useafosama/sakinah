import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Coins,
  Utensils,
  Droplet,
  HandHeart,
  Heart,
  Cat,
  Users
} from 'lucide-react';
import { GoodDeedType } from '../../types/charity';
import { GOOD_DEED_OPTIONS } from '../../services/charityService';
import { useToast } from '../common/Toast';

interface LogGoodDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogDeed: (
    type: GoodDeedType,
    options?: {
      amount?: number | null;
      currency?: string;
      isSecret?: boolean;
      note?: string;
      title?: string;
    }
  ) => void;
}

export const LogGoodDeedModal: React.FC<LogGoodDeedModalProps> = ({
  isOpen,
  onClose,
  onLogDeed,
}) => {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<GoodDeedType>('charity');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [isSecret, setIsSecret] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setSelectedType('charity');
    setShowAmountInput(false);
    setAmount('');
    setIsSecret(false);
    setNote('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = showAmountInput && amount.trim() ? parseFloat(amount.trim()) : null;

    onLogDeed(selectedType, {
      amount: parsedAmount && !isNaN(parsedAmount) ? parsedAmount : null,
      isSecret,
      note: note.trim() || undefined,
    });

    setIsSubmitted(true);
    showToast('تم تسجيل عمل الخير بنجاح 🤍');

    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins':
        return <Coins className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5" />;
      case 'HandHeart':
        return <HandHeart className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'Cat':
        return <Cat className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-islamic-950/50 dark:bg-black/80 backdrop-blur-xs"
        />

        {/* Modal / Bottom Sheet Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-sand-50 dark:bg-night-900 rounded-t-3xl sm:rounded-3xl border border-sand-300/80 dark:border-night-border p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col font-arabic-text overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-sand-200/70 dark:border-night-border mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading leading-tight">
                  تسجيل عمل الخير والصدقة
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-200/70 dark:hover:bg-night-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form / Content */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-0.5 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-night-text block mb-2">
                  ما نوع الخير الذي فعلته اليوم؟
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GOOD_DEED_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(opt.id);
                          if (opt.id !== 'charity') {
                            setShowAmountInput(false);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-islamic-800 dark:bg-gold-500 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-500 shadow-sm'
                            : 'bg-white dark:bg-night-850 hover:bg-sand-100/60 dark:hover:bg-night-800 border-sand-200/80 dark:border-night-border text-stone-700 dark:text-night-text'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-lg">{opt.emoji}</span>
                          <span className={isSelected ? 'text-sand-100 dark:text-islamic-900' : 'text-gold-600 dark:text-gold-400'}>
                            {renderIcon(opt.iconName)}
                          </span>
                        </div>
                        <span className="text-xs font-bold leading-tight block">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Amount Section for Financial Charity */}
              {selectedType === 'charity' && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-night-text">
                      هل تريد تسجيل المبلغ؟
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowAmountInput(false)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          !showAmountInput
                            ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                            : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
                        }`}
                      >
                        لا، فقط سجّلها
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAmountInput(true)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          showAmountInput
                            ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                            : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
                        }`}
                      >
                        إضافة المبلغ
                      </button>
                    </div>
                  </div>

                  {showAmountInput && (
                    <div className="pt-1">
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="المبلغ (اختياري)..."
                          className="w-full px-4 py-2.5 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-sm font-bold text-stone-800 dark:text-night-text placeholder:text-stone-400 focus:outline-none focus:border-gold-500"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">
                          ج.م
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 dark:text-night-muted mt-1">
                        المبلغ اختياري ويبقى خاصاً بك 100% داخل جهازك دون مشاركته.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Secret Deed Toggle & Note */}
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-gold-100 dark:bg-night-800 text-gold-600 dark:text-gold-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-islamic-950 dark:text-night-text block">
                        صدقة خفية (عمل في السر)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-night-muted">
                        عمل خير خالص لم يره أحد سواك
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSecret}
                    onChange={(e) => setIsSecret(e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>

                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ملاحظة أو تذكرة لنفسك (اختياري)..."
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-xs text-stone-800 dark:text-night-text placeholder:text-stone-400 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>تسجيل العمل واحتساب الأجر</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Screen */
            <div className="text-center py-8 space-y-3">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-300/40"
              >
                <CheckCircle2 className="w-9 h-9" />
              </motion.div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                  تقبّل الله منك 🤍
                </h4>
                <p className="text-xs text-stone-600 dark:text-night-muted">
                  استمر في الخير، ولو بالقليل.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
