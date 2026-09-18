import { useState, useEffect } from 'react';
import { playSoftClick, playCompletionChime, triggerHaptic } from '../utils/sound';

const PROGRESS_STORAGE_KEY = 'sakinah_dhikr_progress_v1';
const LAST_DATE_KEY = 'sakinah_progress_date_v1';

export function useDhikrProgress(soundEnabled = true, vibrationEnabled = true) {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem(LAST_DATE_KEY);

      // Reset daily counts on new day for fresh morning/evening dhikr
      if (lastDate && lastDate !== today) {
        localStorage.setItem(LAST_DATE_KEY, today);
        return {};
      }

      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to empty
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(counts));
      localStorage.setItem(LAST_DATE_KEY, new Date().toDateString());
    } catch {
      // Error handling
    }
  }, [counts]);

  const incrementCount = (id: string, target: number) => {
    const current = counts[id] || 0;
    if (current >= target) return; // already completed

    const next = current + 1;
    setCounts(prev => ({ ...prev, [id]: next }));

    if (next === target) {
      playCompletionChime(soundEnabled);
      triggerHaptic(vibrationEnabled);
    } else {
      playSoftClick(soundEnabled);
      triggerHaptic(vibrationEnabled);
    }
  };

  const resetCount = (id: string) => {
    setCounts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const resetAllCategoryCounts = (ids: string[]) => {
    setCounts(prev => {
      const next = { ...prev };
      ids.forEach(id => delete next[id]);
      return next;
    });
  };

  const getCount = (id: string) => counts[id] || 0;
  const isCompleted = (id: string, target: number) => (counts[id] || 0) >= target;

  return {
    counts,
    incrementCount,
    resetCount,
    resetAllCategoryCounts,
    getCount,
    isCompleted,
  };
}
