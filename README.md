# CyberGrandpa Cross-Browser Extension

> 🛡️ Your digital guardian against online fraud and malicious websites

A powerful cross-browser web extension that provides real-time protection against malicious URLs using a distributed blocklist system. Built with modern web technologies and designed for maximum performance and cross-browser compatibility.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WXT](https://img.shields.io/badge/WXT-0.20.15-blue.svg)](https://wxt.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.50.1-orange.svg)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🌐 **Cross-browser Support** - Works seamlessly on Chrome and Firefox with Manifest V3
- 🚀 **Real-time URL Blocking** - Instantly blocks malicious websites before they load
- 🗂️ **Distributed Blocklist** - Uses compressed blocklist from [hblock.molinero.dev](https://hblock.molinero.dev/hosts)
- 🌍 **28 Languages** - Full internationalization support including English, German, Spanish, French, Italian, Dutch, Portuguese, Arabic, Bulgarian, Czech, Danish, Finnish, Hindi, Croatian, Hungarian, Japanese, Korean, Norwegian, Polish, Romanian, Russian, Slovak, Swedish, Turkish, Ukrainian, and Chinese
- ⚡ **High Performance** - Compressed storage with in-memory lookups for instant blocking
- 🎨 **Modern UI** - Built with Svelte 5 and SASS for a smooth user experience
- 🔄 **Auto-sync** - Periodic blocklist updates to stay protected
- 🧙 **Onboarding Wizard** - User-friendly setup for first-time users
- 🔐 **Privacy-focused** - Local processing, no data collection

## 🛠️ Technology Stack

- **Framework**: [WXT 0.20.15](https://wxt.dev/) - Modern web extension framework
- **Frontend**: [Svelte 5.50.1](https://svelte.dev/) - Reactive UI with runes syntax
- **Styling**: SASS/SCSS with modular architecture + PostCSS (rem-to-px conversion)
- **Database**: [LokiJS](https://github.com/techfort/LokiJS) - In-memory URL storage
- **Communication**: [@webext-core/proxy-service](https://webext-core.aklinker1.io/guide/proxy-service.html) - Cross-context messaging
- **Storage**: WXT Storage API with compressed base64 data
- **Internationalization**: [@wxt-dev/i18n](https://wxt.dev/guide/i18n.html) - YAML-based localization
- **Package Manager**: [Bun](https://bun.sh/) - Fast JavaScript runtime & package manager
- **TypeScript**: Strict mode for type safety

## 📋 Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)
- Chrome or Firefox browser for testing

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cybergrandpa-cross-browser-extension.git

# Navigate to project directory
cd cybergrandpa-cross-browser-extension

# Install dependencies
bun install

# Prepare WXT
bun postinstall
```

### Development

```bash
# Start development server for Chrome (with hot reload)
bun dev

# Start development server for Firefox
bun dev:firefox
```

The extension will be automatically loaded in your browser. Any changes you make will trigger a hot reload.

### Building for Production

```bash
# Build for Chrome
bun build

# Build for Firefox
bun build:firefox

# Create distribution ZIPs
bun zip              # Chrome
bun zip:firefox      # Firefox
```

Output files:

- Chrome: `.output/chrome-mv3/`
- Firefox: `.output/firefox-mv3/`
- Distribution ZIPs: `.output/*.zip`

## 🧪 Code Quality

```bash
# Run linting (Prettier + ESLint)
bun lint

# Format code with Prettier
bun format

# Run Svelte type checking
bun check

# Run Svelte type checking in watch mode
bun check:watch
```

## 📁 Project Structure

```
cybergrandpa-cross-browser-extension/
├── src/
│   ├── entrypoints/              # WXT extension entry points
│   │   ├── background.ts         # Service worker (orchestrates extension)
│   │   ├── content.ts            # Page scanning and UI injection
│   │   ├── close.content.ts      # Tab closing for blocked URLs
│   │   ├── popup/                # Browser action popup
│   │   ├── options/              # Extension settings page
│   │   └── wizard/               # Onboarding wizard
│   ├── libs/                     # Core services
│   │   ├── urls-service.ts       # URL blocklist management
│   │   ├── init-db.ts            # Database initialization
│   │   ├── web-blocking.ts       # Real-time URL interception
│   │   └── store.ts              # Storage management
│   ├── components/               # Svelte 5 components
│   │   ├── button.svelte
│   │   ├── modal.svelte
│   │   ├── toggle.svelte
│   │   ├── apps/                 # App-specific components
│   │   └── icons/                # Icon components
│   ├── utils/                    # Utility functions
│   │   ├── stream.ts             # Stream processing
│   │   ├── storage.ts            # Storage helpers
│   │   ├── messaging.ts          # Cross-context messaging
│   │   └── tabs.ts               # Tab management
│   ├── config.ts                 # Configuration constants
│   ├── locales/                  # i18n YAML files (28 languages)
│   └── styles/                   # Global SCSS styles
├── .cursorrules                  # Cursor IDE AI rules
├── AGENTS.md                     # Universal AI agent instructions
├── CLAUDE.md                     # Claude Code guidance
├── wxt.config.ts                 # WXT configuration
└── web-ext.config.ts             # Browser launcher config (optional)
```

## 🏗️ Architecture Overview

### Data Flow

1. **Extension Install/Startup**
   - `background.ts` registers `urlService` via proxy-service
   - `initDb()` fetches blocklist from external source
   - Blocklist is compressed, base64-encoded, and stored in WXT storage
   - `urlService` decompresses and keeps array in memory for fast lookups

2. **Real-time URL Blocking**
   - `initWebBlocking()` listens to `webNavigation.onBeforeNavigate`
   - For each navigation, checks URL against blocklist via `urlService.seek()`
   - If URL is blocked, immediately closes the tab

3. **Cross-Context Communication**
   - `@webext-core/proxy-service` exposes `urlService` methods to all contexts
   - Background script forwards messages via `forwardMessageToCss()`
   - Content scripts request scanning via runtime messages

### Core Services

- **URL Service** (`urls-service.ts`): Central blocklist management with methods for counting, pagination, searching, and upserting compressed data
- **Database Init** (`init-db.ts`): Handles blocklist synchronization with periodic updates via browser alarms
- **Web Blocking** (`web-blocking.ts`): Real-time URL interception and tab closing
- **Storage** (`store.ts`): Typed store wrappers for persistent settings

## 🤖 AI-Augmented Development

This project includes comprehensive AI instruction files to enhance development with AI coding assistants:

### For AI Agents

- **`AGENTS.md`** - Universal AI agent instructions following the [AGENTS.md standard](https://agents.md/)
  - Commands, testing, project structure, code style, git workflow, and boundaries
  - Optimized for any AI coding assistant (GitHub Copilot, Claude, etc.)
  - Kept concise (≤150 lines) for optimal agent performance

### For Specific Tools

- **`.cursorrules`** - Cursor IDE specific rules with detailed component patterns
  - Includes Svelte 5 component structure examples
  - Store patterns, message passing, and styling guidelines
  - Cursor-specific inline code generation tips

- **`AGENTS.md`** - Universal AI agent instructions for all assistants
  - Architecture guidelines and development workflow
  - Cross-browser compatibility patterns

- **`CLAUDE.md`** - Claude Code comprehensive guidance
  - Detailed architecture documentation
  - In-depth service descriptions and data flow
  - Complete technology stack reference

### Best Practices for AI Development

1. AI agents automatically read these files for context
2. Keep instructions up-to-date when changing architecture
3. Use specific versions and clear examples
4. Set boundaries (never commit secrets, vendor dirs, etc.)
5. All files follow the same core directives but with tool-specific details

Learn more about the AGENTS.md standard:

- [AGENTS.md Official Site](https://agents.md/)
- [GitHub Blog: How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [Builder.io: Improve your AI code output](https://www.builder.io/blog/agents-md)

## 🌍 Internationalization

The extension supports 28 languages out of the box:

- **European**: English, German, Spanish, French, Italian, Dutch, Portuguese, Danish, Finnish, Norwegian, Polish, Romanian, Swedish, Czech, Slovak, Croatian, Hungarian, Bulgarian
- **Asian**: Japanese, Korean, Chinese (Simplified & Traditional), Hindi
- **Middle Eastern**: Arabic, Turkish
- **Eastern European**: Russian, Ukrainian

All translations are stored in YAML files under `src/locales/`. To add a new language:

1. Create a new YAML file (e.g., `ja.yml`) in `src/locales/`
2. Copy the structure from `en.yml`
3. Translate all keys
4. The extension will automatically detect and use the new locale

## ⚙️ Browser Launcher Customization

Use `web-ext.config.ts` on the root of the project to customize the browser launcher.

### Launcher configuration example

```ts
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  binaries: {
    chrome: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
    // firefox: 'firefoxdeveloperedition', // Use Firefox Developer Edition instead of regular Firefox
    // edge: '/path/to/edge', // Open MS Edge when running "wxt -b edge"
  },
});
```

## 🔧 Configuration

Key configuration constants are in `src/config.ts`:

- `STORAGE_DB_URLS` - Storage key for compressed blocklist
- `STREAM_URL` - Blocklist source URL (hblock.molinero.dev/hosts)
- `CONFIG_LOCAL_URL_PATTERN` - URL patterns to monitor for blocking
- `CONFIG_LOCAL_URL_MATCHES` - Regex to exclude browser internal URLs

## 🧩 Browser Permissions

Required permissions in manifest:

- `activeTab` - Access active tab for scanning
- `alarms` - Periodic blocklist updates
- `scripting` - Inject content scripts
- `storage` - Store blocklist and settings
- `tabs` - Manage tabs (close malicious ones)
- `webNavigation` - Monitor navigation events
- `declarativeNetRequestWithHostAccess` - Block network requests
- `host_permissions`: `<all_urls>` - Check all URLs against blocklist

## 🔐 Security & Privacy

- **Local Processing**: All URL checking happens locally in the browser
- **No Data Collection**: Extension doesn't send any data to external servers
- **Compressed Storage**: Blocklist stored efficiently with base64 compression
- **Content Security Policy**: `wasm-unsafe-eval` allowed for extension pages only
- **Regular Updates**: Blocklist syncs periodically via browser alarms

## 🎨 Code Conventions

### Svelte 5 Runes Only

```svelte
<script lang="ts">
  // ✅ Use Svelte 5 runes
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count:', count);
  });
</script>
```

### TypeScript Strict Mode

- All code uses strict TypeScript typing
- No `any` types without justification
- Define interfaces for component props

### Import Alias

Use `@/` for imports from `src/`:

```typescript
import { urlService } from '@/libs/urls-service';
import Button from '@/components/button.svelte';
```

## 🧪 Testing

1. Build for both browsers:

   ```bash
   bun build && bun build:firefox
   ```

2. Load extension:
   - **Chrome**: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select `.output/chrome-mv3/`
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select any file in `.output/firefox-mv3/`

3. Test key features:
   - URL blocking with known malicious domains
   - Cross-context communication (popup ↔ background ↔ content)
   - Settings persistence
   - i18n across different languages
   - Onboarding wizard flow

## 🤝 Contributing

Contributions are welcome! When contributing:

1. Always use Svelte 5 syntax and runes
2. Ensure cross-browser compatibility
3. Maintain TypeScript strict typing
4. Follow the established component architecture
5. Use `bun` for all package operations
6. Consider internationalization for user-facing text
7. Test both Chrome and Firefox builds
8. Update AI instruction files if changing architecture

### Commit Convention

Use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation updates
- `style:` - Code style changes
- `test:` - Test additions or updates
- `chore:` - Build process or auxiliary tool changes

## 📄 License

[MIT License](LICENSE) - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [hblock.molinero.dev](https://hblock.molinero.dev/) for the malicious URL blocklist
- [WXT Framework](https://wxt.dev/) for the excellent extension development experience
- [Svelte](https://svelte.dev/) for the reactive UI framework
- [Agentic AI Foundation](https://agents.md/) for the AGENTS.md standard

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ by the CyberGrandpa team**

**Powered by**: WXT • Svelte 5 • TypeScript • Bun
