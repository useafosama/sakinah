import { CompassOrientationState, QiblaDirectionInfo } from '../../types/prayer';
import { Sparkles, CheckCircle2, RotateCw, RotateCcw, AlertTriangle, Smartphone, Navigation } from 'lucide-react';

interface QiblaCompassProps {
  orientation: CompassOrientationState;
  qiblaInfo: QiblaDirectionInfo | null;
  onRequestPermission: () => Promise<boolean>;
  loading?: boolean;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  orientation,
  qiblaInfo,
  onRequestPermission,
  loading,
}) => {
  const {
    deviceHeading,
    qiblaAngle,
    permissionState,
    hasSensors,
    isAligned,
    isClose,
    turnDirection,
    diffDegrees,
  } = orientation;

  // The compass dial rotation:
  // If sensor is active, the dial rotates by -deviceHeading so North points to True North
  // If no sensor, dial is fixed (0deg) and Kaaba needle points at qiblaAngle
  const dialRotation = deviceHeading !== null ? -deviceHeading : 0;

  // Kaaba needle rotation on the dial
  const kaabaAngle = qiblaAngle;

  return (
    <div className="flex flex-col items-center justify-center select-none" dir="rtl">
      {/* Compass Outer Container */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4">
        
        {/* Ambient Glowing Halo behind Compass */}
        <div
          className={`absolute inset-2 rounded-full transition-all duration-700 blur-2xl pointer-events-none ${
            isAligned
              ? 'bg-emerald-500/30 dark:bg-emerald-400/25 scale-105'
              : isClose
              ? 'bg-amber-500/20 dark:bg-gold-400/20 scale-100'
              : 'bg-sand-300/30 dark:bg-night-800/40 scale-95'
          }`}
        />

        {/* Outer Static Bezel / Alignment Ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-300 shadow-xl ${
            isAligned
              ? 'border-emerald-500 dark:border-emerald-400 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
              : isClose
              ? 'border-amber-400 dark:border-gold-400/80 shadow-gold-500/10'
              : 'border-sand-300/80 dark:border-night-border'
          } bg-sand-50/60 dark:bg-night-900/60 backdrop-blur-md`}
        />

        {/* Static Device Top Notch Indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div
            className={`w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] transition-colors duration-300 ${
              isAligned
                ? 'border-t-emerald-500 dark:border-t-emerald-400 animate-bounce'
                : isClose
                ? 'border-t-amber-500 dark:border-t-gold-400'
                : 'border-t-islamic-800 dark:border-t-gold-400'
            }`}
          />
        </div>

        {/* Rotating Compass Dial Container */}
        <div
          className="relative w-[92%] h-[92%] rounded-full bg-white dark:bg-night-850 border border-sand-200/80 dark:border-night-border/80 shadow-inner flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `rotate(${dialRotation}deg)`,
          }}
        >
          {/* Compass Dial Face SVG with Degree Marks */}
          <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 200 200">
            {/* Degree Ticks */}
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const isMajor = deg % 30 === 0;
              const isCardinal = deg % 90 === 0;
              const length = isCardinal ? 10 : isMajor ? 6 : 3;
              const strokeWidth = isCardinal ? 2 : isMajor ? 1.5 : 0.75;
              const strokeColor = isCardinal
                ? deg === 0
                  ? '#10b981'
                  : '#a8a29e'
                : isMajor
                ? '#cbd5e1'
                : '#e2e8f0';

              return (
                <line
                  key={deg}
                  x1="100"
                  y1={10}
                  x2="100"
                  y2={10 + length}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 100 100)`}
                  className="transition-colors dark:opacity-70"
                />
              );
            })}

            {/* Inner subtle concentric circles */}
            <circle cx="100" cy="100" r="72" fill="none" stroke="#e7e5e4" strokeWidth="0.75" className="dark:stroke-stone-700/60" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#e7e5e4" strokeWidth="0.5" className="dark:stroke-stone-800/80" />
          </svg>

          {/* Cardinal Directions Labels (Rotate with Dial) */}
          <div className="absolute inset-0 p-4 pointer-events-none text-xs font-bold font-sans">
            {/* North */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[13px] tracking-wider">ش</span>
              <span className="text-[8px] text-emerald-600/70 dark:text-emerald-400/70 -mt-1 font-sans">N</span>
            </div>

            {/* South */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-stone-400 dark:text-night-muted text-[12px]">ج</span>
              <span className="text-[8px] text-stone-400 -mt-1">S</span>
            </div>

            {/* East */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-stone-400 dark:text-night-muted text-[12px]">ق</span>
              <span className="text-[8px] text-stone-400 -mt-1">E</span>
            </div>

            {/* West */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-stone-400 dark:text-night-muted text-[12px]">غ</span>
              <span className="text-[8px] text-stone-400 -mt-1">W</span>
            </div>
          </div>

          {/* Qibla Indicator Line & Kaaba Marker */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotate(${kaabaAngle}deg)`,
            }}
          >
            {/* Needle Line towards Kaaba */}
            <div className="absolute top-5 bottom-1/2 w-0.75 bg-gradient-to-t from-gold-400/20 via-gold-500 to-gold-400 rounded-full shadow-xs" />

            {/* Kaaba Badge at Qibla Bearing */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center group">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-islamic-950 dark:bg-islamic-900 border-2 ${
                  isAligned
                    ? 'border-emerald-400 ring-4 ring-emerald-400/30 scale-110'
                    : 'border-gold-400 shadow-md shadow-gold-500/20'
                } flex items-center justify-center text-lg transition-transform duration-200 cursor-pointer shadow-md`}
                style={{
                  // Keep the Kaaba icon upright relative to device screen
                  transform: `rotate(${-kaabaAngle - dialRotation}deg)`,
                }}
                title={`اتجاه القبلة: ${qiblaAngle.toFixed(1)}°`}
              >
                <span className="select-none text-base">🕋</span>
              </div>
              <span
                className="text-[9px] font-bold text-gold-700 dark:text-gold-300 bg-sand-100/90 dark:bg-night-900/90 px-1.5 py-0.2 rounded-md shadow-2xs mt-1 whitespace-nowrap"
                style={{
                  transform: `rotate(${-kaabaAngle - dialRotation}deg)`,
                }}
              >
                القبلة
              </span>
            </div>
          </div>

          {/* Center Hub / Pivot */}
          <div className="relative z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-sand-50 to-sand-100 dark:from-night-800 dark:to-night-900 border-2 border-sand-300 dark:border-night-border shadow-md flex flex-col items-center justify-center p-1">
            {isAligned ? (
              <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">مضبوط</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-bold font-sans text-islamic-950 dark:text-night-text dir-ltr">
                  {Math.round(qiblaAngle)}°
                </span>
                <span className="text-[9px] font-medium text-stone-500 dark:text-night-muted font-arabic-text">
                  {qiblaInfo?.cardinalEn || 'Qibla'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alignment Status Banner / Real-time Feedback */}
      <div className="w-full max-w-sm mt-3">
        {loading ? (
          <div className="p-3 rounded-2xl bg-sand-100/70 dark:bg-night-850 animate-pulse text-center text-xs text-stone-500">
            جاري حساب اتجاه القبلة الفلكي...
          </div>
        ) : isAligned ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2.5 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold font-arabic-heading">
                أنت الآن باتجاه القبلة الشريفة مباشرة 🕋
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                تقبل الله طاعتكم وصالح أعمالكم
              </p>
            </div>
          </div>
        ) : isClose ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">قريب جداً من اتجاه القبلة</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  فارق {diffDegrees}° فقط
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/50">
              {turnDirection === 'right' ? (
                <>
                  <span>أدر يميناً</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>أدر يساراً</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>
        ) : hasSensors ? (
          <div className="p-3.5 rounded-2xl bg-sand-100/80 dark:bg-night-850 border border-sand-200/80 dark:border-night-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-700 dark:text-night-text">
              <Navigation className="w-4 h-4 text-islamic-800 dark:text-gold-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">حرك الهاتف باتجاه الكعبة 🕋</span>
                <span className="block text-[10px] text-stone-400 dark:text-night-muted">
                  فارق الاتجاه: {diffDegrees}°
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-islamic-800 text-sand-50 dark:bg-gold-400 dark:text-islamic-950 text-xs font-bold shadow-2xs">
              {turnDirection === 'right' ? (
                <>
                  <span>أدر لليمين</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>أدر لليسار</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>
        ) : (
          /* Desktop / Non-sensor State */
          <div className="p-3.5 rounded-2xl bg-sand-100/60 dark:bg-night-850 border border-sand-200/80 dark:border-night-border text-stone-600 dark:text-night-muted text-center space-y-1.5">
            <p className="text-xs font-bold text-islamic-900 dark:text-night-text">
              زاوية القبلة: {qiblaAngle.toFixed(1)}° ({qiblaInfo?.cardinalAr || 'الجنوب الشرقي'})
            </p>
            <p className="text-[11px] text-stone-500 dark:text-night-muted leading-relaxed">
              للحصول على توجيه حي وتلقائي، افتح موقع سكينة من هاتفك المحمول مع تفعيل حساسات الحركة.
            </p>
          </div>
        )}

        {/* iOS Permission Prompt Button */}
        {permissionState === 'prompt' && (
          <div className="mt-3 text-center">
            <button
              onClick={onRequestPermission}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-400 dark:hover:bg-gold-500 text-sand-50 dark:text-islamic-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>تفعيل بوصلة الهاتف الذكية</span>
            </button>
          </div>
        )}

        {/* Permission Denied Warning */}
        {permissionState === 'denied' && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>تم رفض إذن مستشعرات الحركة. يرجى تفعيل إذن الحركة في إعدادات المتصفح.</span>
          </div>
        )}
      </div>
    </div>
  );
};
