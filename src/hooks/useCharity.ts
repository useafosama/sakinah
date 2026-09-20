import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GoodDeedType,
  GoodDeedRecord,
  CharitySettings,
  CharityWeeklySummary,
  SecretDeedIdea,
} from '../types/charity';
import { charityService, getTodayISODate } from '../services/charityService';
import { prayerNotificationService, NotificationStatus } from '../services/prayerNotificationService';
import { analytics } from '../services/analytics/tracker';

export interface UseCharityReturn {
  settings: CharitySettings;
  deeds: GoodDeedRecord[];
  todayDeeds: GoodDeedRecord[];
  hasLoggedToday: boolean;
  weeklySummary: CharityWeeklySummary;
  streak: { currentStreakDays: number; bestStreakDays: number };
  randomSecretIdea: SecretDeedIdea;
  refreshSecretIdea: () => void;
  isLoggingOpen: boolean;
  openLogging: () => void;
  closeLogging: () => void;
  logDeed: (
    type: GoodDeedType,
    options?: {
      amount?: number | null;
      currency?: string;
      isSecret?: boolean;
      note?: string;
      title?: string;
    }
  ) => GoodDeedRecord;
  logSecretDeed: (idea: SecretDeedIdea) => GoodDeedRecord;
  deleteDeed: (id: string) => void;
  updateSettings: (updates: Partial<CharitySettings>) => void;
  snoozeReminder: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  notificationStatus: NotificationStatus;
}

export function useCharity(): UseCharityReturn {
  const [settings, setSettings] = useState<CharitySettings>(() => charityService.getSettings());
  const [deeds, setDeeds] = useState<GoodDeedRecord[]>(() => charityService.getDeeds());
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [randomSecretIdea, setRandomSecretIdea] = useState<SecretDeedIdea>(() =>
    charityService.getRandomSecretIdea()
  );
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>(() =>
    prayerNotificationService.getStatus()
  );

  const refreshData = useCallback(() => {
    setSettings(charityService.getSettings());
    setDeeds(charityService.getDeeds());
    setNotificationStatus(prayerNotificationService.getStatus());
  }, []);

  // Listen for custom change events
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const custom = e as CustomEvent<CharitySettings>;
      if (custom.detail) {
        setSettings(custom.detail);
      } else {
        setSettings(charityService.getSettings());
      }
    };

    const handleDeedsChange = (e: Event) => {
      const custom = e as CustomEvent<GoodDeedRecord[]>;
      if (custom.detail) {
        setDeeds(custom.detail);
      } else {
        setDeeds(charityService.getDeeds());
      }
    };

    window.addEventListener('sakinah:charity-settings-changed', handleSettingsChange);
    window.addEventListener('sakinah:good-deeds-changed', handleDeedsChange);

    return () => {
      window.removeEventListener('sakinah:charity-settings-changed', handleSettingsChange);
      window.removeEventListener('sakinah:good-deeds-changed', handleDeedsChange);
    };
  }, []);

  // Auto check reminder timer periodically in foreground
  useEffect(() => {
    charityService.checkAndTriggerReminder();
    const interval = setInterval(() => {
      charityService.checkAndTriggerReminder();
    }, 60 * 1000); // every minute

    return () => clearInterval(interval);
  }, []);

  const todayStr = useMemo(() => getTodayISODate(), []);

  const todayDeeds = useMemo(() => {
    return deeds.filter((d) => d.date === todayStr);
  }, [deeds, todayStr]);

  const hasLoggedToday = useMemo(() => {
    return todayDeeds.length > 0;
  }, [todayDeeds]);

  const weeklySummary = useMemo(() => {
    return charityService.getWeeklySummary();
  }, [deeds]);

  const streak = useMemo(() => {
    return charityService.calculateStreak();
  }, [deeds]);

  const openLogging = useCallback(() => {
    setIsLoggingOpen(true);
  }, []);

  const closeLogging = useCallback(() => {
    setIsLoggingOpen(false);
  }, []);

  const refreshSecretIdea = useCallback(() => {
    setRandomSecretIdea(charityService.getRandomSecretIdea());
  }, []);

  const logDeed = useCallback(
    (
      type: GoodDeedType,
      options?: {
        amount?: number | null;
        currency?: string;
        isSecret?: boolean;
        note?: string;
        title?: string;
      }
    ) => {
      const created = charityService.logDeed(type, options);
      refreshData();
      analytics.track(options?.isSecret ? 'secret_good_deed_logged' : 'good_deed_logged', {
        deed_type: type,
        is_secret: !!options?.isSecret,
      });
      return created;
    },
    [refreshData]
  );

  const logSecretDeed = useCallback(
    (idea: SecretDeedIdea) => {
      const created = charityService.logDeed(idea.type, {
        title: idea.title,
        note: idea.description,
        isSecret: true,
      });
      refreshData();
      analytics.track('secret_good_deed_logged', {
        deed_type: idea.type,
      });
      return created;
    },
    [refreshData]
  );

  const deleteDeed = useCallback(
    (id: string) => {
      charityService.deleteDeed(id);
      refreshData();
    },
    [refreshData]
  );

  const updateSettings = useCallback(
    (updates: Partial<CharitySettings>) => {
      const updated = charityService.saveSettings(updates);
      setSettings(updated);
      if (updates.notificationsEnabled !== undefined) {
        analytics.track(
          updates.notificationsEnabled ? 'charity_reminder_enabled' : 'charity_reminder_disabled'
        );
      }
    },
    []
  );

  const snoozeReminder = useCallback(() => {
    charityService.snoozeReminder();
    setSettings(charityService.getSettings());
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const perm = await prayerNotificationService.requestPermission();
    setNotificationStatus(prayerNotificationService.getStatus());
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true });
    }
    return perm;
  }, [updateSettings]);

  return {
    settings,
    deeds,
    todayDeeds,
    hasLoggedToday,
    weeklySummary,
    streak,
    randomSecretIdea,
    refreshSecretIdea,
    isLoggingOpen,
    openLogging,
    closeLogging,
    logDeed,
    logSecretDeed,
    deleteDeed,
    updateSettings,
    snoozeReminder,
    requestNotificationPermission,
    notificationStatus,
  };
}
