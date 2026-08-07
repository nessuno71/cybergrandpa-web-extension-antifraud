# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cross-browser anti-fraud web extension built with WXT framework and Svelte 5. Blocks malicious URLs using a distributed blocklist system with real-time protection.

## Core Directives

- **Framework**: WXT (Web Extension Framework) with TypeScript
- **Frontend**: Svelte 5 with runes syntax
- **Styling**: SASS/SCSS with modular architecture
- **Storage**: WXT storage API with compressed in-memory URL data
- **Communication**: @webext-core/proxy-service v2.0.0 for cross-context messaging
- **Internationalization**: @wxt-dev/i18n with YAML locale files
- **Package Manager**: Bun v1.3.4 (never use npm or yarn)

## Documentation Structure

This project uses the latest Windsurf documentation structure with AGENTS.md files:

- **`AGENTS.md`**: Root fallback instructions for all AI assistants
- **`.cursorrules`**: Cursor IDE specific rules with detailed patterns
- **`CLAUDE.md`**: Claude Code comprehensive guidance
  - `global.md` - Development commands and workflows (always on)
  - `security.md` - Security best practices
  - `performance.md` - Performance guidelines
- **Directory-specific AGENTS.md**: Location-based instructions
  - `src/AGENTS.md` - Core development directives
  - `src/entrypoints/AGENTS.md` - WXT entrypoint patterns
  - `src/libs/AGENTS.md` - Service and library patterns
  - `src/components/AGENTS.md` - Svelte component guidelines
  - `src/utils/AGENTS.md` - Utility function patterns
- **`AGENTS.md`**: Root-level universal AI agent instructions

For Claude Code, refer to the most relevant AGENTS.md file based on the directory you're working in.

## Development Commands

### Build & Dev

- `bun dev` - Start dev server with hot reload (Chrome)
- `bun dev:firefox` - Start dev server for Firefox
- `bun build` - Production build for Chrome
- `bun build:firefox` - Production build for Firefox
- `bun zip` / `bun zip:firefox` - Create distribution ZIPs

### Code Quality

- `bun lint` - Run Prettier check + ESLint
- `bun format` - Format code with Prettier
- `bun check` - Svelte type checking
- `bun check:watch` - Svelte type checking (watch mode)

### Package Management

- `bun postinstall` - Run after dependency changes to prepare WXT

## Architecture Overview

### Extension Entrypoints (`src/entrypoints/`)

The extension uses WXT's entrypoint system:

- **`background.ts`** - Service worker that orchestrates the extension:
  - Registers `urlService` via proxy-service for cross-context access
  - Handles `onInstalled`, `onStartup`, `onSuspend` lifecycle events
  - Opens wizard on first install
  - Forwards messages between contexts via `forwardMessageToCss()`
  - Initializes database (`initDb()`) and web blocking (`initWebBlocking()`)

- **`content.ts`** - Content script for page scanning and UI injection

- **`popup/`** - Browser action popup (index.html + main.ts + popup.svelte)

- **`options/`** - Extension settings page (index.html + main.ts + options.svelte)

- **`wizard/`** - Onboarding wizard for new users (index.html + main.ts + wizard.svelte)

### Core Services (`src/libs/`)

**URL Service (`urls-service.ts`)**: Central blocklist management

- Uses `@webext-core/proxy-service` to expose methods across all contexts
- Methods: `count()`, `getRows(limit, offset)`, `seek(url)`, `upsert(base64string)`
- Stores compressed base64 blocklist in WXT storage
- Decompresses and parses on read using stream utilities
- Array kept in memory for fast lookups

**Database Initialization (`init-db.ts`)**: Blocklist sync orchestration

- Fetches blocklist from `https://hblock.molinero.dev/hosts`
- Converts stream to base64 and stores via `urlService.upsert()`
- Uses `browser.alarms` API for periodic sync (see `checkAlarmState()`)
- Self-starts 500ms after background script loads

**Web Blocking (`web-blocking.ts`)**: Real-time URL interception

- Listens to `webNavigation.onBeforeNavigate` for outermost frames
- Checks URL against blocklist via `urlService.seek()`
- Closes tab immediately if URL is blocked
- Only monitors URLs matching `CONFIG_LOCAL_URL_PATTERN`

**Storage (`store.ts`)**: Persistent settings management

- Creates typed stores using `createStore()` wrapper
- Stores: `storeProtectionEnabled`, `storeRealtimeEnabled`, `storeScanning`, `storeOnBoardingCompleted`, etc.
- Uses WXT storage with `local:` or `sync:` prefixes

### Configuration (`src/config.ts`)

- `STORAGE_DB_URLS` - Storage key for compressed blocklist
- `STREAM_URL` - Blocklist source URL (hblock.molinero.dev/hosts)
- `CONFIG_LOCAL_URL_PATTERN` - URL patterns to monitor for blocking
- `CONFIG_LOCAL_URL_MATCHES` - Regex to exclude browser internal URLs

### Utilities (`src/utils/`)

Key utility functions:

- **Stream processing**: `GetStream`, `decompressReadableStream()`, `convertReadableStreamToString()` - Handle compressed blocklist data
- **Storage**: `createStore()` - Wrapper around WXT storage API
- **Messaging**: `forwardMessageToCss()` - Cross-context message forwarding
- **Tab management**: `activateTab()`, `getTabId()`
- **Parsing**: `getArrayFromString()` - Parse hosts file format

### Component Architecture (`src/components/`)

Reusable Svelte 5 components:

- Base UI: `button.svelte`, `modal.svelte`, `toggle.svelte`, `status.svelte`, `header.svelte`
- App components: `apps/overlay-loading-app.svelte`
- Icons: `icons/flat-cross-icon.svelte`

All components use Svelte 5 runes syntax. Each entrypoint (popup, options, wizard) has its own root component.

## Data Flow

1. **Extension Install/Startup**:
   - `background.ts` registers `urlService` and listens for lifecycle events
   - `initDb()` starts blocklist sync from external source
   - Blocklist compressed, base64-encoded, stored in WXT storage
   - `urlService` decompresses and keeps array in memory

2. **URL Blocking**:
   - `initWebBlocking()` listens to `webNavigation.onBeforeNavigate`
   - For each navigation, checks URL via `urlService.seek()`
   - If blocked, immediately closes the tab

3. **Cross-Context Communication**:
   - `@webext-core/proxy-service` exposes `urlService` methods to all contexts
   - Background script forwards messages via `forwardMessageToCss()`
   - Content scripts request scanning via runtime messages

## Technology Stack

- **Framework**: WXT 0.20.15 (web extension framework)
- **Frontend**: Svelte 5.50.1 with runes
- **Styling**: SASS/SCSS 1.97.3, PostCSS with rem-to-px conversion
- **Database**: WXT storage API (compressed base64 blocklist in memory)
- **Communication**: @webext-core/proxy-service 2.0.0
- **i18n**: @wxt-dev/i18n with YAML files (28 languages)
- **TypeScript**: 5.9.3, Strict mode enabled
- **Package Manager**: Bun 1.3.4
- **URL Blocking**: Uses compressed blocklist from hblock.molinero.dev/hosts
- **Real-time Scanning**: Monitors navigation and blocks malicious URLs
- **Cross-browser Support**: Manifest V3 compatible with Chrome and Firefox
- **Internationalization**: Multi-language support (28 languages)
- **Onboarding**: Wizard-based setup for new users
- **Fraud Detection**: Heuristic-based script analysis with tiered scanning

## Browser Permissions

Required in manifest:

- `activeTab`, `alarms`, `scripting`, `storage`, `tabs`
- `webNavigation`, `declarativeNetRequestWithHostAccess`
- `host_permissions`: `<all_urls>`

## Code Conventions

- TypeScript strict mode (`tsconfig.json` extends `.wxt/tsconfig.json`)
- Svelte 5 runes only (`$state`, `$derived`, `$effect`)
- SASS/SCSS for styling
- ESLint + Prettier for code quality
- Import aliases: `@/` maps to `src/`

## Internationalization

- YAML locale files in `src/locales/` (en.yml, de.yml, es.yml, fr.yml, it.yml, nl.yml, pt.yml)
- Supports 28 languages including: English, German, Spanish, French, Italian, Dutch, Portuguese, Arabic, Bulgarian, Czech, Danish, Finnish, Hindi, Croatian, Hungarian, Japanese, Korean, Norwegian, Polish, Romanian, Russian, Slovak, Swedish, Turkish, Ukrainian, Chinese (Simplified & Traditional)
- Access messages via `i18n.t('key')`
- Manifest strings use `__MSG_key__` format
- Default locale: `en`
- Messages accessed via `i18n.t()` function
- Manifest uses `__MSG_*__` format for localized strings

## Browser Launcher Customization

Create `web-ext.config.ts` in project root to customize browser paths:

```ts
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  binaries: {
    chrome: '/path/to/chrome',
    firefox: 'firefoxdeveloperedition',
  },
});
```

## Key Implementation Notes

- Blocklist is compressed and stored as base64 to minimize storage usage
- Stream-based decompression enables handling large blocklists
- Proxy service pattern allows background script to expose services to all contexts
- WXT automatically generates browser-specific manifests
- Content security policy allows `wasm-unsafe-eval` for extension pages
