# @vizr/browser

> Zero-config browser analytics SDK for [Vizr](https://vizr.app) — one script tag, AI-powered insights.

## Install

```bash
npm install @vizr/browser
```

Or via script tag (no bundler needed):

```html
<script src="https://cdn.vizr.app/v1/vizr.js" data-site-id="vzr_your_site_id"></script>
```

## Quick Start

```ts
import { init, track, identify } from '@vizr/browser';

// Initialize once (e.g. in main.ts)
init({ siteId: 'vzr_your_site_id' });

// Track events
track('upgrade_clicked', { plan: 'pro', source: 'header' });

// Identify users
identify('user_123', { name: 'Emma Wilson', email: 'emma@example.com', plan: 'pro' });

// Track page view manually (auto-called on init)
page({ section: 'pricing' });

// Reset on logout
reset();
```

## API

### `init(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `siteId` | `string` | **required** | Your Vizr site ID (`vzr_xxx`) |
| `host` | `string` | `https://vizr.app` | Custom host if self-hosting |
| `debug` | `boolean` | `false` | Log events to console |
| `autoPageview` | `boolean` | `true` | Track page views automatically |
| `sessionTimeout` | `number` | `30` | Session timeout in minutes |

### `track(eventName, properties?)`
Track a custom event.

### `identify(userId, traits?)`
Associate the current anonymous session with a known user ID.

### `page(properties?)`
Track a page view manually. Called automatically on init and SPA navigation.

### `reset()`
Clear user identity and session (call on logout).

## SPA Support
Navigation via `history.pushState` and `popstate` events is tracked automatically.

## License
MIT — [vizr.app](https://vizr.app)
