import { useState, useEffect, useCallback } from 'react';
import { OnboardingState, UserPreferences, HomeCardId } from '../types/onboarding';
import { UserPrayerLocation, PrayerUserSettings } from '../types/prayer';
import {
  getStoredOnboardingState,
  getStoredUserPreferences,
  saveStoredUserPreferences,
  completeOnboarding,
  skipOnboarding,
  restartOnboarding,
  resetSettingsToDefaults,
  fullLocalAppReset,
  DEFAULT_USER_PREFERENCES,
} from '../services/onboardingService';
import { prayerRepository } from '../services/prayerRepository';
import { prayerNotificationService, NotificationStatus } from '../services/prayerNotificationService';
import { analytics } from '../services/analytics/tracker';

export interface UseOnboardingReturn {
  onboardingState: OnboardingState;
  userPreferences: UserPreferences;
  isOpen: boolean;
  currentStep: number;
  notificationStatus: NotificationStatus;
  // Actions
  openSetup: () => void;
  closeSetup: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updatePrayerSettings: (updates: Partial<PrayerUserSettings>) => void;
  setDisplayName: (name: string) => void;
  setLocation: (loc: UserPrayerLocation) => void;
  toggleHomeCard: (id: HomeCardId) => void;
  moveHomeCard: (fromIndex: number, toIndex: number) => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  handleComplete: (customDisplayName?: string) => void;
  handleSkip: () => void;
  handleRestart: () => void;
  handleResetSettings: () => void;
  handleFullReset: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(getStoredOnboardingState);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(getStoredUserPreferences);
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const st = getStoredOnboardingState();
    return !st.completed && !st.skipped;
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>(() =>
    prayerNotificationService.getStatus()
  );

  // Sync state on external change events
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const custom = e as CustomEvent<OnboardingState>;
      if (custom.detail) {
        setOnboardingState(custom.detail);
      } else {
        setOnboardingState(getStoredOnboardingState());
      }
    };

    const handlePrefsChange = (e: Event) => {
      const custom = e as CustomEvent<UserPreferences>;
      if (custom.detail) {
        setUserPreferences(custom.detail);
      } else {
        setUserPreferences(getStoredUserPreferences());
      }
    };

    window.addEventListener('sakinah:onboarding-changed', handleStateChange);
    window.addEventListener('sakinah:preferences-changed', handlePrefsChange);

    return () => {
      window.removeEventListener('sakinah:onboarding-changed', handleStateChange);
      window.removeEventListener('sakinah:preferences-changed', handlePrefsChange);
    };
  }, []);

  const openSetup = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    analytics.track('quick_setup_started');
  }, []);

  const closeSetup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      const updated = { ...userPreferences, ...updates };
      setUserPreferences(updated);
      saveStoredUserPreferences(updated);
    },
    [userPreferences]
  );

  const updatePrayerSettings = useCallback((updates: Partial<PrayerUserSettings>) => {
    const current = prayerRepository.getSettings();
    const updated = { ...current, ...updates };
    prayerRepository.saveSettings(updated);
  }, []);

  const setDisplayName = useCallback(
    (displayName: string) => {
      updatePreferences({ displayName });
    },
    [updatePreferences]
  );

  const setLocation = useCallback(
    (loc: UserPrayerLocation) => {
      const current = prayerRepository.getSettings();
      prayerRepository.saveSettings({ ...current, location: loc });
    },
    []
  );

  const toggleHomeCard = useCallback(
    (id: HomeCardId) => {
      const disabled = userPreferences.disabledHomeCards || [];
      const isCurrentlyDisabled = disabled.includes(id);
      let newDisabled: HomeCardId[];

      if (isCurrentlyDisabled) {
        newDisabled = disabled.filter((c) => c !== id);
      } else {
        // Prevent disabling all cards
        if (disabled.length >= userPreferences.homeLayout.length - 1) {
          return;
        }
        newDisabled = [...disabled, id];
      }

      updatePreferences({ disabledHomeCards: newDisabled });
    },
    [userPreferences, updatePreferences]
  );

  const moveHomeCard = useCallback(
    (fromIndex: number, toIndex: number) => {
      const layout = [...userPreferences.homeLayout];
      if (fromIndex < 0 || fromIndex >= layout.length || toIndex < 0 || toIndex >= layout.length) {
        return;
      }
      const [movedItem] = layout.splice(fromIndex, 1);
      layout.splice(toIndex, 0, movedItem);
      updatePreferences({ homeLayout: layout });
    },
    [userPreferences, updatePreferences]
  );

  const requestNotificationPermission = useCallback(async () => {
    const perm = await prayerNotificationService.requestPermission();
    setNotificationStatus(prayerNotificationService.getStatus());
    if (perm === 'granted') {
      analytics.track('prayer_notification_enabled');
    }
    return perm;
  }, []);

  const handleComplete = useCallback(
    (customDisplayName?: string) => {
      const name = customDisplayName !== undefined ? customDisplayName : userPreferences.displayName;
      completeOnboarding(name);
      setOnboardingState(getStoredOnboardingState());
      setIsOpen(false);
      analytics.track('quick_setup_completed', {
        name: name && name.trim() ? name.trim() : 'زائر كريم'
      });
    },
    [userPreferences.displayName]
  );

  const handleSkip = useCallback(() => {
    skipOnboarding();
    setOnboardingState(getStoredOnboardingState());
    setIsOpen(false);
    analytics.track('quick_setup_skipped');
  }, []);

  const handleRestart = useCallback(() => {
    restartOnboarding();
    setOnboardingState(getStoredOnboardingState());
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const handleResetSettings = useCallback(() => {
    resetSettingsToDefaults();
    setUserPreferences(DEFAULT_USER_PREFERENCES);
  }, []);

  const handleFullReset = useCallback(() => {
    fullLocalAppReset();
    setOnboardingState(getStoredOnboardingState());
    setUserPreferences(DEFAULT_USER_PREFERENCES);
    setIsOpen(true);
    setCurrentStep(0);
  }, []);

  return {
    onboardingState,
    userPreferences,
    isOpen,
    currentStep,
    notificationStatus,
    openSetup,
    closeSetup,
    setStep,
    nextStep,
    prevStep,
    updatePreferences,
    updatePrayerSettings,
    setDisplayName,
    setLocation,
    toggleHomeCard,
    moveHomeCard,
    requestNotificationPermission,
    handleComplete,
    handleSkip,
    handleRestart,
    handleResetSettings,
    handleFullReset,
  };
}
