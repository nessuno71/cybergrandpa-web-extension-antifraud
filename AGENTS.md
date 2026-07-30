# AGENTS.md

Instructions for AI coding agents working on the CyberGrandpa cross-browser extension.

## Project Overview

Cross-browser anti-fraud web extension that blocks malicious URLs using a distributed blocklist system. Built with WXT 0.20.15, Svelte 5.50.1, and TypeScript in strict mode.

## Stack

- **Framework**: WXT 0.20.15 (Web Extension Framework)
- **Frontend**: Svelte 5.50.1 with runes (`$state`, `$derived`, `$effect`)
- **Styling**: SASS/SCSS, PostCSS with rem-to-px
- **Database**: LokiJS (in-memory)
- **Communication**: @webext-core/proxy-service
- **i18n**: @wxt-dev/i18n (28 languages)
- **Package Manager**: Bun (never use npm or yarn)

## Commands

```bash
# Development
bun dev              # Chrome dev server with hot reload
bun dev:firefox      # Firefox dev server
bun build            # Production build (Chrome)
bun build:firefox    # Production build (Firefox)
bun zip              # Create Chrome distribution ZIP
bun zip:firefox      # Create Firefox distribution ZIP

# Code Quality
bun lint             # Run Prettier + ESLint
bun format           # Format with Prettier
bun check            # Svelte type checking
bun check:watch      # Svelte type checking (watch mode)

# Setup
bun install          # Install dependencies
bun postinstall      # Prepare WXT (run after dependency changes)
```

## Project Structure

```txt
src/
├── entrypoints/           # WXT entry points
│   ├── background.ts      # Service worker (registers urlService, handles lifecycle)
│   ├── content.ts         # Page scanning and UI injection
│   ├── close.content.ts   # Tab closing for blocked URLs
│   ├── popup/             # Browser action popup (HTML + Svelte)
│   ├── options/           # Settings page (HTML + Svelte)
│   └── wizard/            # Onboarding wizard (HTML + Svelte)
├── libs/                  # Core services
│   ├── urls-service.ts    # Blocklist management (proxy-service)
│   ├── init-db.ts         # Blocklist sync from hblock.molinero.dev
│   ├── web-blocking.ts    # Real-time URL interception
│   └── store.ts           # Persistent storage wrapper
├── components/            # Svelte 5 components
│   ├── button.svelte      # Base UI components
│   ├── modal.svelte
│   ├── toggle.svelte
│   ├── apps/              # App-specific components
│   └── icons/             # Icon components
├── utils/                 # Utilities
│   ├── stream.ts          # Stream processing for compressed data
│   ├── storage.ts         # Storage helpers
│   ├── messaging.ts       # Cross-context messaging
│   └── tabs.ts            # Tab management
├── config.ts              # Configuration constants
├── locales/               # i18n YAML files (28 languages)
└── styles/                # Global SCSS styles
```

## Architecture

### Data Flow

1. **Startup**: `background.ts` registers `urlService` → `initDb()` fetches blocklist → compresses as base64 → stores in WXT storage → `urlService` decompresses to memory array
2. **Blocking**: `initWebBlocking()` listens to `webNavigation.onBeforeNavigate` → checks URL via `urlService.seek()` → closes tab if blocked
3. **Communication**: `@webext-core/proxy-service` exposes `urlService` to all contexts → messages forwarded via `forwardMessageToCss()`

### Key Services

- **urlService** (`urls-service.ts`): Methods: `count()`, `getRows(limit, offset)`, `seek(url)`, `upsert(base64string)`. Uses proxy-service for cross-context access.
- **initDb** (`init-db.ts`): Fetches from `https://hblock.molinero.dev/hosts`, converts stream to base64, stores via `urlService.upsert()`. Uses `browser.alarms` for periodic sync.
- **initWebBlocking** (`web-blocking.ts`): Monitors `CONFIG_LOCAL_URL_PATTERN`, checks blocklist, closes malicious tabs immediately.

## Code Conventions

### Svelte 5 Runes Only

```svelte
<script lang="ts">
  // ✅ CORRECT: Use runes
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });

  // ❌ WRONG: Never use Svelte 4 syntax
  // let count = 0;
  // $: doubled = count * 2;
</script>
```

### TypeScript Strict Mode

- All code must use strict TypeScript typing
- Define interfaces for component props
- Use `@/` import alias for `src/`

### Storage Pattern

```typescript
// Use createStore() wrapper
export const storeEnabled = createStore<boolean>(true, 'local:protection');
```

### Messaging Pattern

```typescript
// Cross-context messages via proxy-service
const result = await urlService.seek('https://example.com');
```

## Testing

- Test both Chrome and Firefox builds: `bun build && bun build:firefox`
- Load unpacked from `.output/chrome-mv3/` (Chrome) or `.output/firefox-mv3/` (Firefox)
- Verify URL blocking with test malicious domains
- Check cross-context communication (popup ↔ background ↔ content)
- Validate i18n strings across languages

## Git Workflow

- Main branch: `main`
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Keep commits atomic and well-described

## Boundaries & Constraints

### Never Touch

- **Secrets**: Never commit API keys, tokens, or credentials
- **Production configs**: Don't modify `STREAM_URL` or `STORAGE_DB_URLS` without approval
- **Build outputs**: Don't commit `.output/`, `.wxt/`, or ZIP files
- **Lock files**: Don't commit `bun.lockb` unless updating dependencies

### Always Use

- **Svelte 5 runes**: Never suggest Svelte 4 syntax
- **Bun**: Never use `npm` or `yarn` commands
- **Strict TypeScript**: No `any` types without justification
- **Import alias**: Use `@/` not relative paths for src imports

### Security

- Validate all external data sources (blocklist URL)
- Use Content Security Policy appropriately
- Sanitize user inputs and external URLs
- Follow browser extension security best practices
- Implement proper permission scoping

## Internationalization

- YAML files in `src/locales/` (en.yml, de.yml, es.yml, etc.)
- 28 languages supported
- Access via `i18n.t('key')`
- Manifest uses `__MSG_key__` format
- Always add translations for user-facing text

## AI Instructions Files

This project uses the latest Windsurf documentation structure:

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

When updating patterns or architecture, update all relevant files to maintain consistency.

## Common Patterns

### Component Creation

```svelte
<script lang="ts">
  import type { ComponentProps } from '@/utils';

  interface Props {
    label: string;
    onClick?: () => void;
  }

  let { label, onClick }: Props = $props();
</script>

<button onclick={onClick}>
  {label}
</button>

<style lang="scss">
  button {
    color: var(--text-color-light);
  }
</style>
```

### Service Registration

```typescript
// In background.ts
registerProxyService('urlService', urlServiceInstance);

// In other contexts
const urlService = getProxyService('urlService');
await urlService.count();
```

## Performance

- Blocklist stored compressed as base64 to minimize storage
- Stream-based decompression for large datasets
- In-memory array for fast URL lookups
- Minimize content script injection overhead

## When in Doubt

1. Check `CLAUDE.md` for detailed architecture documentation
2. Review `.cursorrules` for component patterns
3. Look at existing similar files before creating new ones
4. Ask before making architectural changes
5. Test both browsers before submitting changes

---

**Note**: This file follows the AGENTS.md standard stewarded by the Agentic AI Foundation under the Linux Foundation. Keep it ≤ 150 lines when possible. For detailed architecture, see `CLAUDE.md`.
