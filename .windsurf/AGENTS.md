# CyberGrandpa Extension - Root Instructions

Cross-browser anti-fraud web extension that blocks malicious URLs using a distributed blocklist system with real-time protection.

## Quick Start

- This is the root AGENTS.md - serves as global fallback
- For specific directory instructions, see:
  - `src/AGENTS.md` - Core development directives
  - `src/entrypoints/AGENTS.md` - WXT entrypoint patterns
  - `src/libs/AGENTS.md` - Service and library patterns
  - `src/components/AGENTS.md` - Svelte component guidelines
  - `src/utils/AGENTS.md` - Utility function patterns

## Project Overview

- **Framework**: WXT 0.20.11 (Web Extension Framework)
- **Frontend**: Svelte 5.39.11 with runes syntax
- **Package Manager**: Bun (never use npm or yarn)
- **Target**: Chrome and Firefox (Manifest V3)
- **Purpose**: Real-time URL blocking and fraud detection

## Key Features

- URL blocking with compressed blocklist from hblock.molinero.dev
- Real-time navigation monitoring
- Cross-browser compatibility
- 28-language internationalization support
- Onboarding wizard for new users

## Emergency Rules

If no specific AGENTS.md applies:

1. Always use Svelte 5 runes (`$state`, `$derived`, `$effect`)
2. Use TypeScript strict mode
3. Use `bun` for all package management
4. Test both Chrome and Firefox builds
5. Follow browser extension security best practices
