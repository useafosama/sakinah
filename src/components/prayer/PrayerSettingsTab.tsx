import React from 'react';
import {
  Bell,
  MapPin,
  Compass,
  AlertCircle,
  Navigation,
  Loader2
} from 'lucide-react';
import { PrayerUserSettings } from '../../types/prayer';
import { NotificationStatus } from '../../services/prayerNotificationService';

interface PrayerSettingsTabProps {
  settings: PrayerUserSettings;
  notificationStatus: NotificationStatus;
  geoLoading: boolean;
  onOpenCityModal: () => void;
  onRequestLocation: () => void;
  onUpdateSettings: (newSettings: Partial<PrayerUserSettings>) => void;
  onRequestNotificationPermission: () => void;
}

export const PrayerSettingsTab: React.FC<PrayerSettingsTabProps> = ({
  settings,
  notificationStatus,
  geoLoading,
  onOpenCityModal,
  onRequestLocation,
  onUpdateSettings,
  onRequestNotificationPermission,
}) => {
  const { notifications, location } = settings;

  const handleToggleMasterNotification = async (enabled: boolean) => {
    if (enabled && notificationStatus.permission !== 'granted') {
      await onRequestNotificationPermission();
      return;
    }
    onUpdateSettings({
      notifications: {
        ...notifications,
        enabled,
      },
    });
  };

  const handleTogglePrayer = (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', value: boolean) => {
    onUpdateSettings({
      notifications: {
        ...notifications,
        [prayer]: value,
      },
    });
  };

  const handleChangeBeforeMinutes = (minutes: number) => {
    onUpdateSettings({
      notifications: {
        ...notifications,
        beforeMinutes: minutes,
      },
    });
  };

  const handleChangePostMinutes = (minutes: number) => {
    onUpdateSettings({
      notifications: {
        ...notifications,
        postPrayerMinutes: minutes,
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in text-right font-arabic-text" dir="rtl">
      {/* Location Settings Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sand-100 dark:border-night-border">
          <span className="p-2 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400">
            <MapPin className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              الموقع الجغرافي
            </h3>
            <p className="text-xs text-stone-500 dark:text-night-muted">
              حساب مواقيت الصلاة بدقة بناءً على إحداثياتك
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50/60 dark:bg-night-900/40 border border-sand-200/80 dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-islamic-950 dark:text-night-text">
              {location.cityNameAr} {location.countryNameAr && `(${location.countryNameAr})`}
            </div>
            <div className="text-xs text-stone-400 dark:text-night-muted font-sans mt-0.5">
              خط العرض: {location.lat.toFixed(2)} • خط الطول: {location.lng.toFixed(2)} • {location.tz}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRequestLocation}
              disabled={geoLoading}
              className="px-3.5 py-2 bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>تحديد عبر GPS</span>
            </button>

            <button
              onClick={onOpenCityModal}
              className="px-3.5 py-2 bg-white dark:bg-night-800 border border-sand-200 dark:border-night-border text-stone-700 dark:text-night-text rounded-xl text-xs font-medium hover:bg-sand-100 transition-colors cursor-pointer"
            >
              تغيير المدينة
            </button>
          </div>
        </div>
      </div>

      {/* Calculation Method Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sand-100 dark:border-night-border">
          <span className="p-2 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              طريقة الحساب المعتمدة
            </h3>
            <p className="text-xs text-stone-500 dark:text-night-muted">
              طريقة الحساب الجعفري (Jafari Calculation Method)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50/60 dark:bg-night-900/40 border border-sand-200/80 dark:border-night-border text-xs text-stone-600 dark:text-night-muted leading-relaxed space-y-1.5">
          <p>
            • <strong>الفجر</strong>: زاوية 16° تحت الأفق.
          </p>
          <p>
            • <strong>المغرب</strong>: ذهاب الحمرة المشرقية (زاوية 4° تحت الأفق).
          </p>
          <p>
            • <strong>العشاء</strong>: زاوية 14° تحت الأفق.
          </p>
          <p>
            • <strong>منتصف الليل الشرعي</strong>: منتصف الوقت بين الغروب وطلوع الفجر.
          </p>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400">
              <Bell className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                تنبيهات ومذكرات الصلاة
              </h3>
              <p className="text-xs text-stone-500 dark:text-night-muted">
                إرسال تنبيهات الأذان والتذكيرات الذكية
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={() => handleToggleMasterNotification(!notifications.enabled)}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
              notifications.enabled && notificationStatus.permission === 'granted'
                ? 'bg-islamic-800 dark:bg-gold-500 justify-end'
                : 'bg-sand-300 dark:bg-night-700 justify-start'
            }`}
          >
            <span className="w-5.5 h-5.5 rounded-full bg-white shadow-xs block" />
          </button>
        </div>

        {/* Permission warning if not granted */}
        {notificationStatus.permission !== 'granted' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">تنبيهات المتصفح غير مفعلة</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                لتلقي إشعارات الأذان في وقتها، يرجى السماح بالإذن في المتصفح.
              </p>
              <button
                onClick={onRequestNotificationPermission}
                className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تفعيل التنبيهات الآن
              </button>
            </div>
          </div>
        )}

        {/* Individual Prayer Toggles */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold text-stone-700 dark:text-night-text">
            الصلوات المطلوب التنبيه لها:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'fajr' as const, label: 'الفجر' },
              { id: 'dhuhr' as const, label: 'الظهر' },
              { id: 'asr' as const, label: 'العصر' },
              { id: 'maghrib' as const, label: 'المغرب' },
              { id: 'isha' as const, label: 'العشاء' },
            ].map(({ id, label }) => {
              const isChecked = notifications[id];
              return (
                <button
                  key={id}
                  onClick={() => handleTogglePrayer(id, !isChecked)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-400 shadow-2xs'
                      : 'bg-sand-50 dark:bg-night-900 border-sand-200 dark:border-night-border text-stone-400 dark:text-night-muted'
                  }`}
                >
                  {label} {isChecked ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pre-prayer Reminder Dropdown */}
        <div className="space-y-2 pt-2 border-t border-sand-100 dark:border-night-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-night-text">
              تنبيه قبل دخول الوقت (للاستعداد):
            </span>
            <select
              value={notifications.beforeMinutes}
              onChange={(e) => handleChangeBeforeMinutes(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
            >
              <option value={0}>بدون تنبيه مسبق</option>
              <option value={5}>قبل الصلاة بـ 5 دقائق</option>
              <option value={10}>قبل الصلاة بـ 10 دقائق</option>
              <option value={15}>قبل الصلاة بـ 15 دقيقة</option>
              <option value={30}>قبل الصلاة بـ 30 دقيقة</option>
            </select>
          </div>
        </div>

        {/* Post-prayer Reminder Dropdown */}
        <div className="space-y-2 pt-2 border-t border-sand-100 dark:border-night-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-night-text">
              تذكير إذا لم تسجل الصلاة بعد وقتها:
            </span>
            <select
              value={notifications.postPrayerMinutes}
              onChange={(e) => handleChangePostMinutes(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
            >
              <option value={10}>بعد 10 دقائق</option>
              <option value={20}>بعد 20 دقيقة</option>
              <option value={30}>بعد 30 دقيقة</option>
              <option value={60}>بعد ساعة واحدة</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
