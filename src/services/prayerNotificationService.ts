import { getStoredUserSettings, saveStoredUserSettings } from './prayerStorage';

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
}

export class PrayerNotificationService {
  private static instance: PrayerNotificationService;

  private constructor() {}

  public static getInstance(): PrayerNotificationService {
    if (!PrayerNotificationService.instance) {
      PrayerNotificationService.instance = new PrayerNotificationService();
    }
    return PrayerNotificationService.instance;
  }

  public getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { isSupported: false, permission: 'denied' };
    }
    return {
      isSupported: true,
      permission: Notification.permission,
    };
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('التنبيهات غير مدعومة في هذا المتصفح');
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const settings = getStoredUserSettings();
      settings.notifications.enabled = true;
      saveStoredUserSettings(settings);
    }
    return permission;
  }

  public async showNotification(title: string, options?: Record<string, any>): Promise<void> {
    const status = this.getStatus();
    if (!status.isSupported || status.permission !== 'granted') {
      return;
    }

    const defaultOptions: Record<string, any> = {
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      dir: 'rtl',
      lang: 'ar',
      ...options,
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, defaultOptions as NotificationOptions);
          return;
        }
      }
      new Notification(title, defaultOptions as NotificationOptions);
    } catch (err) {
      console.warn('Failed to show notification:', err);
    }
  }

  public async sendTestNotification(): Promise<void> {
    await this.showNotification('🕌 تم تفعيل تنبيهات الصلاة بنجاح', {
      body: 'سيرسل لك موقع سكينة تذكيرات بمواقيت الصلاة حسب إعداداتك.',
      tag: 'sakinah-test-notification',
    });
  }

  public async notifyPrayerTime(prayerNameAr: string, time12: string): Promise<void> {
    await this.showNotification(`🕌 حان الآن وقت صلاة ${prayerNameAr}`, {
      body: `موعد الأذان والصلاة: ${time12}`,
      tag: `prayer-time-${prayerNameAr}`,
      requireInteraction: true,
      actions: [
        { action: 'log_prayed', title: '✓ سجلت الصلاة' },
        { action: 'view_prayer', title: 'فتح المواقيت' },
      ],
    });
  }

  public async notifyPrePrayerReminder(prayerNameAr: string, time12: string, minutes: number): Promise<void> {
    await this.showNotification(`⏰ اقترب موعد صلاة ${prayerNameAr}`, {
      body: `متبقي ${minutes} دقيقة على دخول الوقت (${time12})`,
      tag: `pre-prayer-${prayerNameAr}`,
    });
  }

  public async notifyPostPrayerUnlogged(prayerNameAr: string): Promise<void> {
    await this.showNotification(`🕌 تذكير: لم تسجل صلاة ${prayerNameAr} بعد`, {
      body: 'اضغط هنا لتسجيل صلاتك ومتابعة يومك في سكينة.',
      tag: `post-prayer-${prayerNameAr}`,
    });
  }
}

export const prayerNotificationService = PrayerNotificationService.getInstance();
