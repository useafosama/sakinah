import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { playSoftClick, playCompletionChime, triggerHaptic } from '../../utils/sound';

interface TasbeehModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const PRESET_PRAISES = [
  { id: 'subhanallah', title: 'سُبْحَانَ اللَّهِ', meaning: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', title: 'الْحَمْدُ لِلَّهِ', meaning: 'Praise be to Allah', target: 33 },
  { id: 'allahuakbar', title: 'اللَّهُ أَكْبَرُ', meaning: 'Allah is the Greatest', target: 34 },
  { id: 'astaghfirullah', title: 'أَسْتَغْفِرُ اللَّهَ', meaning: 'I seek forgiveness from Allah', target: 100 },
  { id: 'lailahaillallah', title: 'لَا إِلَهَ إِلَّا اللَّهُ', meaning: 'There is no god but Allah', target: 100 },
  { id: 'salawat', title: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', meaning: 'Peace upon the Prophet', target: 100 },
  { id: 'hawqala', title: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaning: 'No power except in Allah', target: 33 },
  { id: 'free', title: 'تسبيح حر', meaning: 'Custom Free Praise', target: 100 },
];

export const TasbeehModal: React.FC<TasbeehModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  vibrationEnabled,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PRAISES[0]);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [customTarget, setCustomTarget] = useState<number>(33);

  const activeTarget = selectedPreset.id === 'free' ? customTarget : selectedPreset.target;
  const isDone = count >= activeTarget && activeTarget > 0;
  const progressPercent = activeTarget > 0 ? Math.min(100, Math.round((count / activeTarget) * 100)) : 0;

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);

    if (activeTarget > 0 && nextCount === activeTarget) {
      setCycles((prev) => prev + 1);
      playCompletionChime(soundEnabled);
      triggerHaptic(vibrationEnabled);
    } else {
      playSoftClick(soundEnabled);
      triggerHaptic(vibrationEnabled);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleFullReset = () => {
    setCount(0);
    setCycles(0);
  };

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
            className="fixed inset-0 bg-islamic-950/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-sm bg-sand-50 rounded-2xl sm:rounded-3xl border border-sand-300/80 p-5 sm:p-6 shadow-xl z-10 text-center"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-sand-200/70 mb-4">
              <div className="flex items-center gap-1.5 text-islamic-900">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <h3 className="text-lg font-bold font-arabic-text">السبحة الإلكترونية</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-sand-200/80 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Praise Selector Horizontal Scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {PRESET_PRAISES.map((preset) => {
                const isActive = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCount(0);
                      if (preset.id !== 'free') setCustomTarget(preset.target);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-islamic-800 text-sand-50 shadow-2xs'
                        : 'bg-white text-stone-600 border border-sand-200/80 hover:bg-sand-100'
                    }`}
                  >
                    {preset.title}
                  </button>
                );
              })}
            </div>

            {/* Selected Dhikr Display */}
            <div className="min-h-[56px] flex flex-col items-center justify-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold font-arabic-text text-islamic-900 leading-normal">
                {selectedPreset.title}
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">{selectedPreset.meaning}</p>
            </div>

            {/* Large Interactive Counter Bead Button */}
            <div className="flex justify-center mb-5">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleTap}
                className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white border border-sand-300 shadow-card hover:border-gold-400/70 flex flex-col items-center justify-center cursor-pointer select-none transition-all"
                aria-label="اضغط للتسبيح"
              >
                {/* Outer Circular Progress */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-2" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke="#EFEBE2"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke={isDone ? '#C5A880' : '#173C32'}
                    strokeWidth="4"
                    strokeDasharray="276.46"
                    animate={{ strokeDashoffset: 276.46 - (progressPercent / 100) * 276.46 }}
                    transition={{ duration: 0.15 }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Counter Content */}
                <motion.span
                  key={count}
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1 }}
                  className="text-4xl sm:text-5xl font-extrabold text-islamic-900 tracking-tight font-sans"
                >
                  {count}
                </motion.span>
                <div className="flex items-center gap-1 text-[11px] text-stone-400 font-sans mt-0.5">
                  <span>الهدف:</span>
                  <span className="font-semibold text-islamic-800">{activeTarget}</span>
                </div>

                {isDone && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-3 bg-gold-100 text-gold-700 px-2 py-0.2 rounded-full text-[9px] font-bold flex items-center gap-0.5 border border-gold-200"
                  >
                    <Check className="w-2.5 h-2.5" /> تم الهدف
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Cycles and Controls */}
            <div className="flex items-center justify-between px-1 pt-2 border-t border-sand-200/70 text-xs">
              <div className="flex items-center gap-1.5 text-stone-600">
                <span className="text-[11px]">الدورات:</span>
                <span className="px-2 py-0.2 rounded-md bg-islamic-100 text-islamic-900 font-bold text-xs">
                  {cycles}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sand-200/80 text-stone-700 text-xs hover:bg-sand-300 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[11px]">تصفير</span>
                </button>
                {cycles > 0 && (
                  <button
                    onClick={handleFullReset}
                    className="px-2 py-1 rounded-xl text-stone-400 hover:text-stone-600 text-[11px] transition-colors"
                  >
                    تصفير الكل
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
