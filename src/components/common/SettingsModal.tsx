import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Smartphone, Type, SlidersHorizontal, RotateCcw, Download } from 'lucide-react';
import { ReadingSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  isInstallable?: boolean;
  onInstall?: () => void;
  updateSetting: <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  isInstallable,
  onInstall,
  updateSetting,
  increaseFontSize,
  decreaseFontSize,
  resetSettings,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-islamic-950/40 dark:bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-md bg-sand-50 dark:bg-night-900 rounded-2xl sm:rounded-3xl border border-sand-300/80 dark:border-night-border p-5 sm:p-6 shadow-xl z-10 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200/70 dark:border-night-border mb-4">
              <div className="flex items-center gap-2 text-islamic-900 dark:text-night-text">
                <SlidersHorizontal className="w-4 h-4 text-gold-500" />
                <h3 className="text-lg font-bold">إعدادات القراءة والتخصيص</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-200/80 dark:hover:bg-night-800 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Install PWA App Card */}
              {isInstallable && onInstall && (
                <div className="bg-gradient-to-r from-gold-50 to-sand-100 dark:from-night-850 dark:to-night-800 p-4 rounded-2xl border border-gold-200/80 dark:border-night-border shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-islamic-900 dark:text-night-text flex items-center gap-1.5 mb-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                        أضف سكينة إلى الشاشة الرئيسية
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-night-muted">
                        لتصفح أسرع وبدون إنترنت كتطبيق مستقل
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onInstall();
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-bold hover:bg-islamic-900 transition-colors shadow-2xs shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>تثبيت</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Font Size Adjuster */}
              <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-stone-700 dark:text-night-text flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
                    حجم الخط العربي
                  </span>
                  <span className="text-[11px] font-semibold text-islamic-800 dark:text-gold-400 px-2 py-0.5 bg-sand-100 dark:bg-night-800 rounded-full">
                    {settings.arabicFontSize}px
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={decreaseFontSize}
                    disabled={settings.arabicFontSize <= 22}
                    className="flex-1 py-1.5 rounded-xl bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-700 dark:text-night-text font-semibold text-xs transition-colors disabled:opacity-40"
                  >
                    أصغر (A-)
                  </button>
                  <button
                    onClick={increaseFontSize}
                    disabled={settings.arabicFontSize >= 38}
                    className="flex-1 py-1.5 rounded-xl bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-700 dark:text-night-text font-semibold text-xs transition-colors disabled:opacity-40"
                  >
                    أكبر (A+)
                  </button>
                </div>

                {/* Live Font Preview */}
                <div className="mt-3 p-2.5 bg-sand-50 dark:bg-night-900 rounded-xl border border-sand-200/60 dark:border-night-border text-center">
                  <p
                    className="font-arabic-text text-islamic-900 dark:text-night-text leading-relaxed"
                    style={{ fontSize: `${settings.arabicFontSize}px` }}
                  >
                    سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
                  </p>
                </div>
              </div>

              {/* Display Options */}
              <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border shadow-2xs space-y-3">
                <h4 className="text-xs font-semibold text-stone-700 dark:text-night-text">خيارات العرض</h4>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-stone-600 dark:text-night-muted">عرض الترجمة الإنجليزية (Translation)</span>
                  <input
                    type="checkbox"
                    checked={settings.showTranslation}
                    onChange={(e) => updateSetting('showTranslation', e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-stone-600 dark:text-night-muted">عرض النطق اللاتيني (Transliteration)</span>
                  <input
                    type="checkbox"
                    checked={settings.showTransliteration}
                    onChange={(e) => updateSetting('showTransliteration', e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-stone-600 dark:text-night-muted">عرض فضل الذكر والأثر</span>
                  <input
                    type="checkbox"
                    checked={settings.showVirtue}
                    onChange={(e) => updateSetting('showVirtue', e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Sound & Haptic Feedback */}
              <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border shadow-2xs space-y-3">
                <h4 className="text-xs font-semibold text-stone-700 dark:text-night-text">الصوت والاهتزاز</h4>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-stone-600 dark:text-night-muted flex items-center gap-1.5">
                    {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                    صوت النقر الهادئ عند التسبيح
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-stone-600 dark:text-night-muted flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" />
                    الاهتزاز اللمسي على الهاتف
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Reset to Default */}
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-night-muted hover:text-islamic-800 dark:hover:text-gold-400 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  استعادة الافتراضي
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-medium hover:bg-islamic-900 transition-colors shadow-2xs"
                >
                  تم وحفظ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
