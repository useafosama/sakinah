import React from 'react';
import { Youtube, ExternalLink, Play, Sparkles } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  tag: string;
}

const suggestedVideos: VideoItem[] = [
  {
    id: 'lxAfNwYriME',
    title: 'ماذا تفعل الذنوب بالإنسان؟ — التعليق على كتاب الداء والدواء (1)',
    subtitle: 'مجالس الشباب',
    tag: 'تزكية وتدبر',
    url: 'https://youtu.be/lxAfNwYriME?si=Y5PIaLwTbdQko5oG',
  },
  {
    id: '42CemrBCHzw',
    title: 'المعصية ليست لحظة وتنتهي — التعليق على كتاب الداء والدواء (2)',
    subtitle: 'مجالس الشباب',
    tag: 'تزكية وتدبر',
    url: 'https://youtu.be/42CemrBCHzw?si=AgXkPhzl0RcvxGRM',
  },
  {
    id: '9EJj-SlVGBY',
    title: 'سورة النمل — التلاوة الشهيرة الخاشعة',
    subtitle: 'الشيخ محمد عمران',
    tag: 'تلاوة قرآنية',
    url: 'https://youtu.be/9EJj-SlVGBY?si=zS3gMeuQUvIQFf6M',
  },
  {
    id: 'o7cyyODw63A',
    title: 'أذكار الصباح كاملة بصوت خاشع ومبارك',
    subtitle: 'الشيخ ياسر الدوسري',
    tag: 'أذكار وورد',
    url: 'https://youtu.be/o7cyyODw63A?si=ToPWBYhQop3-XgR1',
  },
];

export const SuggestedVideos: React.FC = () => {
  return (
    <section className="w-full mx-auto my-4 sm:my-6" aria-label="فيديوهات مقترحة">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-red-50 dark:bg-night-800 text-red-600 dark:text-red-400">
              <Youtube className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-heading">
              فيديوهات مقترحة
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5 font-arabic-text">
            محتوى مختار للذكر والتدبر والاستفادة
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 dark:text-night-muted">
          <Sparkles className="w-3 h-3 text-gold-500" />
          <span>محتوى مرئي نافع</span>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {suggestedVideos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-night-850 rounded-2xl border border-sand-300/70 dark:border-night-border p-3 sm:p-3.5 shadow-card hover:shadow-card-hover hover:border-gold-300 dark:hover:border-gold-500/40 transition-all duration-200 text-right focus:outline-none focus:ring-2 focus:ring-islamic-700/20"
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-sand-200 dark:bg-night-800 mb-3">
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Tag Badge */}
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white/90 font-medium">
                {video.tag}
              </span>

              {/* Centered / Hover Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-200">
                  <Play className="w-4 h-4 fill-white mr-0.5" />
                </span>
              </div>
            </div>

            {/* Video Meta */}
            <div className="space-y-1.5">
              <h3 className="font-arabic-text text-sm sm:text-[15px] font-medium text-stone-900 dark:text-night-text line-clamp-2 leading-relaxed group-hover:text-islamic-900 dark:group-hover:text-gold-300 transition-colors">
                {video.title}
              </h3>

              <div className="flex items-center justify-between pt-1 border-t border-sand-100 dark:border-night-border text-xs">
                <span className="text-stone-400 dark:text-night-muted text-[11px] font-arabic-text">
                  {video.subtitle}
                </span>

                <span className="flex items-center gap-1 text-[11px] font-medium text-islamic-800 dark:text-gold-400 group-hover:underline">
                  <Youtube className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>مشاهدة على YouTube</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
