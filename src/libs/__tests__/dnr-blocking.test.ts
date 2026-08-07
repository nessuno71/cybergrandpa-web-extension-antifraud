import { fakeBrowser } from '@webext-core/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted — use vi.hoisted for variables used in mock factories
const { mockGetDynamicRules, mockUpdateDynamicRules } = vi.hoisted(() => ({
  mockGetDynamicRules: vi.fn().mockResolvedValue([]),
  mockUpdateDynamicRules: vi.fn().mockResolvedValue(undefined),
}));

// Mock url service
vi.mock('@/libs/urls-service', () => ({
  getUrlService: () => ({
    seek: vi.fn().mockResolvedValue(true),
    count: vi.fn().mockResolvedValue(3),
    getRows: vi.fn().mockResolvedValue('evil.com\nbad.com\nmalware.org'),
    upsert: vi.fn().mockResolvedValue(true),
  }),
}));

// Mock store
vi.mock('@/libs/store', () => ({
  storeProtectionEnabled: {
    ready: vi.fn().mockResolvedValue(true),
    subscribe: vi.fn(),
    set: vi.fn(),
    get: vi.fn(() => true),
  },
}));

// Mock i18n
vi.mock('#i18n', () => ({
  i18n: { t: vi.fn((key: string) => key) },
}));

// Mock declarativeNetRequest — fake-browser doesn't implement it
vi.mock('wxt/browser', () => ({
  browser: {
    declarativeNetRequest: {
      getDynamicRules: mockGetDynamicRules,
      updateDynamicRules: mockUpdateDynamicRules,
    },
  },
}));

import { disableDnrBlocking, updateDnrBlocking } from '../dnr-blocking';

describe('dnr-blocking', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.clearAllMocks();
    mockGetDynamicRules.mockResolvedValue([]);
    mockUpdateDynamicRules.mockResolvedValue(undefined);
  });

  describe('disableDnrBlocking', () => {
    it('removes existing rules in our ID range', async () => {
      mockGetDynamicRules.mockResolvedValue([
        { id: 1, priority: 1, action: { type: 'block' }, condition: {} },
        { id: 2, priority: 1, action: { type: 'block' }, condition: {} },
      ]);

      await disableDnrBlocking();

      expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2],
      });
    });

    it('does nothing when no rules exist', async () => {
      mockGetDynamicRules.mockResolvedValue([]);

      await disableDnrBlocking();

      expect(mockUpdateDynamicRules).not.toHaveBeenCalled();
    });
  });

  describe('updateDnrBlocking', () => {
    it('disables rules when protection is off', async () => {
      const { storeProtectionEnabled } = await import('@/libs/store');
      vi.mocked(storeProtectionEnabled.ready).mockResolvedValue(false);

      await updateDnrBlocking();

      // Should have called getDynamicRules (part of disableDnrBlocking)
      expect(mockGetDynamicRules).toHaveBeenCalled();
    });

    it('skips rule update when no top domains found', async () => {
      const { getUrlService } = await import('@/libs/urls-service');
      vi.mocked(getUrlService().count).mockResolvedValue(0);

      await updateDnrBlocking();

      // Should not have tried to update rules
      expect(mockUpdateDynamicRules).not.toHaveBeenCalled();
    });
  });
});
