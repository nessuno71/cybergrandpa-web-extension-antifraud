# Libraries and Services Instructions

Patterns for core services and libraries in the CyberGrandpa extension.

## Core Services Architecture

### URL Service (`urls-service.ts`)

Central blocklist management using @webext-core/proxy-service:

- Uses `registerProxyService()` to expose methods across all contexts
- Methods: `count()`, `getRows(limit, offset)`, `seek(url)`, `upsert(base64string)`
- Stores compressed base64 blocklist in WXT storage
- Decompresses and parses on read using stream utilities
- Keeps array in memory for fast lookups

### Database Initialization (`init-db.ts`)

Blocklist sync orchestration:

- Fetches blocklist from `https://hblock.molinero.dev/hosts`
- Converts stream to base64 and stores via `urlService.upsert()`
- Uses `browser.alarms` API for periodic sync
- Self-starts 500ms after background script loads

### Web Blocking (`web-blocking.ts`)

Real-time URL interception:

- Listens to both `webNavigation.onBeforeNavigate` (full page loads) and
  `webNavigation.onHistoryStateUpdated` (SPA/`history.pushState` route changes) with a shared handler,
  for outermost frames only
- Checks URL against blocklist via `urlService.seek()`
- Closes tab immediately if URL is blocked
- Only monitors URLs matching `CONFIG_LOCAL_URL_PATTERN`

Note: this only covers hard-blocking (force-closing the tab). The in-page overlay warning shown to the
user for real-time protection lives in `content.ts` + `overlay-loading-app.svelte`, since it needs to
run inside the page itself and reacts to the same SPA navigations via `wxt:locationchange`.

### Storage (`store.ts`)

Persistent settings management:

- Creates typed stores using `createStore()` wrapper
- Stores: `storeProtectionEnabled`, `storeRealtimeEnabled`, `storeScanning`, etc.
- Uses WXT storage with `local:` or `sync:` prefixes

## Service Registration Pattern

```typescript
// In background.ts
registerProxyService('urlService', urlServiceInstance);

// In other contexts
const urlService = getProxyService('urlService');
await urlService.count();
```

## Data Flow

1. **Startup**: `background.ts` registers `urlService` → `initDb()` fetches blocklist → compresses as base64 → stores in WXT storage → `urlService` decompresses to memory array
2. **Blocking**: `initWebBlocking()` listens to `webNavigation.onBeforeNavigate` → checks URL via `urlService.seek()` → closes tab if blocked
3. **Communication**: `@webext-core/proxy-service` exposes `urlService` to all contexts → messages forwarded via `forwardMessageToCss()`

## Storage Strategy

- Use WXT storage API with local storage
- Compressed URL data using streams and base64 encoding
- Proxy service for cross-context data access
- Real-time updates across all contexts

## Configuration Constants

All configuration lives in `src/config.ts`:

- `STORAGE_DB_URLS` - Storage key for compressed blocklist
- `STREAM_URL` - Blocklist source URL
- `CONFIG_LOCAL_URL_PATTERN` - URL patterns to monitor
- `CONFIG_LOCAL_URL_MATCHES` - Regex to exclude browser internal URLs
