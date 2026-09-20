import { AnalyticsEventName, AnalyticsEventPayload } from '../../types/analytics';

const VISITOR_ID_KEY = 'sakinah_vid_v1';
const SESSION_ID_KEY = 'sakinah_sid_v1';
const SESSION_LAST_ACTIVE_KEY = 'sakinah_slast_v1';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const TRACK_ENDPOINT = '/api/track';

class AnalyticsTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private queue: AnalyticsEventPayload[] = [];
  private flushTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    try {
      this.visitorId = this.getOrCreateVisitorId();
      this.sessionId = this.getOrCreateSessionId();
      this.setupHeartbeat();
      this.setupUnloadFlush();
    } catch {
      // Fail silently to never break the application
    }
  }

  private getOrCreateVisitorId(): string {
    try {
      let vid = localStorage.getItem(VISITOR_ID_KEY);
      if (!vid || vid.length < 10) {
        vid = this.generateUUID();
        localStorage.setItem(VISITOR_ID_KEY, vid);
      }
      return vid;
    } catch {
      return this.generateUUID();
    }
  }

  private getOrCreateSessionId(): string {
    try {
      const now = Date.now();
      const lastActiveStr = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
      let sid = localStorage.getItem(SESSION_ID_KEY);

      const isExpired = !lastActiveStr || now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS;

      if (!sid || isExpired) {
        sid = this.generateUUID();
        localStorage.setItem(SESSION_ID_KEY, sid);
      }

      localStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
      return sid;
    } catch {
      return this.generateUUID();
    }
  }

  private touchSession() {
    try {
      const now = Date.now();
      const lastActiveStr = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
      if (lastActiveStr && now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS) {
        // Session expired, create new session
        this.sessionId = this.generateUUID();
        localStorage.setItem(SESSION_ID_KEY, this.sessionId);
      }
      localStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
    } catch {
      // Ignore
    }
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
    return 'Other';
  }

  private detectOS(): string {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other';
  }

  private getReferrer(): string {
    if (typeof document === 'undefined') return '';
    const ref = document.referrer;
    if (!ref) return 'Direct';
    try {
      const url = new URL(ref);
      if (url.hostname === window.location.hostname) {
        return 'Direct';
      }
      return url.hostname;
    } catch {
      return ref.slice(0, 100);
    }
  }

  /**
   * Track an arbitrary analytics event
   */
  public track(eventName: AnalyticsEventName, metadata?: Record<string, string | number | boolean | null | undefined>) {
    if (typeof window === 'undefined') return;

    try {
      this.touchSession();

      // Clean metadata: omit undefined, null, and make sure sensitive data is excluded
      const cleanMeta: Record<string, string | number | boolean> = {};
      if (metadata) {
        for (const [k, v] of Object.entries(metadata)) {
          // Strictly prevent charity amount or personal info
          if (k.toLowerCase().includes('amount') || k.toLowerCase().includes('money') || k.toLowerCase().includes('email') || k.toLowerCase().includes('phone')) {
            continue;
          }
          if (v !== undefined && v !== null) {
            cleanMeta[k] = v;
          }
        }
      }

      const payload: AnalyticsEventPayload = {
        eventName,
        path: window.location.pathname || '/',
        metadata: Object.keys(cleanMeta).length > 0 ? cleanMeta : undefined,
        visitorId: this.visitorId || this.getOrCreateVisitorId(),
        sessionId: this.sessionId || this.getOrCreateSessionId(),
        referrer: this.getReferrer(),
        deviceType: this.detectDeviceType(),
        browser: this.detectBrowser(),
        os: this.detectOS(),
        timestamp: new Date().toISOString()
      };

      this.enqueue(payload);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Track a page view
   */
  public page(path: string, metadata?: Record<string, string | number | boolean | null | undefined>) {
    this.track('page_view', { ...metadata, path });
  }

  private enqueue(payload: AnalyticsEventPayload) {
    this.queue.push(payload);

    if (this.queue.length >= 5) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(() => this.flush(), 1000);
    }
  }

  private flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    const body = JSON.stringify({ events: batch });

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        const success = navigator.sendBeacon(TRACK_ENDPOINT, blob);
        if (!success) {
          this.fallbackFetch(body);
        }
      } else {
        this.fallbackFetch(body);
      }
    } catch {
      this.fallbackFetch(body);
    }
  }

  private fallbackFetch(body: string) {
    try {
      fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => {
        // Silently catch network errors
      });
    } catch {
      // Silently catch exceptions
    }
  }

  private setupHeartbeat() {
    if (typeof window === 'undefined') return;
    // Send heartbeat every 3 minutes when page is active to keep session duration accurate
    window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.track('heartbeat');
      }
    }, 3 * 60 * 1000);
  }

  private setupUnloadFlush() {
    if (typeof window === 'undefined') return;
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }
}

export const analytics = new AnalyticsTracker();
