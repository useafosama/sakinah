import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  User,
  MapPin,
  Compass,
  Bell,
  SlidersHorizontal,
  LayoutGrid,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Navigation,
  Loader2,
  Check,
  Volume2,
  Clock
} from 'lucide-react';
import { UserPreferences, HomeCardId } from '../../types/onboarding';
import { ALL_HOME_CARDS } from '../../services/onboardingService';
import { prayerRepository } from '../../services/prayerRepository';
import { prayerNotificationService } from '../../services/prayerNotificationService';
import { PrayerCityModal } from '../prayer/PrayerCityModal';
import { UserPrayerLocation, PrayerUserSettings } from '../../types/prayer';
import { CharitySettings, CharityReminderPreset } from '../../types/charity';
import { charityService, CHARITY_PRESET_TIMES } from '../../services/charityService';
import { useToast } from '../common/Toast';

interface QuickSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (displayName?: string) => void;
  onSkip: () => void;
  userPreferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onToggleHomeCard: (id: HomeCardId) => void;
  onMoveHomeCard: (fromIndex: number, toIndex: number) => void;
  onRequestNotificationPermission: () => Promise<NotificationPermission>;
}

export const QuickSetupModal: React.FC<QuickSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  userPreferences,
  onUpdatePreferences,
  onToggleHomeCard,
  onMoveHomeCard,
  onRequestNotificationPermission,
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<number>(0);
  const [nameInput, setNameInput] = useState<string>(userPreferences.displayName || '');
  const [prayerSettings, setPrayerSettings] = useState<PrayerUserSettings>(() =>
    prayerRepository.getSettings()
  );
  const [charitySettings, setCharitySettings] = useState<CharitySettings>(() =>
    charityService.getSettings()
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [notifState, setNotifState] = useState(prayerNotificationService.getStatus());
  const [testingNotification, setTestingNotification] = useState(false);

  // Update local name when preferences change
  React.useEffect(() => {
    setNameInput(userPreferences.displayName || '');
  }, [userPreferences.displayName]);

  // Refresh prayer and charity settings on open
  React.useEffect(() => {
    if (isOpen) {
      setPrayerSettings(prayerRepository.getSettings());
      setCharitySettings(charityService.getSettings());
      setNotifState(prayerNotificationService.getStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalWizardSteps = 7; // Steps 1 to 7

  const handleNext = () => {
    if (step === 1) {
      onUpdatePreferences({ displayName: nameInput.trim() });
    }
    setStep((prev) => Math.min(prev + 1, 8));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleUpdateCharitySettings = (updates: Partial<CharitySettings>) => {
    const updated = charityService.saveSettings(updates);
    setCharitySettings(updated);
  };

  const handleSaveLocation = (loc: UserPrayerLocation) => {
    const updated = { ...prayerSettings, location: loc };
    setPrayerSettings(updated);
    prayerRepository.saveSettings(updated);
    showToast(`تم ضبط الموقع على: ${loc.cityNameAr}`);
  };

  const handleRequestGeo = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showToast('خدمة تحديد الموقع غير مدعومة في متصفحك');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc: UserPrayerLocation = {
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          cityName: 'GPS Location',
          cityNameAr: 'موقعي الحالي (GPS)',
          countryName: 'Current Location',
          countryNameAr: 'الموقع الفعلي',
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo',
          isGeolocation: true,
        };
        handleSaveLocation(newLoc);
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        showToast('تعذر الوصول إلى موقعك. يرجى اختيار المدينة يدوياً.');
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRequestNotifications = async () => {
    try {
      const perm = await onRequestNotificationPermission();
      setNotifState(prayerNotificationService.getStatus());
      if (perm === 'granted') {
        showToast('تم تفعيل إشعارات الصلاة بنجاح 🔔');
      } else if (perm === 'denied') {
        showToast('تم حظر التنبيهات من المتصفح.');
      }
    } catch {
      showToast('حدث خطأ أثناء طلب إذن التنبيهات');
    }
  };

  const handleSendTestNotification = async () => {
    setTestingNotification(true);
    try {
      await prayerNotificationService.sendTestNotification();
      showToast('تم إرسال إشعار تجريبي 🔔');
    } catch {
      showToast('تعذر إرسال الإشعار');
    } finally {
      setTestingNotification(false);
    }
  };

  const handleUpdateNotifications = (updates: Partial<PrayerUserSettings['notifications']>) => {
    const updatedNotifs = { ...prayerSettings.notifications, ...updates };
    const updated = { ...prayerSettings, notifications: updatedNotifs };
    setPrayerSettings(updated);
    prayerRepository.saveSettings(updated);
  };

  const handleFinish = () => {
    onUpdatePreferences({ displayName: nameInput.trim() });
    onComplete(nameInput.trim());
    showToast('مرحباً بك في سكينة! تم تخصيص التطبيق بنجاح ✨');
  };

  const handleDismiss = () => {
    onClose();
    onSkip();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-islamic-950/50 dark:bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-sand-50 dark:bg-night-900 rounded-3xl border border-sand-300/80 dark:border-night-border p-5 sm:p-6 shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col font-arabic-text"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-sand-200/70 dark:border-night-border mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gold-500/10 dark:bg-gold-400/10 text-gold-600 dark:text-gold-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading leading-tight">
                  {step === 0
                    ? 'الإعداد السريع'
                    : step === 7
                    ? 'اكتمال الإعداد'
                    : `إعداد التطبيق (${step}/${totalWizardSteps})`}
                </h3>
              </div>
            </div>

            {/* Skip / Close Button */}
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 text-xs font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-200/70 dark:hover:bg-night-800 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="إغلاق / تخطي الآن"
            >
              <span>{step === 0 ? 'تخطي الآن' : 'إغلاق'}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Indicator (For wizard steps 1-7) */}
          {step >= 1 && step <= 7 && (
            <div className="mb-4">
              <div className="w-full bg-sand-200 dark:bg-night-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gold-500 dark:bg-gold-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(step / totalWizardSteps) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 px-0.5 text-[11px] text-stone-400 dark:text-night-muted">
                <span>الخطوة {step} من {totalWizardSteps}</span>
                <span>
                  {step === 1 && 'الاسم والتحية'}
                  {step === 2 && 'الموقع الجغرافي'}
                  {step === 3 && 'طريقة الحساب'}
                  {step === 4 && 'تفعيل التنبيهات'}
                  {step === 5 && 'تخصيص التذكيرات'}
                  {step === 6 && 'الخير والصدقة'}
                  {step === 7 && 'الصفحة الرئيسية'}
                </span>
              </div>
            </div>
          )}

          {/* Step Contents Area */}
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 py-1">
            {/* STEP 0: Welcome Screen */}
            {step === 0 && (
              <div className="text-center py-3 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-gold-100 to-sand-200 dark:from-night-800 dark:to-night-850 flex items-center justify-center border border-gold-300/40 dark:border-gold-500/20 shadow-inner">
                  <span className="text-2xl">🤍</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                    أهلاً بك في سَكِينَة
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-night-muted leading-relaxed max-w-sm mx-auto">
                    طريقك اليومي لطمأنينة القلب، مع مواقيت صلاة دقيقة، وأذكار صحيحة، وتذكير دائم بالخير والصدقة.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-right">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-center">
                    <MapPin className="w-4 h-4 mx-auto text-gold-600 dark:text-gold-400 mb-1" />
                    <span className="text-[11px] font-bold text-stone-800 dark:text-night-text block">
                      مواقيت دقيقة
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-center">
                    <Bell className="w-4 h-4 mx-auto text-gold-600 dark:text-gold-400 mb-1" />
                    <span className="text-[11px] font-bold text-stone-800 dark:text-night-text block">
                      تنبيهات الأذان
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-center">
                    <LayoutGrid className="w-4 h-4 mx-auto text-gold-600 dark:text-gold-400 mb-1" />
                    <span className="text-[11px] font-bold text-stone-800 dark:text-night-text block">
                      تخصيص كامل
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-3 px-4 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ابدأ الإعداد السريع (أقل من دقيقة)</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onSkip}
                    className="w-full py-2 text-xs font-semibold text-stone-500 dark:text-night-muted hover:text-stone-800 dark:hover:text-night-text transition-colors cursor-pointer"
                  >
                    تخطي الآن واستكشاف التطبيق مباشرة
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Name / Display Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      كيف تحب أن نناديك؟
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      سنستخدم اسمك لتحية طيبة وتخصيص رسائلك اليومية
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border space-y-3">
                  <label className="text-xs font-bold text-stone-700 dark:text-night-text block">
                    الاسم أو اللقب المفضل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="مثال: عبد الله، فاطمة، أحمد..."
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-sm font-bold text-stone-800 dark:text-night-text placeholder:text-stone-400 focus:outline-none focus:border-gold-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-stone-400 dark:text-night-muted">
                    يمكنك تركه فارغاً وسيتم الترحيب بك كضيف كريم.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      حدد موقعك الجغرافي
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      لحساب مواقيت الصلاة والقبلة بدقة متناهية
                    </p>
                  </div>
                </div>

                {/* Current Location Card */}
                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 dark:text-night-muted">
                      الموقع الحالي المختار:
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-400 font-bold">
                      {prayerSettings.location.isGeolocation ? 'GPS فعلي' : 'مدينة محددة'}
                    </span>
                  </div>

                  <div className="text-base font-bold text-islamic-950 dark:text-night-text">
                    {prayerSettings.location.cityNameAr} {prayerSettings.location.countryNameAr && `(${prayerSettings.location.countryNameAr})`}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-night-muted font-sans">
                    {prayerSettings.location.lat.toFixed(2)}°, {prayerSettings.location.lng.toFixed(2)}° • {prayerSettings.location.tz}
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRequestGeo}
                      disabled={geoLoading}
                      className="py-2.5 px-3 bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      <span>تحديد عبر GPS</span>
                    </button>

                    <button
                      onClick={() => setIsCityModalOpen(true)}
                      className="py-2.5 px-3 bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-800 dark:text-night-text rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      بحث / اختيار مدينة
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Calculation Method */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <Compass className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      طريقة حساب المواقيت
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      حساب فلكي وشرعي موثوق
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border-2 border-gold-500/50 dark:border-gold-500/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                      <span className="text-sm font-bold text-islamic-950 dark:text-night-text">
                        طريقة الحساب الجعفري (Jafari Method)
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 font-bold">
                      معتمد
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-night-muted leading-relaxed">
                    تعتمد سكينة المعايير الدقيقة لحساب المواقيت الشرعية:
                  </p>

                  <div className="p-3 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200/80 dark:border-night-border text-xs text-stone-700 dark:text-night-text space-y-1">
                    <div>• <strong>الفجر:</strong> زاوية 16° تحت الأفق</div>
                    <div>• <strong>المغرب:</strong> ذهاب الحمرة المشرقية (4°)</div>
                    <div>• <strong>العشاء:</strong> زاوية 14° تحت الأفق</div>
                    <div>• <strong>منتصف الليل الشرعي:</strong> منتصف الوقت بين الغروب والفجر</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Notifications Permission */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <Bell className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      فعّل تنبيهات الصلاة 🔔
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      تذكيرك في موعد كل صلاة وقبل دخول وقتها
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 dark:text-night-text">
                      حالة إذن التنبيهات في المتصفح:
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        notifState.permission === 'granted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                          : notifState.permission === 'denied'
                          ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {notifState.permission === 'granted'
                        ? 'مفعلة ✓'
                        : notifState.permission === 'denied'
                        ? 'محظورة'
                        : 'غير مفعلة بعد'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-night-muted leading-relaxed">
                    عند تفعيل التنبيهات، سيرسل لك التطبيق إشعارات هادئة في مواعيد الصلاة وقبلها، حتى وإن كان المتصفح مغلقاً على الأجهزة المدعومة.
                  </p>

                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    {notifState.permission !== 'granted' ? (
                      <button
                        onClick={handleRequestNotifications}
                        className="flex-1 py-2.5 px-4 bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>تفعيل تنبيهات الصلاة الآن</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSendTestNotification}
                        disabled={testingNotification}
                        className="flex-1 py-2.5 px-4 bg-sand-100 dark:bg-night-800 hover:bg-sand-200 dark:hover:bg-night-700 text-stone-800 dark:text-night-text rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {testingNotification ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5 text-gold-600" />}
                        <span>إرسال إشعار تجريبي</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Notification Timing & Prayers Customization */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      تخصيص التنبيهات والتذكيرات
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      تحكم بمواعيد التذكير والصلوات المفعلة
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border space-y-4">
                  {/* Pre-prayer selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-night-text flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-500" />
                      تنبيه قبل دخول الوقت (للاستعداد):
                    </label>
                    <select
                      value={prayerSettings.notifications.beforeMinutes}
                      onChange={(e) => handleUpdateNotifications({ beforeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
                    >
                      <option value={0}>بدون تنبيه مسبق</option>
                      <option value={5}>قبل الصلاة بـ 5 دقائق</option>
                      <option value={10}>قبل الصلاة بـ 10 دقائق (الموصى به)</option>
                      <option value={15}>قبل الصلاة بـ 15 دقيقة</option>
                      <option value={30}>قبل الصلاة بـ 30 دقيقة</option>
                    </select>
                  </div>

                  {/* Post-prayer unlogged reminder */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-night-text flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-gold-500" />
                      تذكير إذا لم تسجل الصلاة بعد وقتها:
                    </label>
                    <select
                      value={prayerSettings.notifications.postPrayerMinutes}
                      onChange={(e) => handleUpdateNotifications({ postPrayerMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
                    >
                      <option value={10}>بعد 10 دقائق</option>
                      <option value={20}>بعد 20 دقيقة (الموصى به)</option>
                      <option value={30}>بعد 30 دقيقة</option>
                      <option value={60}>بعد ساعة واحدة</option>
                    </select>
                  </div>

                  {/* Active prayers toggles */}
                  <div className="pt-2 border-t border-sand-100 dark:border-night-border space-y-2">
                    <span className="text-xs font-bold text-stone-700 dark:text-night-text block">
                      الصلوات المشمولة بالتنبيه:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => {
                        const labels = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
                        const checked = prayerSettings.notifications[p];
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleUpdateNotifications({ [p]: !checked })}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                              checked
                                ? 'bg-islamic-50 dark:bg-night-800 border-islamic-800/40 dark:border-gold-500/40 text-islamic-950 dark:text-night-text'
                                : 'bg-sand-50 dark:bg-night-900 border-sand-200 dark:border-night-border text-stone-400'
                            }`}
                          >
                            <span>{labels[p]}</span>
                            {checked ? <Check className="w-3.5 h-3.5 text-islamic-800 dark:text-gold-400" /> : <X className="w-3.5 h-3.5 text-stone-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Charity & Good Deeds Reminder */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-gold-500/10 dark:bg-gold-400/10 text-gold-600 dark:text-gold-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      تذكير الخير والصدقة 🌱
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      تذكير بسيط يساعدك ألا يمر يوم دون عمل خير
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-night-text">
                      هل تريد أن تذكّرك سكينة بالخير والصدقة؟
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateCharitySettings({ enabled: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          charitySettings.enabled
                            ? 'bg-islamic-800 dark:bg-gold-500 text-sand-50 dark:text-islamic-950 shadow-xs'
                            : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
                        }`}
                      >
                        تفعيل التذكير
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCharitySettings({ enabled: false })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !charitySettings.enabled
                            ? 'bg-islamic-800 dark:bg-gold-500 text-sand-50 dark:text-islamic-950 shadow-xs'
                            : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
                        }`}
                      >
                        ليس الآن
                      </button>
                    </div>
                  </div>

                  {charitySettings.enabled && (
                    <div className="pt-3 border-t border-sand-100 dark:border-night-border space-y-3">
                      <label className="text-xs font-bold text-stone-700 dark:text-night-text block">
                        متى نذكّرك؟
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(['after_fajr', 'morning', 'after_asr', 'evening', 'custom'] as CharityReminderPreset[]).map((preset) => {
                          const info = CHARITY_PRESET_TIMES[preset];
                          const isSelected = charitySettings.reminderPreset === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                handleUpdateCharitySettings({
                                  reminderPreset: preset,
                                  reminderTime: preset !== 'custom' ? info.time : charitySettings.reminderTime,
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-gold-50 dark:bg-night-800 border-gold-500/60 dark:border-gold-500/60 text-islamic-950 dark:text-gold-300 shadow-2xs'
                                  : 'bg-sand-50/70 dark:bg-night-900 border-sand-200 dark:border-night-border text-stone-700 dark:text-night-muted'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{info.icon}</span>
                                <span className="text-xs font-bold">{info.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {charitySettings.reminderPreset === 'custom' && (
                        <div className="pt-1 flex items-center gap-2">
                          <label className="text-xs font-semibold text-stone-600 dark:text-night-muted">
                            اختر الوقت المفضل:
                          </label>
                          <input
                            type="time"
                            value={charitySettings.reminderTime}
                            onChange={(e) => handleUpdateCharitySettings({ reminderTime: e.target.value })}
                            className="px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-xs font-bold text-stone-800 dark:text-night-text focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: Home Layout & Cards Customization */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 shrink-0">
                    <LayoutGrid className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                      تخصيص الصفحة الرئيسية
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-night-muted">
                      رتّب وفعل البطاقات التي تود رؤيتها أولاً
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {userPreferences.homeLayout.map((cardId, index) => {
                    const cardInfo = ALL_HOME_CARDS.find((c) => c.id === cardId);
                    if (!cardInfo) return null;
                    const isDisabled = userPreferences.disabledHomeCards?.includes(cardId);

                    return (
                      <div
                        key={cardId}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isDisabled
                            ? 'bg-sand-100/50 dark:bg-night-900/40 border-sand-200 dark:border-night-border opacity-60'
                            : 'bg-white dark:bg-night-850 border-sand-200/80 dark:border-night-border shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleHomeCard(cardId)}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              isDisabled
                                ? 'bg-sand-200 text-stone-400 dark:bg-night-800'
                                : 'bg-gold-50 text-gold-600 dark:bg-gold-400/10 dark:text-gold-400'
                            }`}
                            title={isDisabled ? 'إظهار البطاقة' : 'إخفاء البطاقة'}
                          >
                            {isDisabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-islamic-950 dark:text-night-text block truncate">
                              {cardInfo.label}
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-night-muted block truncate">
                              {cardInfo.description}
                            </span>
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onMoveHomeCard(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 rounded-lg bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onMoveHomeCard(index, index + 1)}
                            disabled={index === userPreferences.homeLayout.length - 1}
                            className="p-1 rounded-lg bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 8: Final Summary */}
            {step === 8 && (
              <div className="text-center py-2 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-300/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                    تم إعداد سكينة بنجاح ✨
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-night-muted">
                    تطبيقك جاهز بالكامل وفق خياراتك المفضلة
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-white dark:bg-night-850 p-4 rounded-2xl border border-sand-200/80 dark:border-night-border text-right space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-sand-100 dark:border-night-border">
                    <span className="text-stone-500 dark:text-night-muted">الاسم والترحيب:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      {nameInput.trim() || 'ضيف كريم 🤍'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-sand-100 dark:border-night-border">
                    <span className="text-stone-500 dark:text-night-muted">الموقع المعتمد:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      {prayerSettings.location.cityNameAr}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-sand-100 dark:border-night-border">
                    <span className="text-stone-500 dark:text-night-muted">طريقة الحساب:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      الجعفري (Jafari)
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-sand-100 dark:border-night-border">
                    <span className="text-stone-500 dark:text-night-muted">تنبيهات الصلاة:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      {notifState.permission === 'granted' ? 'مفعلة' : 'غير مفعلة'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-sand-100 dark:border-night-border">
                    <span className="text-stone-500 dark:text-night-muted">تذكير الخير والصدقة:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      {charitySettings.enabled
                        ? `مفعل (${CHARITY_PRESET_TIMES[charitySettings.reminderPreset]?.label || charitySettings.reminderTime})`
                        : 'غير مفعل'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-night-muted">بطاقات الرئيسية:</span>
                    <span className="font-bold text-islamic-950 dark:text-night-text">
                      {userPreferences.homeLayout.length - (userPreferences.disabledHomeCards?.length || 0)} بطاقة نشطة
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-3.5 px-4 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ابدأ يومك مع سكينة</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation Bar (For Steps 1 to 7) */}
          {step >= 1 && step <= 7 && (
            <div className="pt-3 border-t border-sand-200/70 dark:border-night-border flex items-center justify-between gap-2">
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl bg-sand-100 dark:bg-night-800 text-stone-700 dark:text-night-text text-xs font-bold hover:bg-sand-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>رجوع</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>{step === 7 ? 'مراجعة الإعداد' : 'التالي'}</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Integrated City Selector Modal for Step 2 */}
        {isCityModalOpen && (
          <PrayerCityModal
            isOpen={isCityModalOpen}
            onClose={() => setIsCityModalOpen(false)}
            currentLocation={prayerSettings.location}
            onSelectCity={(loc) => {
              handleSaveLocation(loc);
              setIsCityModalOpen(false);
            }}
            onRequestGeolocation={handleRequestGeo}
            geoLoading={geoLoading}
          />
        )}
      </div>
    </AnimatePresence>
  );
};
