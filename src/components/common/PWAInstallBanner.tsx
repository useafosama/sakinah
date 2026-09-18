import React from 'react';
import { Smartphone, Download } from 'lucide-react';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  onInstall: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  onInstall,
}) => {
  if (!isInstallable) return null;

  return (
    <div className="w-full mx-auto my-3 sm:my-4">
      <div className="relative bg-gradient-to-r from-islamic-900 to-islamic-800 dark:from-night-850 dark:to-night-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-sand-50 border border-islamic-700/60 dark:border-night-border shadow-card overflow-hidden">
        
        {/* Subtle decorative gold light */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3.5 text-right">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-night-900 border border-white/15 dark:border-night-border flex items-center justify-center text-gold-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold font-arabic-text text-sand-50">
                  أضف سكينة إلى الشاشة الرئيسية
                </h3>
                <span className="text-[9px] font-semibold bg-gold-400/20 text-gold-300 border border-gold-400/30 px-1.5 py-0.2 rounded-full font-sans">
                  PWA
                </span>
              </div>
              <p className="text-xs text-sand-200/80 dark:text-night-muted mt-0.5">
                تجربة تطبيق متكاملة تفتح بسرعة وتعمل بدون إنترنت
              </p>
            </div>
          </div>

          <button
            onClick={onInstall}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gold-400 hover:bg-gold-300 text-islamic-950 text-xs font-bold transition-all shadow-subtle shrink-0 w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت التطبيق الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
