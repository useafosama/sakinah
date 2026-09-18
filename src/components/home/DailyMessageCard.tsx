import React, { useState } from 'react';
import { Sparkles, Share2, Check, HeartHandshake, BookOpen, Quote } from 'lucide-react';
import { DailyMessage } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { useToast } from '../common/Toast';

interface DailyMessageCardProps {
  messages: DailyMessage[];
}

export const DailyMessageCard: React.FC<DailyMessageCardProps> = ({ messages }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Deterministic daily message selection based on day of the year
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const message = messages[dayOfYear % messages.length] || messages[0];

  // Formatted Arabic date (e.g. "18 سبتمبر 2026")
  const formattedDate = React.useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    } catch {
      return `${now.getDate()} / ${now.getMonth() + 1} / ${now.getFullYear()}`;
    }
  }, []);

  const handleShare = async () => {
    const typeLabel =
      message.type === 'quran'
        ? 'آية كريمة'
        : message.type === 'hadith'
        ? 'حديث نبوي شريف'
        : 'تذكير إيماني';

    const textToShare = `✨ رسالة اليوم — موقع سَكِينَة\n« ${message.text} »\n\n📌 ${typeLabel}: ${message.source}\n🔗 https://sakinah-3ps.pages.dev`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'رسالة اليوم — سكينة',
          text: textToShare,
          url: 'https://sakinah-3ps.pages.dev',
        });
        showToast('تمت المشاركة بنجاح');
        return;
      } catch {
        // User cancelled or fallback to clipboard
      }
    }

    const success = await copyToClipboard(textToShare);
    if (success) {
      setCopied(true);
      showToast('تم نسخ رسالة اليوم');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeBadge = () => {
    switch (message.type) {
      case 'quran':
        return {
          label: 'آية كريمة',
          bg: 'bg-islamic-50 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border-islamic-200/50 dark:border-night-border',
          icon: BookOpen,
        };
      case 'hadith':
        return {
          label: 'حديث شريف',
          bg: 'bg-gold-50 dark:bg-night-800 text-gold-700 dark:text-gold-400 border-gold-200/50 dark:border-night-border',
          icon: Quote,
        };
      default:
        return {
          label: 'تذكير وتأمل',
          bg: 'bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-text border-sand-200 dark:border-night-border',
          icon: HeartHandshake,
        };
    }
  };

  const typeMeta = getTypeBadge();
  const TypeIcon = typeMeta.icon;

  return (
    <section className="w-full mx-auto my-3 sm:my-4" aria-label="رسالة اليوم">
      <div className="relative overflow-hidden bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold-400/5 dark:bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-islamic-500/5 dark:bg-islamic-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          {/* Title & Date */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1.5 rounded-xl bg-gold-50 dark:bg-night-800 text-gold-600 dark:text-gold-400 border border-gold-200/40 dark:border-night-border">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
                  رسالة اليوم
                </h2>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-sand-100 dark:bg-night-800 text-stone-500 dark:text-night-muted font-sans border border-sand-200/60 dark:border-night-border">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-stone-500 dark:text-night-muted hover:text-islamic-900 dark:hover:text-gold-400 hover:bg-sand-100 dark:hover:bg-night-800 border border-sand-200/60 dark:border-night-border transition-colors"
            title="مشاركة رسالة اليوم"
            aria-label="مشاركة رسالة اليوم"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-islamic-800 dark:text-gold-400" />
                <span className="text-[11px] text-islamic-800 dark:text-gold-400 font-medium">تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span className="text-[11px] font-medium">مشاركة</span>
              </>
            )}
          </button>
        </div>

        {/* Message Arabic Text with Subtle Quotation Design */}
        <div className="my-3.5 sm:my-4 relative z-10">
          <p className="font-arabic-text text-base sm:text-lg md:text-xl text-stone-900 dark:text-night-text font-normal leading-[1.9] select-text">
            « {message.text} »
          </p>
        </div>

        {/* Footer Meta: Verified Source & Theme */}
        <div className="pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${typeMeta.bg}`}>
              <TypeIcon className="w-3 h-3" />
              <span>{typeMeta.label}</span>
            </span>

            {message.theme && (
              <span className="text-[11px] text-stone-400 dark:text-night-muted font-arabic-text">
                • {message.theme}
              </span>
            )}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-night-muted font-arabic-text font-medium">
            {message.source}
          </p>
        </div>
      </div>
    </section>
  );
};
