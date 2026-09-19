import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline, showRestoredNotice, syncStatus, syncNow } = useNetworkStatus();

  if (isOnline && !showRestoredNotice && syncStatus.pendingCount === 0) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto animate-fade-in"
      dir="rtl"
    >
      {!isOnline ? (
        /* Offline State Banner */
        <div className="p-3 sm:px-4 rounded-2xl bg-stone-900/95 text-sand-50 dark:bg-night-850/95 dark:text-night-text border border-stone-700/60 dark:border-night-border backdrop-blur-md shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <WifiOff className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="font-bold">تعمل الآن بدون اتصال بالإنترنت</p>
              <p className="text-[11px] text-stone-300 dark:text-night-muted">
                مواقيتك وتسجيلات صلواتك محفوظة محلياً
              </p>
            </div>
          </div>
          {syncStatus.pendingCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold shrink-0">
              {syncStatus.pendingCount} بالانتظار
            </span>
          )}
        </div>
      ) : showRestoredNotice ? (
        /* Restored Connection Notice */
        <div className="p-3 sm:px-4 rounded-2xl bg-emerald-950/95 text-emerald-100 border border-emerald-700/60 backdrop-blur-md shadow-lg flex items-center gap-2.5 text-xs">
          <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="font-bold">تم استعادة الاتصال بالإنترنت</p>
            <p className="text-[11px] text-emerald-200/80">جاري مزامنة بياناتك تلقائياً</p>
          </div>
        </div>
      ) : syncStatus.pendingCount > 0 ? (
        /* Pending Sync Changes Banner */
        <div className="p-3 sm:px-4 rounded-2xl bg-white/95 dark:bg-night-850/95 text-stone-800 dark:text-night-text border border-sand-300/80 dark:border-night-border backdrop-blur-md shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-gold-500 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatus.pendingCount} تعديلات بانتظار المزامنة</span>
          </div>
          <button
            onClick={() => syncNow()}
            disabled={syncStatus.isSyncing}
            className="px-2.5 py-1 rounded-xl bg-islamic-800 text-sand-50 dark:bg-gold-400 dark:text-islamic-950 text-[11px] font-bold cursor-pointer transition-all"
          >
            {syncStatus.isSyncing ? 'جاري...' : 'مزامنة الآن'}
          </button>
        </div>
      ) : null}
    </aside>
  );
};
