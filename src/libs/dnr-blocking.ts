import { DNR_TOP_DOMAINS_COUNT, TRANCO_LIST_URL } from '@/config';
import { logger } from '@/utils/logger';
import { storeProtectionEnabled } from './store';
import { getUrlService } from './urls-service';

// DNR rule IDs must be positive integers. We use a fixed range starting at 1
// so we can easily remove all our rules when disabling protection.
const DNR_RULE_ID_START = 1;

/**
 * Build a Set of all blocked domains from the in-memory blocklist.
 * Single bulk read to avoid round-trip overhead and minimize peak heap.
 */
const buildBlockedSet = async (): Promise<Set<string>> => {
  const urlService = getUrlService();
  const total = await urlService.count();
  if (total === 0) return new Set();

  const rows = await urlService.getRows(total, 0);
  if (!rows) return new Set();

  const set = new Set<string>();
  for (const line of rows.split('\n')) {
    if (line) set.add(line);
  }

  return set;
};

/**
 * Stream the Tranco CSV response line-by-line, intersecting against the
 * blocklist. Returns at most DNR_TOP_DOMAINS_COUNT results, breaking early
 * to avoid scanning the rest of the 1M-line list once we have enough.
 */
const streamTrancoIntersect = async (blockedSet: Set<string>, signal: AbortSignal): Promise<string[]> => {
  if (blockedSet.size === 0) return [];

  const response = await fetch(TRANCO_LIST_URL, { signal });

  if (!response.ok || !response.body) {
    logger.error('Tranco list fetch failed:', response.status);
    return [];
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const topBlocked: string[] = [];

  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineAt: number;
      while ((newlineAt = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineAt).trim();
        buffer = buffer.slice(newlineAt + 1);

        if (line && !line.startsWith('#')) {
          const parts = line.split(',');
          const domain = parts[1]?.trim();

          if (domain && blockedSet.has(domain)) {
            topBlocked.push(domain);
            if (topBlocked.length >= DNR_TOP_DOMAINS_COUNT) {
              reader.cancel();
              return topBlocked;
            }
          }
        }
      }
    }

    // Flush any trailing line that didn't end with \n
    const trailing = buffer.trim();
    if (trailing && !trailing.startsWith('#')) {
      const parts = trailing.split(',');
      const domain = parts[1]?.trim();

      if (domain && blockedSet.has(domain) && topBlocked.length < DNR_TOP_DOMAINS_COUNT) {
        topBlocked.push(domain);
      }
    }
  } finally {
    reader.cancel().catch(() => undefined);
  }

  return topBlocked;
};

/**
 * Fetch the Tranco top-1M domain list and intersect it with the blocklist.
 * Returns the top N blocked domains, sorted by Tranco rank (most popular first).
 */
const getTopBlockedDomains = async (): Promise<string[]> => {
  const blockedSet = await buildBlockedSet();

  if (blockedSet.size === 0) return [];

  try {
    const topDomains = await streamTrancoIntersect(blockedSet, AbortSignal.timeout(30000));
    logger.info(`DNR: ${topDomains.length} top blocked domains selected from Tranco intersect`);
    return topDomains;
  } catch (error) {
    logger.error('Failed to intersect Tranco with blocklist:', error);
    return [];
  }
};

/**
 * Convert a domain to a DNR rule.
 * Uses urlFilter to block all requests to the domain and its subdomains.
 */
const domainToRule = (domain: string, ruleId: number): Browser.declarativeNetRequest.Rule => {
  return {
    id: ruleId,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `||${domain}^`,
      resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet'],
    },
  };
};

/**
 * Remove all existing DNR rules in our ID range, then add the new ones.
 */
const updateDnrRules = async (domains: string[]) => {
  const rules = domains.map((domain, index) => domainToRule(domain, DNR_RULE_ID_START + index));

  // Get existing dynamic rules to find which ones to remove
  const existingRules = await browser.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules
    .filter((rule) => rule.id >= DNR_RULE_ID_START && rule.id < DNR_RULE_ID_START + DNR_TOP_DOMAINS_COUNT)
    .map((rule) => rule.id);

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules,
  });

  logger.info(`DNR: ${rules.length} rules registered, ${removeRuleIds.length} removed`);
};

/**
 * Disable DNR blocking by removing all our rules.
 */
export const disableDnrBlocking = async () => {
  try {
    const existingRules = await browser.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules
      .filter((rule) => rule.id >= DNR_RULE_ID_START && rule.id < DNR_RULE_ID_START + DNR_TOP_DOMAINS_COUNT)
      .map((rule) => rule.id);

    if (removeRuleIds.length > 0) {
      await browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
      logger.info(`DNR: disabled, removed ${removeRuleIds.length} rules`);
    }
  } catch (error) {
    logger.error('DNR: failed to disable rules:', error);
  }
};

// Guard against concurrent updates — same pattern as init-db.ts's syncUrlsIsBusy
let dnrUpdateIsBusy = false;

const runGuarded = async (fn: () => Promise<void>) => {
  if (dnrUpdateIsBusy) return;
  dnrUpdateIsBusy = true;
  try {
    await fn();
  } finally {
    dnrUpdateIsBusy = false;
  }
};

/**
 * Update DNR rules based on the current blocklist + Tranco ranking.
 * Called after each blocklist sync. Guarded against concurrent calls.
 */
export const updateDnrBlocking = () =>
  runGuarded(async () => {
    try {
      const isProtectionEnabled = await storeProtectionEnabled.ready();

      if (!isProtectionEnabled) {
        await disableDnrBlocking();
        return;
      }

      const topDomains = await getTopBlockedDomains();

      if (topDomains.length === 0) {
        logger.info('DNR: no top domains to block, skipping rule update');
        return;
      }

      await updateDnrRules(topDomains);
    } catch (error) {
      logger.error('DNR: failed to update rules:', error);
    }
  });

/**
 * Initialize DNR blocking. Listens to protection toggle changes to enable/disable
 * rules dynamically. Schedules a deferred first update so the blocklist has time
 * to load (WXT's background main() must be synchronous; we don't want to fetch
 * Tranco against an empty blocklist).
 *
 * The init-db.ts alarm fires its own updateDnrBlocking() on first sync, so the
 * deferred call here is a no-op overlap once the blocklist arrives.
 */
export const initDnrBlocking = () => {
  setTimeout(() => updateDnrBlocking(), 3000);

  // Enable/disable rules when the protection toggle changes
  storeProtectionEnabled.subscribe((enabled) => {
    if (enabled) {
      updateDnrBlocking();
    } else {
      disableDnrBlocking();
    }
  });
};
