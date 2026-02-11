---
title: Global Project Rules
description: Core development commands and workflows
always: true
---

# Global Development Rules

## Package Manager

- **Always use `bun`** - never use `npm` or `yarn`
- Run `bun postinstall` after dependency changes to prepare WXT

## Development Commands

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
```

## Git Workflow

- Main branch: `main`
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Keep commits atomic and well-described

## Browser Launcher Configuration

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

## Build Outputs

Never commit:

- `.output/`
- `.wxt/`
- ZIP files
- `bun.lockb` (unless updating dependencies)
