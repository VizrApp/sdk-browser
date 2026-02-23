interface VizrConfig {
    siteId: string;
    host?: string;
    debug?: boolean;
    autoPageview?: boolean;
    sessionTimeout?: number;
}
interface EventProperties {
    [key: string]: string | number | boolean | null | undefined;
}
interface UserTraits {
    name?: string;
    email?: string;
    [key: string]: string | number | boolean | null | undefined;
}
declare class VizrClient {
    private config;
    private queue;
    private initialized;
    constructor(config: VizrConfig);
    private log;
    private getAnonymousId;
    private getSessionId;
    private getUserId;
    private send;
    /**
     * Track a custom event.
     * @example vizr.track('upgrade_clicked', { plan: 'pro', source: 'header' })
     */
    track(eventName: string, properties?: EventProperties): void;
    /**
     * Identify the current user.
     * @example vizr.identify('user_123', { name: 'Emma Wilson', email: 'emma@example.com', plan: 'pro' })
     */
    identify(userId: string, traits?: UserTraits): void;
    /**
     * Track a page view. Called automatically on init and SPA navigation.
     * @example vizr.page({ section: 'pricing' })
     */
    page(properties?: EventProperties): void;
    /**
     * Clear the current user and session (e.g. on logout).
     */
    reset(): void;
    /** @internal */
    init(): void;
}
/**
 * Initialize Vizr with your site ID.
 *
 * @example
 * import { init } from '@vizr/browser';
 * init({ siteId: 'vzr_your_site_id' });
 */
declare function init(config: VizrConfig): VizrClient;
/**
 * Track a custom event.
 */
declare function track(eventName: string, properties?: EventProperties): void;
/**
 * Identify the current user with an ID and optional traits.
 */
declare function identify(userId: string, traits?: UserTraits): void;
/**
 * Track a page view manually (auto-called on init and navigation by default).
 */
declare function page(properties?: EventProperties): void;
/**
 * Clear the current user session (call on logout).
 */
declare function reset(): void;

declare const _default: {
    init: typeof init;
    track: typeof track;
    identify: typeof identify;
    page: typeof page;
    reset: typeof reset;
};

export { type EventProperties, type UserTraits, VizrClient, type VizrConfig, _default as default, identify, init, page, reset, track };
