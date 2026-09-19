import React from 'react';
import { Home, Sparkles, BookOpen, Bookmark, Clock } from 'lucide-react';
import { PageType } from '../../types';

interface MobileNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  favoritesCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  favoritesCount,
}) => {
  const items: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-4.5 h-4.5" /> },
    { id: 'prayer-times', label: 'المواقيت', icon: <Clock className="w-4.5 h-4.5" /> },
    { id: 'adhkar', label: 'الأذكار', icon: <Sparkles className="w-4.5 h-4.5" /> },
    { id: 'hadith', label: 'الأحاديث', icon: <BookOpen className="w-4.5 h-4.5" /> },
    { id: 'favorites', label: 'المفضلة', icon: <Bookmark className="w-4.5 h-4.5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sand-50/95 dark:bg-night-900/95 backdrop-blur-md border-t border-sand-200/70 dark:border-night-border px-1 py-1 shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-islamic-900 dark:text-gold-400 font-semibold'
                  : 'text-stone-500 dark:text-night-muted hover:text-stone-700 dark:hover:text-night-text'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-islamic-100 dark:bg-night-800 text-islamic-900 dark:text-gold-400' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.id === 'favorites' && favoritesCount > 0 && (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-gold-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
