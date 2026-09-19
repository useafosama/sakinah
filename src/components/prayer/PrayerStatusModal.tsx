import React from 'react';
import { X, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import { ObligatoryPrayerId, PrayerLogRecord } from '../../types/prayer';
import { PRAYER_NAMES_AR } from '../../services/theShiaPrayerService';

interface PrayerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerId: ObligatoryPrayerId | null;
  scheduledTime24: string;
  currentLog?: PrayerLogRecord;
  onSaveStatus: (status: 'prayed_on_time' | 'prayed_late' | 'missed') => void;
  onRemoveLog: () => void;
}

export const PrayerStatusModal: React.FC<PrayerStatusModalProps> = ({
  isOpen,
  onClose,
  prayerId,
  scheduledTime24,
  currentLog,
  onSaveStatus,
  onRemoveLog,
}) => {
  if (!isOpen || !prayerId) return null;

  const prayerName = PRAYER_NAMES_AR[prayerId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right font-arabic-text animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-sm bg-white dark:bg-night-850 rounded-3xl border border-sand-300 dark:border-night-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sand-200 dark:border-night-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              تسجيل صلاة {prayerName}
            </h3>
            <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-sans">
              وقت الصلاة المجدول: {scheduledTime24}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Prayed on time */}
          <button
            onClick={() => {
              onSaveStatus('prayed_on_time');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
              currentLog?.status === 'prayed_on_time'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                : 'bg-sand-50/60 dark:bg-night-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-sand-200 dark:border-night-border text-stone-800 dark:text-night-text'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs sm:text-sm font-bold">صليت في وقتها</div>
                <div className="text-[11px] text-stone-400 dark:text-night-muted">تم أداء الصلاة في أول/خلال وقتها</div>
              </div>
            </div>
            {currentLog?.status === 'prayed_on_time' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">الحالية</span>
            )}
          </button>

          {/* Prayed late */}
          <button
            onClick={() => {
              onSaveStatus('prayed_late');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
              currentLog?.status === 'prayed_late'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                : 'bg-sand-50/60 dark:bg-night-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border-sand-200 dark:border-night-border text-stone-800 dark:text-night-text'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs sm:text-sm font-bold">صليت متأخراً (قضاء / تأخير)</div>
                <div className="text-[11px] text-stone-400 dark:text-night-muted">تم أداء الصلاة بعد انقضاء وقتها</div>
              </div>
            </div>
            {currentLog?.status === 'prayed_late' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">الحالية</span>
            )}
          </button>

          {/* Missed */}
          <button
            onClick={() => {
              onSaveStatus('missed');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
              currentLog?.status === 'missed'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-200 font-bold shadow-xs'
                : 'bg-sand-50/60 dark:bg-night-900/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 border-sand-200 dark:border-night-border text-stone-800 dark:text-night-text'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                <XCircle className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs sm:text-sm font-bold">فاتتني</div>
                <div className="text-[11px] text-stone-400 dark:text-night-muted">لم أتمكن من أدائها</div>
              </div>
            </div>
            {currentLog?.status === 'missed' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">الحالية</span>
            )}
          </button>

          {/* Remove log if existing */}
          {currentLog && (
            <button
              onClick={() => {
                onRemoveLog();
                onClose();
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إلغاء تسجيل الصلاة (لم تسجل)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
