# Entrypoint Instructions

Patterns and conventions for WXT entrypoints in the CyberGrandpa extension.

## Entrypoint Structure

The extension uses WXT's entrypoint system:

- **`background.ts`** - Service worker that orchestrates the extension:
  - Registers `urlService` via proxy-service for cross-context access
  - Handles `onInstalled`, `onStartup`, `onSuspend` lifecycle events
  - Opens wizard on first install
  - Forwards messages between contexts via `forwardMessageToCss()`
  - Initializes database (`initDb()`) and web blocking (`initWebBlocking()`)

- **`content.ts`** - Content script for page scanning and UI injection:
  - Injects overlay UI for scan results
  - Handles manual scan triggers
  - Communicates with background script

- **`close.content.ts`** - Content script for closing/blocking malicious tabs:
  - Immediately closes tabs flagged as malicious
  - Minimal footprint for fast execution

- **`popup/`** - Browser action popup (index.html + main.ts + popup.svelte):
  - Shows protection status
  - Provides manual scan trigger
  - Links to options page

- **`options/`** - Extension settings page (index.html + main.ts + options.svelte):
  - Configuration for protection levels
  - Package type selection (basic/premium)
  - Real-time scanning toggle

- **`wizard/`** - Onboarding wizard for new users (index.html + main.ts + wizard.svelte):
  - First-time setup flow
  - Permission requests
  - Feature introduction

## Message Handling Patterns

### Background Script Message Handler

```typescript
const onMessageHandler = async (
  request: globalThis.SendMessageParams,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
) => {
  // Handle specific message types
  if (request.type === 'FRAUD_ANALYSIS_RESULT') {
    // Process results
  }

  // Forward to other contexts if needed
  const responses = await forwardMessageToCss(request);
  sendResponse(responses);

  return true; // Keep channel open for async
};
```

### Content Script Message Handler

```typescript
const addListenerHandler = (
  request: SendMessageParams,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: string) => void
) => {
  if (request.type === 'scanPage') {
    if (request.command === 'open') {
      ui.mount();
    }
    // Handle other commands
  }
};
```

## Lifecycle Management

- Always clean up event listeners in `beforeunload`
- Use `ContentScriptContext` for proper cleanup
- Abort signal handling for async operations

## Cross-Context Communication

- Use `@webext-core/proxy-service` for service exposure
- Forward messages via `forwardMessageToCss()`
- Validate message payloads
