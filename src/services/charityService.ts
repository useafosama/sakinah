import {
  GoodDeedType,
  GoodDeedOption,
  GoodDeedRecord,
  CharityReminderPreset,
  CharitySettings,
  CharityWeeklySummary,
  SecretDeedIdea,
} from '../types/charity';
import { prayerNotificationService } from './prayerNotificationService';

const STORAGE_KEYS = {
  SETTINGS: 'sakinah_charity_settings_v1',
  DEEDS: 'sakinah_good_deeds_v1',
  LAST_MSG_INDEX: 'sakinah_charity_last_msg_idx_v1',
};

export const DEFAULT_CHARITY_SETTINGS: CharitySettings = {
  enabled: true,
  reminderPreset: 'after_asr',
  reminderTime: '16:30',
  notificationsEnabled: true,
  lastReminderDate: null,
  snoozedUntil: null,
  lastLoggedDate: null,
};

export const CHARITY_PRESET_TIMES: Record<CharityReminderPreset, { label: string; time: string; icon: string }> = {
  after_fajr: { label: 'بعد الفجر', time: '05:30', icon: '🌅' },
  morning: { label: 'صباحاً', time: '09:00', icon: '☀️' },
  after_asr: { label: 'بعد العصر (موصى به)', time: '16:30', icon: '🌇' },
  evening: { label: 'مساءً', time: '20:30', icon: '🌙' },
  custom: { label: 'وقت مخصص', time: '17:00', icon: '⏰' },
};

export const GOOD_DEED_OPTIONS: GoodDeedOption[] = [
  { id: 'charity', label: 'صدقة مالية', emoji: '💰', iconName: 'Coins', description: 'التصدق بالمال لوجه الله تعالى ولو بقليل' },
  { id: 'feeding', label: 'إطعام طعام', emoji: '🍞', iconName: 'Utensils', description: 'إطعام مسكين، إفطار صائم، أو تقديم وجبة' },
  { id: 'water', label: 'سقي ماء', emoji: '💧', iconName: 'Droplet', description: 'سقي إنسان أو وضع ماء لحيوان أو طير' },
  { id: 'helping', label: 'مساعدة شخص', emoji: '🤝', iconName: 'HandHeart', description: 'قضاء حاجة، إعانة محتاج، أو جبر خاطر' },
  { id: 'general_good', label: 'عمل خير ومعروف', emoji: '❤️', iconName: 'Heart', description: 'تبسم، كلمة طيبة، أو إماطة أذى عن الطريق' },
  { id: 'animal_feeding', label: 'إطعام حيوان', emoji: '🐈', iconName: 'Cat', description: 'الرأفة بالحيوان وإطعامه وسقياه' },
  { id: 'parents', label: 'بر الوالدين وصلة الرحم', emoji: '👨‍👩‍👦', iconName: 'Users', description: 'إحسان لوالديك، تفقدهم، أو صلة رحمك' },
  { id: 'other', label: 'شيء آخر من الخير', emoji: '✨', iconName: 'Sparkles', description: 'أي عمل صالح يبتغي به وجه الله تعالى' },
];

export const SECRET_DEED_IDEAS: SecretDeedIdea[] = [
  { id: 'sec-1', title: 'تصدق في الخفاء', description: 'تصدق بمبلغ بسيط إلكترونياً أو في صندوق دون أن يعلم بك أحد', type: 'charity' },
  { id: 'sec-2', title: 'ادعُ بظهر الغيب', description: 'ادعُ لثلاثة من أهلك وأصدقائك بظهر الغيب بما يحبون', type: 'general_good' },
  { id: 'sec-3', title: 'سقي طير أو قطة', description: 'ضع إناء ماء عذب على نافذتك أو أمام منزلك للحيوانات والطيور', type: 'water' },
  { id: 'sec-4', title: 'خدمة خفية للوالدين', description: 'قدم خدمة أو قضاء أمر لوالديك دون أن يطلبا ودون انتظار شكر', type: 'parents' },
  { id: 'sec-5', title: 'العفو والمسامحة', description: 'اعفُ عن شخص أساء إليك لوجه الله بنية طلب المغفرة والرضوان', type: 'general_good' },
  { id: 'sec-6', title: 'إماطة أذى', description: 'أزل حجراً أو زجاجاً أو قمامة عن طريق المارة سراً', type: 'general_good' },
  { id: 'sec-7', title: 'وجبة لعامل بسيط', description: 'اشترِ طعاماً أو ماءً بارداً وقدمه لعامل نظافة أو محتاج بابتسامة', type: 'feeding' },
  { id: 'sec-8', title: 'رسالة جبر خاطر مجهولة', description: 'ابعث برسالة طيبة أو دعاء يسعد قلباً مكروباً', type: 'helping' },
];

export const ROTATING_CHARITY_MESSAGES: string[] = [
  '🌱 تذكير لطيف من سكينة — هل جعلت اليوم فيه نصيبًا من الخير؟',
  '🤍 لا تجعل يومك يمر دون عمل خير، ولو بالقليل.',
  '🌱 وقت الخير — هل تستطيع أن تصنع أثرًا جميلًا اليوم؟',
  '💚 تذكير بسيط: الخير لا يحتاج أن يكون كبيرًا.',
  '🤍 هل فعلت اليوم شيئًا يسعد به غيرك؟',
  '💧 صنائع المعروف تقي مصارع السوء — بادر بعمل خير اليوم.',
  '✨ تبسمك في وجه أخيك صدقة.. ما هو خيرك اليوم؟',
  '🍞 أطعم طعاماً أو اسق ماءً أو تصدق.. واغنم بركة يومك.',
];

/**
 * Format Date to YYYY-MM-DD
 */
export function getTodayISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class CharityService {
  private static instance: CharityService;

  private constructor() {}

  public static getInstance(): CharityService {
    if (!CharityService.instance) {
      CharityService.instance = new CharityService();
    }
    return CharityService.instance;
  }

  // ----------------------------------------------------
  // Settings Management
  // ----------------------------------------------------
  public getSettings(): CharitySettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        return { ...DEFAULT_CHARITY_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed reading charity settings:', e);
    }
    return DEFAULT_CHARITY_SETTINGS;
  }

  public saveSettings(settings: Partial<CharitySettings>): CharitySettings {
    const current = this.getSettings();
    const updated: CharitySettings = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sakinah:charity-settings-changed', { detail: updated }));
      }
    } catch (e) {
      console.warn('Failed saving charity settings:', e);
    }
    return updated;
  }

  // ----------------------------------------------------
  // Deeds Management
  // ----------------------------------------------------
  public getDeeds(): GoodDeedRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEEDS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    } catch (e) {
      console.warn('Failed reading good deeds:', e);
    }
    return [];
  }

  public saveDeeds(deeds: GoodDeedRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEEDS, JSON.stringify(deeds));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sakinah:good-deeds-changed', { detail: deeds }));
      }
    } catch (e) {
      console.warn('Failed saving good deeds:', e);
    }
  }

  public logDeed(
    type: GoodDeedType,
    options?: {
      amount?: number | null;
      currency?: string;
      isSecret?: boolean;
      note?: string;
      title?: string;
      date?: string;
    }
  ): GoodDeedRecord {
    const deeds = this.getDeeds();
    const todayStr = options?.date || getTodayISODate();
    const optionInfo = GOOD_DEED_OPTIONS.find((o) => o.id === type);

    const record: GoodDeedRecord = {
      id: `deed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: todayStr,
      type,
      title: options?.title || optionInfo?.label || 'عمل خير',
      amount: options?.amount !== undefined ? options.amount : null,
      currency: options?.currency || 'ج.م',
      isSecret: options?.isSecret || false,
      note: options?.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    deeds.unshift(record);
    this.saveDeeds(deeds);

    // Update settings last logged date
    this.saveSettings({ lastLoggedDate: todayStr });

    return record;
  }

  public deleteDeed(id: string): void {
    const deeds = this.getDeeds();
    const filtered = deeds.filter((d) => d.id !== id);
    this.saveDeeds(filtered);
  }

  public getTodayDeeds(dateStr: string = getTodayISODate()): GoodDeedRecord[] {
    const deeds = this.getDeeds();
    return deeds.filter((d) => d.date === dateStr);
  }

  public hasLoggedToday(dateStr: string = getTodayISODate()): boolean {
    return this.getTodayDeeds(dateStr).length > 0;
  }

  // ----------------------------------------------------
  // Streak & Statistics
  // ----------------------------------------------------
  public calculateStreak(): { currentStreakDays: number; bestStreakDays: number } {
    const deeds = this.getDeeds();
    if (deeds.length === 0) {
      return { currentStreakDays: 0, bestStreakDays: 0 };
    }

    // Set of distinct dates with at least one deed
    const distinctDates = Array.from(new Set(deeds.map((d) => d.date))).sort().reverse();
    if (distinctDates.length === 0) {
      return { currentStreakDays: 0, bestStreakDays: 0 };
    }

    const todayStr = getTodayISODate();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getTodayISODate(yesterdayDate);

    // Check if streak is active (logged today or yesterday)
    let currentStreak = 0;
    const hasToday = distinctDates.includes(todayStr);
    const hasYesterday = distinctDates.includes(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = new Date(hasToday ? todayStr : yesterdayStr);
      while (true) {
        const iso = getTodayISODate(checkDate);
        if (distinctDates.includes(iso)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate best streak historically
    let bestStreak = currentStreak;
    let tempStreak = 0;
    const sortedDatesAsc = [...distinctDates].sort();
    
    for (let i = 0; i < sortedDatesAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDatesAsc[i - 1]);
        const curr = new Date(sortedDatesAsc[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }

    return { currentStreakDays: currentStreak, bestStreakDays: bestStreak };
  }

  public getWeeklySummary(): CharityWeeklySummary {
    const deeds = this.getDeeds();
    const now = new Date();
    
    // Past 7 days window
    const startDate = new Date();
    startDate.setDate(now.getDate() - 6);
    const startStr = getTodayISODate(startDate);
    const endStr = getTodayISODate(now);

    const weekDeeds = deeds.filter((d) => d.date >= startStr && d.date <= endStr);
    const distinctDays = new Set(weekDeeds.map((d) => d.date));

    const byType: Record<GoodDeedType, number> = {
      charity: 0,
      feeding: 0,
      water: 0,
      helping: 0,
      general_good: 0,
      animal_feeding: 0,
      parents: 0,
      other: 0,
    };

    let secretCount = 0;
    let charityTotal = 0;

    for (const d of weekDeeds) {
      if (byType[d.type] !== undefined) {
        byType[d.type]++;
      }
      if (d.isSecret) secretCount++;
      if (d.type === 'charity') charityTotal++;
    }

    const { currentStreakDays, bestStreakDays } = this.calculateStreak();

    return {
      startDate: startStr,
      endDate: endStr,
      totalCount: weekDeeds.length,
      byType,
      daysActiveCount: distinctDays.size,
      charityCount: charityTotal,
      secretDeedsCount: secretCount,
      currentStreakDays,
      bestStreakDays,
    };
  }

  // ----------------------------------------------------
  // Snooze & Notification Engine
  // ----------------------------------------------------
  public snoozeReminder(): void {
    const todayStr = getTodayISODate();
    const now = new Date();
    
    // Snooze for 1 hour, or until 20:30 if it's currently earlier in the day
    let snoozeTime = new Date(now.getTime() + 60 * 60 * 1000);
    const currentHour = now.getHours();
    
    // If snoozed in the afternoon (e.g. before 19:00), snooze until 20:30 (evening)
    if (currentHour < 19) {
      snoozeTime = new Date();
      snoozeTime.setHours(20, 30, 0, 0);
    }

    this.saveSettings({
      snoozedUntil: snoozeTime.toISOString(),
      lastReminderDate: todayStr,
    });
  }

  public getNextRotatingMessage(): string {
    let lastIdx = 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_MSG_INDEX);
      if (raw) lastIdx = parseInt(raw, 10) || 0;
    } catch {
      lastIdx = 0;
    }

    const nextIdx = (lastIdx + 1) % ROTATING_CHARITY_MESSAGES.length;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_MSG_INDEX, String(nextIdx));
    } catch {
      // Ignored
    }

    return ROTATING_CHARITY_MESSAGES[nextIdx];
  }

  public getRandomSecretIdea(): SecretDeedIdea {
    const idx = Math.floor(Math.random() * SECRET_DEED_IDEAS.length);
    return SECRET_DEED_IDEAS[idx];
  }

  public async checkAndTriggerReminder(): Promise<boolean> {
    const settings = this.getSettings();
    if (!settings.enabled || !settings.notificationsEnabled) return false;

    const todayStr = getTodayISODate();

    // If user has already logged a deed today, no reminder needed
    if (this.hasLoggedToday(todayStr)) return false;

    // Check if snoozed
    if (settings.snoozedUntil) {
      const snoozeDate = new Date(settings.snoozedUntil);
      if (new Date().getTime() < snoozeDate.getTime()) {
        return false; // Still within snooze window
      }
    }

    // Check if reminder was already sent today (and not snoozed past)
    if (settings.lastReminderDate === todayStr && !settings.snoozedUntil) {
      return false;
    }

    // Check time condition (e.g. 16:30)
    const [targetH, targetM] = (settings.reminderTime || '16:30').split(':').map(Number);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = targetH * 60 + targetM;

    // Fire if current time is at or after the target time (and within 3 hours)
    if (currentMinutes >= targetMinutes && currentMinutes <= targetMinutes + 180) {
      const msg = this.getNextRotatingMessage();
      await prayerNotificationService.showNotification('🌱 تذكير الخير والصدقة — سكينة', {
        body: msg,
        tag: `sakinah-charity-reminder-${todayStr}`,
        actions: [
          { action: 'log_charity', title: '🤍 سجّل عمل خير' },
          { action: 'snooze_charity', title: '⏰ لاحقاً' },
        ],
      });

      this.saveSettings({
        lastReminderDate: todayStr,
        snoozedUntil: null,
      });
      return true;
    }

    return false;
  }
}

export const charityService = CharityService.getInstance();
