export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  currentStep: number;
  completedAt: string | null;
}

export type HomeCardId =
  | 'prayerTimes'
  | 'charityToday'
  | 'dailyMessage'
  | 'dailyWird'
  | 'heroVerse'
  | 'dailyDhikr'
  | 'categoryGrid'
  | 'hadithSpotlight'
  | 'suggestedVideos';

export interface HomeCardOption {
  id: HomeCardId;
  label: string;
  description: string;
  iconName: string;
}

export interface UserPreferences {
  displayName: string;
  homeLayout: HomeCardId[];
  disabledHomeCards: HomeCardId[];
}
