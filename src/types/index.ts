export type PageType = 'home' | 'adhkar' | 'hadith' | 'favorites' | 'sources';

export type AdhkarCategory = 'morning' | 'evening' | 'after_prayer' | 'general' | 'sleep';

export interface Dhikr {
  id: string;
  category: AdhkarCategory;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  count: number;
  virtue?: string;
  reference: string;
}

export type HadithTopic = 'all' | 'sincerity' | 'character' | 'remembrance' | 'patience' | 'knowledge' | 'compassion' | 'prayer';

export interface Hadith {
  id: string;
  topic: HadithTopic;
  topicAr: string;
  topicEn: string;
  narratorAr: string;
  narratorEn: string;
  arabic: string;
  english: string;
  book: string;
  bookEn: string;
  number: string;
  grade: string;
}

export interface QuranVerse {
  id: string;
  surahAr: string;
  surahEn: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
  theme: string;
}

export interface ReadingSettings {
  arabicFontSize: number; // 22 to 38
  showTranslation: boolean;
  showTransliteration: boolean;
  showVirtue: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface LastPosition {
  category: AdhkarCategory;
  dhikrId: string;
  updatedAt: number;
}

export interface DailyMessage {
  id: string;
  type: 'quran' | 'hadith' | 'reminder';
  text: string;
  source: string;
  theme: string;
}

