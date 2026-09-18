import React from 'react';
import { Heart, BookCheck, ShieldCheck } from 'lucide-react';
import { PageType } from '../../types';

interface FooterProps {
  onNavigate?: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white/50 dark:bg-night-900/50 border-t border-sand-200/70 dark:border-night-border mt-10 sm:mt-14 pb-20 md:pb-8 pt-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Subtle Quran Quote */}
        <div className="mb-5">
          <p className="font-arabic-text text-base sm:text-lg text-islamic-900 dark:text-night-text font-bold max-w-xl mx-auto">
            « فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ »
          </p>
          <p className="text-[11px] text-stone-400 dark:text-night-muted mt-0.5 font-sans">
            سورة البقرة — الآية 152
          </p>
        </div>

        {/* Authenticity Guarantee Note with link to Sources */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 dark:text-night-muted mb-5 border-y border-sand-200/50 dark:border-night-border py-2.5 max-w-md mx-auto">
          <button
            onClick={() => onNavigate && onNavigate('sources')}
            className="flex items-center gap-1.5 text-[11px] hover:text-islamic-900 dark:hover:text-gold-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
            <span>نصوص موثقة من صحيح السنة</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('sources')}
            className="flex items-center gap-1.5 text-[11px] hover:text-islamic-900 dark:hover:text-gold-400 transition-colors"
          >
            <BookCheck className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span>حصن المسلم وصحيح البخاري ومسلم</span>
          </button>
        </div>

        {/* Copyright & Mission */}
        <div className="text-[11px] text-stone-400 dark:text-night-muted space-y-1">
          <p className="leading-relaxed">
            موقع <strong className="text-islamic-900 dark:text-night-text font-medium font-arabic-text">سَكِينَة</strong> — قراءة وتدبر الأذكار والأحاديث الصحيحة في أجواء هادئة.
          </p>
          <p className="flex items-center justify-center gap-1 text-[10px] text-stone-400 dark:text-night-muted pt-0.5">
            <span>صدقة جارية عن جميع المسلمين والمسلمات</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              خالصاً لوجه الله <Heart className="w-2.5 h-2.5 text-gold-500 fill-gold-500 inline" />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
