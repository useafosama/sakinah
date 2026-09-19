import { OnboardingState, UserPreferences, HomeCardId } from '../types/onboarding';
import { prayerRepository, DEFAULT_USER_SETTINGS } from './prayerRepository';

const STORAGE_KEYS = {
  ONBOARDING_STATE: 'sakinah_onboarding_state_v1',
  USER_PREFERENCES: 'sakinah_user_preferences_v1',
  WELCOME_MODAL_SHOWN: 'sakinah_welcome_modal_shown_session',
};

export const DEFAULT_HOME_LAYOUT: HomeCardId[] = [
  'prayerTimes',
  'dailyMessage',
  'dailyWird',
  'heroVerse',
  'dailyDhikr',
  'categoryGrid',
  'hadithSpotlight',
  'suggestedVideos',
];

export const ALL_HOME_CARDS: { id: HomeCardId; label: string; description: string; icon: string }[] = [
  { id: 'prayerTimes', label: 'مواقيت الصلاة والعد التنازلي', description: 'عرض الصلاة القادمة وأوقات الصلوات', icon: 'Clock' },
  { id: 'dailyMessage', label: 'رسالة وتذكرة اليوم', description: 'رسالة إيمانية متجددة تريح القلب', icon: 'Sparkles' },
  { id: 'dailyWird', label: 'الورد اليومي واستكمال القراءة', description: 'أذكار الصباح والمساء والتقدم', icon: 'BookOpen' },
  { id: 'heroVerse', label: 'آية السكينة والتدبر', description: 'آية قرآنية مختارة مع الترجمة', icon: 'Book' },
  { id: 'dailyDhikr', label: 'ذكر اليوم مع العداد التفاعلي', description: 'ذكر مختار للتسبيح اليومي', icon: 'Heart' },
  { id: 'categoryGrid', label: 'أقسام الأذكار والسبحة', description: 'أذكار بعد الصلاة والنوم والأدعية', icon: 'Grid' },
  { id: 'hadithSpotlight', label: 'حديث اليوم النبوي', description: 'حديث شريف موثق من صحيح السنة', icon: 'Award' },
  { id: 'suggestedVideos', label: 'مرئيات إسلامية مختارة', description: 'مقاطع وتلاوات هادئة', icon: 'Video' },
];

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  completed: false,
  skipped: false,
  currentStep: 0,
  completedAt: null,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  displayName: '',
  homeLayout: DEFAULT_HOME_LAYOUT,
  disabledHomeCards: [],
};

export function getStoredOnboardingState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    if (raw) {
      return { ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed reading onboarding state:', e);
  }
  return DEFAULT_ONBOARDING_STATE;
}

export function saveStoredOnboardingState(state: OnboardingState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sakinah:onboarding-changed', { detail: state }));
    }
  } catch (e) {
    console.warn('Failed saving onboarding state:', e);
  }
}

export function getStoredUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER_PREFERENCES,
        ...parsed,
        homeLayout: parsed.homeLayout || DEFAULT_HOME_LAYOUT,
        disabledHomeCards: parsed.disabledHomeCards || [],
      };
    }
  } catch (e) {
    console.warn('Failed reading user preferences:', e);
  }
  return DEFAULT_USER_PREFERENCES;
}

export function saveStoredUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sakinah:preferences-changed', { detail: prefs }));
    }
  } catch (e) {
    console.warn('Failed saving user preferences:', e);
  }
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(displayName?: string): void {
  const current = getStoredOnboardingState();
  saveStoredOnboardingState({
    ...current,
    completed: true,
    skipped: false,
    completedAt: new Date().toISOString(),
  });

  if (displayName !== undefined) {
    const prefs = getStoredUserPreferences();
    saveStoredUserPreferences({ ...prefs, displayName });
  }
}

/**
 * Skip onboarding (can be resumed later)
 */
export function skipOnboarding(): void {
  const current = getStoredOnboardingState();
  saveStoredOnboardingState({
    ...current,
    completed: false,
    skipped: true,
  });
}

/**
 * Restart setup without deleting prayer history or logs
 */
export function restartOnboarding(): void {
  saveStoredOnboardingState({
    completed: false,
    skipped: false,
    currentStep: 0,
    completedAt: null,
  });
}

/**
 * Reset application settings to default (homeLayout, notification prefs, typography)
 * Keeps prayer history, logs, streaks intact.
 */
export function resetSettingsToDefaults(): void {
  saveStoredUserPreferences(DEFAULT_USER_PREFERENCES);
  prayerRepository.saveSettings(DEFAULT_USER_SETTINGS);
}

/**
 * Full application local reset (Clears all local storage, logs, settings, cache)
 * Prompts user if pending sync items exist.
 */
export function fullLocalAppReset(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    // Reinitialize baseline default state
    saveStoredOnboardingState({
      completed: false,
      skipped: false,
      currentStep: 0,
      completedAt: null,
    });
    saveStoredUserPreferences(DEFAULT_USER_PREFERENCES);
    prayerRepository.saveSettings(DEFAULT_USER_SETTINGS);
  } catch (e) {
    console.warn('Failed resetting full app:', e);
  }
}
