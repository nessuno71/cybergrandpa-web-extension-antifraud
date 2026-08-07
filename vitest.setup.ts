import { fakeBrowser } from '@webext-core/fake-browser';
import { vi } from 'vitest';

// Stub the global browser/chrome APIs with an in-memory fake
vi.stubGlobal('chrome', fakeBrowser);
vi.stubGlobal('browser', fakeBrowser);

// fake-browser doesn't implement i18n — mock the functions env.ts and config.ts need
if (fakeBrowser.i18n) {
  fakeBrowser.i18n.getUILanguage = vi.fn(() => 'en-US');
  fakeBrowser.i18n.getMessage = vi.fn((key: string) => key);
}
