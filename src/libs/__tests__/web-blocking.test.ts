import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fakeBrowser } from '@webext-core/fake-browser';

// Mock the url service to avoid the full proxy-service machinery
vi.mock('@/libs/urls-service', () => ({
  getUrlService: () => ({
    seek: vi.fn().mockResolvedValue(true),
    count: vi.fn().mockReturnValue(0),
    getRows: vi.fn().mockReturnValue(''),
    upsert: vi.fn().mockResolvedValue(true),
  }),
}));

// Mock notify to avoid side effects
vi.mock('@/libs/notify', () => ({
  notifyBlockedUrl: vi.fn(),
}));

// Mock i18n
vi.mock('#i18n', () => ({
  i18n: {
    t: vi.fn((key: string) => key),
  },
}));

import { initWebBlocking } from '../web-blocking';
import { storeProtectionEnabled } from '../store';

describe('web-blocking', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('initWebBlocking registers onBeforeNavigate listener', () => {
    const addListenerSpy = vi.spyOn(fakeBrowser.webNavigation.onBeforeNavigate, 'addListener');
    initWebBlocking();
    expect(addListenerSpy).toHaveBeenCalledOnce();
  });

  it('initWebBlocking registers onHistoryStateUpdated listener', () => {
    const addListenerSpy = vi.spyOn(fakeBrowser.webNavigation.onHistoryStateUpdated, 'addListener');
    initWebBlocking();
    expect(addListenerSpy).toHaveBeenCalledOnce();
  });

  it('does not block when protection is disabled', async () => {
    await storeProtectionEnabled.set(false);
    initWebBlocking();

    const listeners = fakeBrowser.webNavigation.onBeforeNavigate.addListener.mock.calls;
    expect(listeners.length).toBeGreaterThan(0);

    const callback = listeners[0][0] as (details: { frameType: string; url: string; tabId: number }) => Promise<void>;

    const executeScriptSpy = vi.spyOn(fakeBrowser.scripting, 'executeScript').mockResolvedValue([]);

    await callback({
      frameType: 'outermost_frame',
      url: 'https://evil.com',
      tabId: 1,
    });

    // executeScript should not be called when protection is off
    expect(executeScriptSpy).not.toHaveBeenCalled();

    executeScriptSpy.mockRestore();
  });
});
