import React from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

interface DhikrCounterProps {
  current: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
  size?: 'normal' | 'large' | 'compact';
}

export const DhikrCounter: React.FC<DhikrCounterProps> = ({
  current,
  target,
  onIncrement,
  onReset,
  size = 'normal',
}) => {
  const isDone = current >= target;
  const progressPercent = Math.min(100, Math.round((current / target) * 100));

  // Circle dimensions
  const radius = size === 'large' ? 34 : size === 'compact' ? 20 : 28;
  const stroke = size === 'large' ? 3.5 : size === 'compact' ? 2.5 : 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={isDone}
        className={`relative flex items-center justify-center rounded-full transition-all duration-200 select-none ${
          size === 'large'
            ? 'w-16 h-16 sm:w-18 sm:h-18 text-base'
            : size === 'compact'
            ? 'w-11 h-11 text-xs'
            : 'w-13 h-13 sm:w-14 sm:h-14 text-sm'
        } ${
          isDone
            ? 'bg-islamic-800 text-gold-300 shadow-2xs cursor-default'
            : 'bg-sand-100 hover:bg-sand-200/90 text-islamic-900 active:bg-sand-300/80 border border-sand-200/90 cursor-pointer shadow-2xs'
        }`}
        aria-label={`تكرار الذكر، تم ${current} من ${target}`}
      >
        {/* SVG Circular Progress Bar */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            stroke={isDone ? '#245244' : '#EAE4D8'}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke={isDone ? '#C5A880' : '#173C32'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Counter Content */}
        <div className="flex flex-col items-center justify-center z-10 leading-none">
          {isDone ? (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex flex-col items-center"
            >
              <Check className={size === 'large' ? 'w-5 h-5 text-gold-400' : 'w-4 h-4 text-gold-400'} />
            </motion.div>
          ) : (
            <>
              <span className="font-semibold tracking-tight font-sans text-xs sm:text-sm">
                {current}
              </span>
              <span className="text-[9px] sm:text-[10px] text-stone-400 font-sans border-t border-stone-300/60 pt-0.5 mt-0.5 px-0.5">
                {target}
              </span>
            </>
          )}
        </div>
      </motion.button>

      {/* Reset button when partially or fully done */}
      {current > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ rotate: -45 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          title="إعادة ضبط العداد"
          className="p-1.5 rounded-full text-stone-400 hover:text-islamic-800 hover:bg-sand-200/70 transition-colors"
          aria-label="إعادة ضبط العداد"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
};
