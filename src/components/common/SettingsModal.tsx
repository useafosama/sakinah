import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Type,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Sparkles,
  AlertTriangle,
  Trash2,
  Heart,
  Bell,
  Clock
} from 'lucide-react';
import { ReadingSettings } from '../../types';
import { CharitySettings, CharityReminderPreset } from '../../types/charity';
import { charityService, CHARITY_PRESET_TIMES } from '../../services/charityService';
import { prayerRepository } from '../../services/prayerRepository';
import { prayerNotificationService } from '../../services/prayerNotificationService';

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
  onRestartSetup?: () => void;
  onResetPreferences?: () => void;
  onFullAppReset?: () => void;
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
  onRestartSetup,
  onResetPreferences,
  onFullAppReset,
}) => {
  const [confirmResetSettings, setConfirmResetSettings] = useState(false);
  const [confirmFullReset, setConfirmFullReset] = useState(false);
  const [charitySettings, setCharitySettings] = useState<CharitySettings>(() => charityService.getSettings());
  const [notifPermission, setNotifPermission] = useState(() => prayerNotificationService.getStatus().permission);
  const pendingActionsCount = prayerRepository.getPendingActions().length;

  useEffect(() => {
    if (isOpen) {
      setCharitySettings(charityService.getSettings());
      setNotifPermission(prayerNotificationService.getStatus().permission);
    }
  }, [isOpen]);

  const handleUpdateCharity = (updates: Partial<CharitySettings>) => {
    const updated = charityService.saveSettings(updates);
    setCharitySettings(updated);
  };

  const handleRequestNotif = async () => {
    const perm = await prayerNotificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      handleUpdateCharity({ notificationsEnabled: true });
    }
  };

  const handleResetSettingsConfirm = () => {
    resetSettings();
    if (onResetPreferences) {
      onResetPreferences();
    }
    setConfirmResetSettings(false);
  };

  const handleFullResetConfirm = () => {
    if (onFullAppReset) {
      onFullAppReset();
    }
    setConfirmFullReset(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
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
            className="relative w-full max-w-md bg-sand-50 dark:bg-night-900 rounded-2xl sm:rounded-3xl border border-sand-300/80 dark:border-night-border p-5 sm:p-6 shadow-xl z-10 max-h-[85vh] overflow-y-auto font-arabic-text"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200/70 dark:border-night-border mb-4">
              <div className="flex items-center gap-2 text-islamic-900 dark:text-night-text">
                <SlidersHorizontal className="w-4 h-4 text-gold-500" />
                <h3 className="text-lg font-bold font-arabic-heading">إعدادات التطبيق والتخصيص</h3>
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
              {/* Quick Setup Wizard Card */}
              {onRestartSetup && (
                <div className="bg-gradient-to-r from-gold-50/90 to-sand-100/90 dark:from-night-850 dark:to-night-800 p-4 rounded-2xl border border-gold-200/80 dark:border-night-border shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-islamic-900 dark:text-night-text flex items-center gap-1.5 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                        الإعداد السريع للتطبيق (Setup Wizard)
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-night-muted">
                        أعد تخصيص اسمك، مدينتك، التنبيهات، وترتيب الصفحة الرئيسية
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onRestartSetup();
                      }}
                      className="px-3 py-1.5 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-bold hover:bg-islamic-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      إعادة الإعداد
                    </button>
                  </div>
                </div>
              )}

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

              {/* Charity & Good Deeds Settings */}
              <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 dark:text-night-text flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 fill-current" />
                    تذكير الخير والصدقة اليومية
                  </span>
                  <input
                    type="checkbox"
                    checked={charitySettings.enabled}
                    onChange={(e) => handleUpdateCharity({ enabled: e.target.checked })}
                    className="w-4 h-4 accent-islamic-800 dark:accent-gold-400 rounded cursor-pointer"
                  />
                </div>

                {charitySettings.enabled && (
                  <div className="space-y-3 pt-2 border-t border-sand-100 dark:border-night-border text-xs">
                    {/* Reminder Timing Preset */}
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 dark:text-night-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold-500" />
                        وقت التذكير اليومي:
                      </span>
                      <select
                        value={charitySettings.reminderPreset}
                        onChange={(e) => {
                          const preset = e.target.value as CharityReminderPreset;
                          const info = CHARITY_PRESET_TIMES[preset];
                          handleUpdateCharity({
                            reminderPreset: preset,
                            reminderTime: preset !== 'custom' ? info.time : charitySettings.reminderTime,
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
                      >
                        <option value="after_fajr">🌅 بعد الفجر (05:30)</option>
                        <option value="morning">☀️ صباحاً (09:00)</option>
                        <option value="after_asr">🌇 بعد العصر (16:30)</option>
                        <option value="evening">🌙 مساءً (20:30)</option>
                        <option value="custom">⏰ وقت مخصص...</option>
                      </select>
                    </div>

                    {charitySettings.reminderPreset === 'custom' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-stone-500 text-[11px]">حدد الوقت المخصص:</span>
                        <input
                          type="time"
                          value={charitySettings.reminderTime}
                          onChange={(e) => handleUpdateCharity({ reminderTime: e.target.value })}
                          className="px-2.5 py-1 rounded-lg bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Notification Permission State */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-stone-600 dark:text-night-muted flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-gold-500" />
                        إشعارات المتصفح:
                      </span>
                      {notifPermission === 'granted' ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          مفعلة ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestNotif}
                          className="px-2.5 py-1 bg-gold-100 hover:bg-gold-200 dark:bg-night-800 text-gold-800 dark:text-gold-400 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          تفعيل الإشعارات
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Controls Section */}
              <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border shadow-2xs space-y-3">
                <h4 className="text-xs font-semibold text-stone-700 dark:text-night-text">إعادة الضبط والاستعادة</h4>

                {/* Reset Settings to Default */}
                {!confirmResetSettings ? (
                  <button
                    onClick={() => setConfirmResetSettings(true)}
                    className="w-full py-2 px-3 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-night-800 dark:hover:bg-night-700 text-stone-700 dark:text-night-text text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                      استعادة الإعدادات الافتراضية
                    </span>
                    <span className="text-[10px] text-stone-400">يحافظ على سجل الصلوات</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      هل تريد استعادة جميع الإعدادات والخطوط وترتيب الرئيسية للوضع الافتراضي؟ (لن يتم حذف سجل الصلوات أو الأذكار).
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setConfirmResetSettings(false)}
                        className="px-2.5 py-1 text-xs text-stone-500"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleResetSettingsConfirm}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                      >
                        تأكيد الاستعادة
                      </button>
                    </div>
                  </div>
                )}

                {/* Full App Reset */}
                {!confirmFullReset ? (
                  <button
                    onClick={() => setConfirmFullReset(true)}
                    className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      إعادة ضبط التطبيق بالكامل (Full Reset)
                    </span>
                    <span className="text-[10px] text-red-500">مسح الذاكرة المحلية</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-900 dark:text-red-200">
                        تحذير: سيتم مسح جميع البيانات المحلية والذاكرة المؤقتة وسجل الصلوات غير المتزامن وإعادة التطبيق إلى أول تشغيل.
                      </p>
                    </div>
                    {pendingActionsCount > 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                        ⚠️ يوجد لديك {pendingActionsCount} عمليات معلقة لم تتم مزامنتها بعد!
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setConfirmFullReset(false)}
                        className="px-2.5 py-1 text-xs text-stone-500"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleFullResetConfirm}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                      >
                        نعم، مسح كل شيء
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close / Done Button */}
              <div className="flex justify-end items-center pt-1">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 text-xs font-bold hover:bg-islamic-900 transition-colors shadow-2xs cursor-pointer"
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

