import React from 'react';
import { BookOpen, Youtube, ExternalLink, Sparkles, Mic2 } from 'lucide-react';

export const QuranPlayer: React.FC = () => {
  const playlistUrl = "https://youtube.com/playlist?list=PL2hoGhz2jBSqpWTv6svf4e3HCtPMwqY0g";
  const embedUrl = "https://www.youtube.com/embed?listType=playlist&list=PL2hoGhz2jBSqpWTv6svf4e3HCtPMwqY0g";

  return (
    <section className="w-full mx-auto my-4 sm:my-6" aria-label="القرآن الكريم كاملًا">
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-200 text-right">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
                القرآن الكريم كاملًا
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-arabic-text">
              تلاوة القرآن الكريم كاملًا
            </p>
          </div>

          {/* Reader Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 dark:bg-night-800 text-gold-700 dark:text-gold-400 border border-gold-200/60 dark:border-night-border text-xs font-semibold w-fit">
            <Mic2 className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span className="font-arabic-text">بصوت الشيخ مشاري راشد العفاسي</span>
          </div>
        </div>

        {/* Embedded YouTube Playlist Player */}
        <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-sand-200 dark:bg-night-900 border border-sand-200/90 dark:border-night-border shadow-inner">
          <iframe
            src={embedUrl}
            title="تلاوة القرآن الكريم كاملاً بصوت الشيخ مشاري راشد العفاسي"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Bottom Info & YouTube Fallback Action */}
        <div className="mt-3.5 pt-3 border-t border-sand-100 dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400 dark:text-night-muted text-[11px] font-arabic-text">
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span>يمكنك اختيار أي سورة أو التنقل بين السور مباشرة من القائمة داخل المشغل</span>
          </div>

          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-islamic-800 dark:text-gold-400 hover:text-islamic-900 dark:hover:underline transition-colors"
          >
            <Youtube className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>فتح على YouTube</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
