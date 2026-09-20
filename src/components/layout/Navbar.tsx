import React from 'react';
import { Sparkles, Search, SlidersHorizontal, Compass, Moon, Sun, BookOpenText, Smartphone } from 'lucide-react';
import { PageType } from '../../types';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  favoritesCount: number;
  isDark: boolean;
  isInstallable: boolean;
  onInstall: () => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenTasbeeh: () => void;
  onOpenReadingMode: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  favoritesCount,
  isDark,
  isInstallable,
  onInstall,
  onToggleTheme,
  onOpenSearch,
  onOpenTasbeeh,
  onOpenReadingMode,
  onOpenSettings,
}) => {
  const navItems: { id: PageType; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'prayer-times', label: 'مواقيت الصلاة' },
    { id: 'qibla', label: 'القبلة' },
    { id: 'charity', label: 'الخير والصدقة' },
    { id: 'adhkar', label: 'الأذكار' },
    { id: 'hadith', label: 'الأحاديث' },
    { id: 'favorites', label: 'المفضلة' },
    { id: 'sources', label: 'المصادر' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-sand-50/90 dark:bg-night-900/90 backdrop-blur-md border-b border-sand-200/70 dark:border-night-border transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group text-right focus:outline-none"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-islamic-800 dark:bg-gold-400 flex items-center justify-center text-gold-400 dark:text-islamic-950 shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg sm:text-xl text-islamic-900 dark:text-night-text font-arabic-text tracking-tight">
              سَكِينَة
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-gold-600 dark:text-gold-400 font-sans opacity-80 hidden sm:inline">
              SAKINAH
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-night-850/80 p-1 rounded-full border border-sand-200/70 dark:border-night-border shadow-2xs">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-2xs'
                    : 'text-stone-600 dark:text-night-muted hover:text-islamic-900 dark:hover:text-night-text hover:bg-sand-100/60 dark:hover:bg-night-800'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'favorites' && favoritesCount > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-sans ${
                      isActive
                        ? 'bg-gold-400 dark:bg-islamic-900 text-islamic-950 dark:text-gold-300'
                        : 'bg-sand-200 dark:bg-night-800 text-stone-700 dark:text-night-text'
                    }`}
                  >
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Install PWA Button if available */}
          {isInstallable && (
            <button
              onClick={onInstall}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-gold-50 dark:bg-night-800 hover:bg-gold-100 dark:hover:bg-night-700 border border-gold-200/80 dark:border-gold-900/50 text-gold-800 dark:text-gold-300 transition-colors flex items-center gap-1 text-xs font-semibold shadow-2xs"
              title="أضف سكينة إلى الشاشة الرئيسية"
            >
              <Smartphone className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span className="hidden lg:inline text-[11px]">تثبيت التطبيق</span>
            </button>
          )}

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white dark:bg-night-850 hover:bg-sand-100/80 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-stone-600 dark:text-night-muted hover:text-islamic-900 dark:hover:text-night-text transition-colors flex items-center gap-1.5 shadow-2xs text-xs"
            title="بحث في الأذكار والأحاديث (⌘K)"
            aria-label="بحث"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden lg:inline text-stone-400 dark:text-night-muted text-[11px]">بحث</span>
          </button>

          {/* Distraction-free Reading Mode Quick Launch */}
          <button
            onClick={onOpenReadingMode}
            className="p-1.5 rounded-full bg-white dark:bg-night-850 hover:bg-sand-100/80 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-stone-600 dark:text-night-muted hover:text-islamic-900 dark:hover:text-night-text transition-colors shadow-2xs"
            title="وضع القراءة الهادئ"
            aria-label="وضع القراءة"
          >
            <BookOpenText className="w-3.5 h-3.5" />
          </button>

          {/* Electronic Tasbeeh Quick Launch */}
          <button
            onClick={onOpenTasbeeh}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-sand-100/90 dark:bg-night-800 hover:bg-sand-200/80 dark:hover:bg-night-700 border border-sand-200 dark:border-night-border text-islamic-900 dark:text-night-text transition-colors flex items-center gap-1 text-xs font-medium"
            title="السبحة الإلكترونية"
          >
            <Compass className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span className="hidden sm:inline text-[11px]">السبحة</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-full bg-white dark:bg-night-850 hover:bg-sand-100/80 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-stone-600 dark:text-gold-400 hover:text-islamic-900 dark:hover:text-gold-300 transition-colors shadow-2xs"
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Reading Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full bg-white dark:bg-night-850 hover:bg-sand-100/80 dark:hover:bg-night-800 border border-sand-200/80 dark:border-night-border text-stone-600 dark:text-night-muted hover:text-islamic-900 dark:hover:text-night-text transition-colors shadow-2xs"
            title="إعدادات القراءة والخط"
            aria-label="إعدادات"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
