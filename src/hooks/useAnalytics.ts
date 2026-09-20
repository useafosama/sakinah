import { useEffect } from 'react';
import { analytics } from '../services/analytics/tracker';
import { PageType } from '../types';
import { AnalyticsEventName } from '../types/analytics';

export function useAnalytics(currentPage?: PageType) {
  useEffect(() => {
    if (currentPage) {
      analytics.page(`/${currentPage === 'home' ? '' : currentPage}`);
    }
  }, [currentPage]);

  const trackEvent = (
    eventName: AnalyticsEventName,
    metadata?: Record<string, string | number | boolean | null | undefined>
  ) => {
    analytics.track(eventName, metadata);
  };

  return {
    trackEvent,
    trackPage: (path: string, meta?: Record<string, string | number | boolean | null | undefined>) =>
      analytics.page(path, meta)
  };
}
