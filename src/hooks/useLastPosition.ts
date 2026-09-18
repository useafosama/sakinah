import { useState, useCallback } from 'react';
import { AdhkarCategory, LastPosition } from '../types';

const LAST_POS_STORAGE_KEY = 'sakinah_last_position_v1';

export function useLastPosition() {
  const [lastPosition, setLastPosition] = useState<LastPosition | null>(() => {
    try {
      const saved = localStorage.getItem(LAST_POS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const savePosition = useCallback((category: AdhkarCategory, dhikrId: string) => {
    const pos: LastPosition = {
      category,
      dhikrId,
      updatedAt: Date.now(),
    };
    setLastPosition(pos);
    try {
      localStorage.setItem(LAST_POS_STORAGE_KEY, JSON.stringify(pos));
    } catch {
      // Ignore
    }
  }, []);

  const clearPosition = useCallback(() => {
    setLastPosition(null);
    try {
      localStorage.removeItem(LAST_POS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    lastPosition,
    savePosition,
    clearPosition,
  };
}
