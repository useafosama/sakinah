import React from 'react';
import { PageType } from '../../types';

interface HomeBannerProps {
  onNavigate: (page: PageType) => void;
}

export const HomeBanner: React.FC<HomeBannerProps> = ({ onNavigate }) => {
  return (
    <div className="w-full mx-auto my-3 sm:my-4">
      <div
        onClick={() => onNavigate('adhkar')}
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-sand-300/70 dark:border-night-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group bg-white dark:bg-night-850"
        title="سكينة | أذكار وأحاديث صحيحة"
      >
        <img
          src="/banner.png"
          alt="سكينة - طريقك إلى طمأنينة أكبر"
          className="w-full h-auto object-cover block group-hover:scale-[1.01] transition-transform duration-500 ease-out"
          loading="eager"
        />
        
        {/* Subtle hover overlay hint */}
        <div className="absolute inset-0 bg-islamic-950/0 dark:bg-black/0 group-hover:bg-islamic-950/[0.03] dark:group-hover:bg-white/[0.02] transition-colors pointer-events-none" />
      </div>
    </div>
  );
};
