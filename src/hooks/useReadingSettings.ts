import { useState, useEffect } from 'react';
import { ReadingSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'sakinah_reading_settings_v1';

const defaultSettings: ReadingSettings = {
  arabicFontSize: 28, // Standard comfortable reading size
  showTranslation: true,
  showTransliteration: false,
  showVirtue: true,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'light',
};

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  const updateSetting = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const increaseFontSize = () => {
    setSettings(prev => ({ ...prev, arabicFontSize: Math.min(prev.arabicFontSize + 2, 40) }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ ...prev, arabicFontSize: Math.max(prev.arabicFontSize - 2, 22) }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateSetting,
    increaseFontSize,
    decreaseFontSize,
    resetSettings,
  };
}
