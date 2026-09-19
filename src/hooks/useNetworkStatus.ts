import { useState, useEffect, useCallback } from 'react';
import { SyncStatusState } from '../types/prayer';
import { prayerRepository } from '../services/prayerRepository';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => prayerRepository.isOnline());
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(() =>
    prayerRepository.getSyncStatus()
  );

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      prayerRepository.syncPendingActions().then(() => {
        setSyncStatus(prayerRepository.getSyncStatus());
      });

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
      setSyncStatus(prayerRepository.getSyncStatus());
    };

    const handleSyncStatusChange = () => {
      setSyncStatus(prayerRepository.getSyncStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sakinah:sync-status-changed', handleSyncStatusChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sakinah:sync-status-changed', handleSyncStatusChange);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline) return;
    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      await prayerRepository.syncPendingActions();
    } finally {
      setSyncStatus(prayerRepository.getSyncStatus());
    }
  }, [isOnline]);

  return {
    isOnline,
    showRestoredNotice,
    syncStatus,
    syncNow,
  };
}
