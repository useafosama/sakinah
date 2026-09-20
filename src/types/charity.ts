export type GoodDeedType =
  | 'charity'
  | 'feeding'
  | 'water'
  | 'helping'
  | 'general_good'
  | 'animal_feeding'
  | 'parents'
  | 'other';

export interface GoodDeedOption {
  id: GoodDeedType;
  label: string;
  iconName: string;
  emoji: string;
  description: string;
}

export interface GoodDeedRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: GoodDeedType;
  title?: string;
  amount?: number | null;
  currency?: string;
  isSecret: boolean;
  note?: string;
  createdAt: string; // ISO 8601
}

export type CharityReminderPreset =
  | 'after_fajr'
  | 'morning'
  | 'after_asr'
  | 'evening'
  | 'custom';

export interface CharitySettings {
  enabled: boolean;
  reminderPreset: CharityReminderPreset;
  reminderTime: string; // "16:30" (HH:MM 24h)
  notificationsEnabled: boolean;
  lastReminderDate: string | null; // YYYY-MM-DD
  snoozedUntil: string | null; // ISO 8601 timestamp
  lastLoggedDate: string | null; // YYYY-MM-DD
}

export interface CharityWeeklySummary {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalCount: number;
  byType: Record<GoodDeedType, number>;
  daysActiveCount: number;
  charityCount: number;
  secretDeedsCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
}

export interface SecretDeedIdea {
  id: string;
  title: string;
  description: string;
  type: GoodDeedType;
}
