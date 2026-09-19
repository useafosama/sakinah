import {
  ObligatoryPrayerId,
  PrayerLogRecord,
  PrayerUserSettings,
  TheShiaPrayerResponse,
  CachedPrayerTimesMeta,
  PendingSyncAction,
  SyncStatusState
} from '../types/prayer';
import { DEFAULT_PRAYER_LOCATION } from './theShiaPrayerService';

const STORAGE_KEYS = {
  SETTINGS: 'sakinah_prayer_settings_v2',
  LOGS: 'sakinah_prayer_logs_v2',
  API_CACHE_PREFIX: 'sakinah_theshia_cache_v2_',
  SYNC_QUEUE: 'sakinah_prayer_sync_queue_v2',
  LAST_SYNC: 'sakinah_last_sync_timestamp_v2',
};

export const DEFAULT_USER_SETTINGS: PrayerUserSettings = {
  location: DEFAULT_PRAYER_LOCATION,
  calculationMethod: 'Jafari',
  notifications: {
    enabled: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    beforeMinutes: 10,
    postPrayerReminder: true,
    postPrayerMinutes: 20,
  },
  autoGeolocationOnStartup: false,
  showMidnightAndImsak: true,
};

type LogsMap = Record<string, Partial<Record<ObligatoryPrayerId, PrayerLogRecord>>>;

class PrayerRepository {
  private static instance: PrayerRepository;

  private constructor() {
    this.initNetworkListeners();
  }

  public static getInstance(): PrayerRepository {
    if (!PrayerRepository.instance) {
      PrayerRepository.instance = new PrayerRepository();
    }
    return PrayerRepository.instance;
  }

  // ----------------------------------------------------
  // Network & Sync Queue Listeners
  // ----------------------------------------------------
  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.syncPendingActions();
      this.notifySyncStatus();
    });

    window.addEventListener('offline', () => {
      this.notifySyncStatus();
    });
  }

  public isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  private notifyDataChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('sakinah:prayer-data-changed'));
  }

  private notifySyncStatus(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('sakinah:sync-status-changed'));
  }

  // ----------------------------------------------------
  // Settings Management
  // ----------------------------------------------------
  public getSettings(): PrayerUserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed,
          location: { ...DEFAULT_USER_SETTINGS.location, ...(parsed.location || {}) },
          notifications: { ...DEFAULT_USER_SETTINGS.notifications, ...(parsed.notifications || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed reading settings from storage:', e);
    }
    return DEFAULT_USER_SETTINGS;
  }

  public saveSettings(settings: PrayerUserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      this.notifyDataChange();
    } catch (e) {
      console.warn('Failed saving settings:', e);
    }
  }

  // ----------------------------------------------------
  // Prayer Logs Storage & Queries
  // ----------------------------------------------------
  public getAllLogs(): LogsMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed reading logs:', e);
    }
    return {};
  }

  public saveAllLogs(logs: LogsMap): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      this.notifyDataChange();
    } catch (e) {
      console.warn('Failed saving logs:', e);
    }
  }

  public getLogsForDate(dateStr: string): Partial<Record<ObligatoryPrayerId, PrayerLogRecord>> {
    const all = this.getAllLogs();
    return all[dateStr] || {};
  }

  public saveLog(
    dateStr: string,
    prayer: ObligatoryPrayerId,
    status: 'prayed_on_time' | 'prayed_late' | 'missed',
    scheduledTime: string = ''
  ): PrayerLogRecord {
    const all = this.getAllLogs();
    if (!all[dateStr]) {
      all[dateStr] = {};
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestamp = Date.now();
    const existing = all[dateStr][prayer];

    const record: PrayerLogRecord = {
      id: `${dateStr}_${prayer}`,
      date: dateStr,
      prayer,
      scheduledTime: scheduledTime || existing?.scheduledTime || timeString,
      loggedAt: timeString,
      status,
      syncStatus: this.isOnline() ? 'synced' : 'pending',
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    all[dateStr][prayer] = record;
    this.saveAllLogs(all);

    // Queue for sync
    this.enqueueSyncAction({
      id: `${record.id}_${timestamp}`,
      action: 'save_log',
      payload: {
        dateStr,
        prayer,
        status,
        scheduledTime: record.scheduledTime,
        updatedAt: timestamp,
      },
      timestamp,
      retryCount: 0,
    });

    return record;
  }

  public removeLog(dateStr: string, prayer: ObligatoryPrayerId): void {
    const all = this.getAllLogs();
    if (all[dateStr] && all[dateStr][prayer]) {
      const timestamp = Date.now();
      delete all[dateStr][prayer];
      if (Object.keys(all[dateStr]).length === 0) {
        delete all[dateStr];
      }
      this.saveAllLogs(all);

      this.enqueueSyncAction({
        id: `remove_${dateStr}_${prayer}_${timestamp}`,
        action: 'remove_log',
        payload: {
          dateStr,
          prayer,
          updatedAt: timestamp,
        },
        timestamp,
        retryCount: 0,
      });
    }
  }

  public clearAllLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      this.notifyDataChange();
    } catch (e) {
      console.warn('Failed clearing logs:', e);
    }
  }

  // ----------------------------------------------------
  // Sync Queue & Offline Synchronization
  // ----------------------------------------------------
  public getPendingActions(): PendingSyncAction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  private savePendingActions(actions: PendingSyncAction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(actions));
      this.notifySyncStatus();
    } catch {
      // ignore
    }
  }

  public enqueueSyncAction(action: PendingSyncAction): void {
    const queue = this.getPendingActions();
    // Avoid duplicates of the same prayer record action
    const filtered = queue.filter(
      (a) =>
        !(
          a.action === action.action &&
          a.payload.dateStr === action.payload.dateStr &&
          a.payload.prayer === action.payload.prayer
        )
    );
    filtered.push(action);
    this.savePendingActions(filtered);

    if (this.isOnline()) {
      // Automatically attempt sync in background
      setTimeout(() => this.syncPendingActions(), 100);
    }
  }

  public async syncPendingActions(): Promise<{ success: boolean; syncedCount: number }> {
    if (!this.isOnline()) {
      return { success: false, syncedCount: 0 };
    }

    const queue = this.getPendingActions();
    if (queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    // Process queued actions
    try {
      // Mark all local logs in memory as synced
      const allLogs = this.getAllLogs();
      for (const item of queue) {
        if (item.action === 'save_log' && item.payload.dateStr && item.payload.prayer) {
          const log = allLogs[item.payload.dateStr]?.[item.payload.prayer];
          if (log) {
            log.syncStatus = 'synced';
          }
        }
      }
      this.saveAllLogs(allLogs);

      // Clear sync queue
      this.savePendingActions([]);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
      this.notifySyncStatus();

      return { success: true, syncedCount: queue.length };
    } catch (err) {
      console.error('Failed syncing pending actions:', err);
      return { success: false, syncedCount: 0 };
    }
  }

  public getSyncStatus(): SyncStatusState {
    const queue = this.getPendingActions();
    let lastSyncedAt: number | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (raw) lastSyncedAt = parseInt(raw, 10);
    } catch {
      // ignore
    }

    return {
      isOnline: this.isOnline(),
      pendingCount: queue.length,
      lastSyncedAt,
      isSyncing: false,
      syncError: null,
    };
  }

  // ----------------------------------------------------
  // Cached Prayer Times with Rich Metadata
  // ----------------------------------------------------
  private getCacheKey(lat: number, lng: number, dateStr: string, method: string): string {
    return `${STORAGE_KEYS.API_CACHE_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateStr}`;
  }

  public getCachedPrayerTimes(
    lat: number,
    lng: number,
    dateStr: string,
    method: string
  ): { data: TheShiaPrayerResponse; meta: CachedPrayerTimesMeta } | null {
    try {
      const key = this.getCacheKey(lat, lng, dateStr, method);
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const cachedAt = parsed.cachedAt || Date.now();
      const ageMs = Date.now() - cachedAt;
      const isStale = ageMs > 24 * 60 * 60 * 1000;

      let humanAge = 'محفوظ محلياً';
      const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
      const ageMinutes = Math.floor(ageMs / (1000 * 60));

      if (ageHours >= 24) {
        humanAge = 'منذ أكثر من يوم';
      } else if (ageHours >= 1) {
        humanAge = `منذ ${ageHours} ${ageHours === 1 ? 'ساعة' : ageHours === 2 ? 'ساعتين' : 'ساعات'}`;
      } else if (ageMinutes >= 1) {
        humanAge = `منذ ${ageMinutes} دقيقة`;
      } else {
        humanAge = 'منذ قليل';
      }

      const meta: CachedPrayerTimesMeta = {
        source: 'TheShia',
        cachedAt,
        humanAge,
        date: dateStr,
        lat,
        lng,
        tz: parsed.data?.meta?.tz || '',
        method,
        isStale,
      };

      return {
        data: parsed.data,
        meta,
      };
    } catch {
      return null;
    }
  }

  public setCachedPrayerTimes(
    lat: number,
    lng: number,
    dateStr: string,
    method: string,
    data: TheShiaPrayerResponse
  ): void {
    try {
      const key = this.getCacheKey(lat, lng, dateStr, method);
      localStorage.setItem(
        key,
        JSON.stringify({
          cachedAt: Date.now(),
          data,
        })
      );
    } catch {
      // ignore
    }
  }
}

export const prayerRepository = PrayerRepository.getInstance();
