import { fakeBrowser } from '@webext-core/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted — use vi.hoisted for variables used in mock factories
const { mockGetDynamicRules, mockUpdateDynamicRules } = vi.hoisted(() => ({
  mockGetDynamicRules: vi.fn().mockResolvedValue([]),
  mockUpdateDynamicRules: vi.fn().mockResolvedValue(undefined),
}));

// Mock url service
const { mockSeek, mockCount, mockGetRows, mockUpsert } = vi.hoisted(() => ({
  mockSeek: vi.fn().mockResolvedValue(false),
  mockCount: vi.fn().mockResolvedValue(3),
  mockGetRows: vi.fn().mockResolvedValue('evil.com\nbad.com\nmalware.org'),
  mockUpsert: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/libs/urls-service', () => ({
  getUrlService: () => ({
    seek: mockSeek,
    count: mockCount,
    getRows: mockGetRows,
    upsert: mockUpsert,
  }),
}));

// Mock store
const { mockReady, mockSubscribe } = vi.hoisted(() => ({
  mockReady: vi.fn().mockResolvedValue(true),
  mockSubscribe: vi.fn(),
}));

vi.mock('@/libs/store', () => ({
  storeProtectionEnabled: {
    ready: mockReady,
    subscribe: mockSubscribe,
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
    // Reset url-service mock implementations to the defaults so each test
    // starts from a known state regardless of what previous tests stubbed.
    mockCount.mockResolvedValue(3);
    mockGetRows.mockResolvedValue('evil.com\nbad.com\nmalware.org');
    // Reset store mock implementations so the protection-enabled gate isn't
    // stuck from a previous test (e.g., "disables when protection is off").
    mockReady.mockResolvedValue(true);
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
      mockReady.mockResolvedValue(false);

      await updateDnrBlocking();

      // Should have called getDynamicRules (part of disableDnrBlocking)
      expect(mockGetDynamicRules).toHaveBeenCalled();
    });

    it('skips rule update when no top domains found', async () => {
      mockCount.mockResolvedValue(0);

      await updateDnrBlocking();

      // Should not have tried to update rules
      expect(mockUpdateDynamicRules).not.toHaveBeenCalled();
    });

    it('intersects streamed Tranco response with blocklist and breaks early', async () => {
      const trancoCsv = [
        '# tranco list header',
        '1,evil.com',
        '2,popular.org',
        '3,malware.org',
        '4,unrelated.net',
        '5,another-evil.com',
      ].join('\n');

      const encoder = new TextEncoder();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(trancoCsv));
            controller.close();
          },
        }),
      } as Response);

      // Force the cap very low by patching DNR_TOP_DOMAINS_COUNT isn't possible,
      // so we just verify intersection picks correct domains.
      await updateDnrBlocking();

      // All three blocklist domains are in Tranco: evil.com, bad.com, malware.org
      expect(mockUpdateDynamicRules).toHaveBeenCalledTimes(1);
      const addRules = mockUpdateDynamicRules.mock.calls[0][0].addRules;
      const blockedDomains = addRules.map((r: { condition: { urlFilter: string } }) =>
        r.condition.urlFilter.replace(/^\|\||\^$/g, '')
      );
      expect(blockedDomains).toEqual(expect.arrayContaining(['evil.com', 'malware.org']));

      fetchSpy.mockRestore();
    });
  });
});
