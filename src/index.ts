export interface VizrConfig {
  siteId: string;
  host?: string;
  debug?: boolean;
  autoPageview?: boolean;
  sessionTimeout?: number; // minutes, default 30
}

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface UserTraits {
  name?: string;
  email?: string;
  [key: string]: string | number | boolean | null | undefined;
}

class VizrClient {
  private config: Required<VizrConfig>;
  private queue: Array<() => void> = [];
  private initialized = false;

  constructor(config: VizrConfig) {
    this.config = {
      host: 'https://vizr.app',
      debug: false,
      autoPageview: true,
      sessionTimeout: 30,
      ...config,
    };
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) console.log('[Vizr]', ...args);
  }

  private getAnonymousId(): string {
    const key = '__vzr_anon';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  }

  private getSessionId(): string {
    const key = '__vzr_sess';
    const tsKey = '__vzr_sess_ts';
    const now = Date.now();
    const existing = sessionStorage.getItem(key);
    const lastTs = parseInt(sessionStorage.getItem(tsKey) ?? '0', 10);

    if (existing && now - lastTs < this.config.sessionTimeout * 60 * 1000) {
      sessionStorage.setItem(tsKey, String(now));
      return existing;
    }

    const id = 'sess_' + Math.random().toString(36).slice(2) + now.toString(36);
    sessionStorage.setItem(key, id);
    sessionStorage.setItem(tsKey, String(now));
    return id;
  }

  private getUserId(): string | null {
    return localStorage.getItem('__vzr_uid');
  }

  private async send(payload: Record<string, unknown>): Promise<void> {
    const body = JSON.stringify({
      site_id: this.config.siteId,
      anonymous_id: this.getAnonymousId(),
      session_id: this.getSessionId(),
      user_id: this.getUserId(),
      url: window.location.href,
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      received_at: new Date().toISOString(),
      ...payload,
    });

    const url = `${this.config.host}/api/v1/ingest`;
    this.log('track', payload);

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      }
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    } catch (err) {
      this.log('send error', err);
    }
  }

  /**
   * Track a custom event.
   * @example vizr.track('upgrade_clicked', { plan: 'pro', source: 'header' })
   */
  track(eventName: string, properties: EventProperties = {}): void {
    this.send({ event_name: eventName, properties });
  }

  /**
   * Identify the current user.
   * @example vizr.identify('user_123', { name: 'Emma Wilson', email: 'emma@example.com', plan: 'pro' })
   */
  identify(userId: string, traits: UserTraits = {}): void {
    localStorage.setItem('__vzr_uid', String(userId));
    this.send({ event_name: '$identify', user_id: String(userId), properties: traits });
  }

  /**
   * Track a page view. Called automatically on init and SPA navigation.
   * @example vizr.page({ section: 'pricing' })
   */
  page(properties: EventProperties = {}): void {
    this.send({
      event_name: '$page_viewed',
      properties: {
        path: window.location.pathname,
        title: document.title,
        search: window.location.search || undefined,
        hash: window.location.hash || undefined,
        ...properties,
      },
    });
  }

  /**
   * Clear the current user and session (e.g. on logout).
   */
  reset(): void {
    localStorage.removeItem('__vzr_uid');
    localStorage.removeItem('__vzr_anon');
    sessionStorage.removeItem('__vzr_sess');
    sessionStorage.removeItem('__vzr_sess_ts');
    this.log('reset');
  }

  /** @internal */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Flush queued calls
    this.queue.forEach(fn => fn());
    this.queue = [];

    // Auto pageview
    if (this.config.autoPageview) {
      this.page();

      // SPA navigation support
      const orig = history.pushState.bind(history);
      history.pushState = (...args) => {
        orig(...args);
        this.page();
      };
      window.addEventListener('popstate', () => this.page());
    }
  }
}

let instance: VizrClient | null = null;

/**
 * Initialize Vizr with your site ID.
 *
 * @example
 * import { init } from '@vizr/browser';
 * init({ siteId: 'vzr_your_site_id' });
 */
export function init(config: VizrConfig): VizrClient {
  instance = new VizrClient(config);
  instance.init();
  return instance;
}

/**
 * Track a custom event.
 */
export function track(eventName: string, properties?: EventProperties): void {
  instance?.track(eventName, properties);
}

/**
 * Identify the current user with an ID and optional traits.
 */
export function identify(userId: string, traits?: UserTraits): void {
  instance?.identify(userId, traits);
}

/**
 * Track a page view manually (auto-called on init and navigation by default).
 */
export function page(properties?: EventProperties): void {
  instance?.page(properties);
}

/**
 * Clear the current user session (call on logout).
 */
export function reset(): void {
  instance?.reset();
}

export { VizrClient };
export default { init, track, identify, page, reset };
