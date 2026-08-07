import { DNR_TOP_DOMAINS_COUNT, TRANCO_LIST_URL } from '@/config';
import { logger } from '@/utils/logger';
import { storeProtectionEnabled } from './store';
import { getUrlService } from './urls-service';

// DNR rule IDs must be positive integers. We use a fixed range starting at 1
// so we can easily remove all our rules when disabling protection.
const DNR_RULE_ID_START = 1;

/**
 * Fetch the Tranco top-1M domain list and intersect it with the blocklist.
 * Returns the top N blocked domains, sorted by Tranco rank (most popular first).
 */
const getTopBlockedDomains = async (): Promise<string[]> => {
  const urlService = getUrlService();

  // Get all blocked domains from the blocklist
  // getRows returns a newline-separated string; we fetch in chunks
  const allBlocked: string[] = [];
  const chunkSize = 50000;
  let offset = 0;
  const total = await urlService.count();

  while (offset < total) {
    const rows = await urlService.getRows(chunkSize, offset);
    if (!rows) break;
    allBlocked.push(...rows.split('\n'));
    offset += chunkSize;
  }

  if (allBlocked.length === 0) return [];

  // Build a Set for O(1) lookup
  const blockedSet = new Set(allBlocked);

  // Fetch Tranco list (CSV: rank,domain per line)
  const response = await fetch(TRANCO_LIST_URL, { signal: AbortSignal.timeout(30000) });

  if (!response.ok) {
    logger.error('Tranco list fetch failed:', response.status);
    return [];
  }

  const text = await response.text();
  const trancoDomains = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      // Format: "rank,domain" — take the domain part
      const parts = line.split(',');
      return parts[1]?.trim() || '';
    })
    .filter(Boolean);

  // Intersect: keep Tranco domains that are in the blocklist, preserving Tranco order
  const topBlocked: string[] = [];
  for (const domain of trancoDomains) {
    if (blockedSet.has(domain)) {
      topBlocked.push(domain);
      if (topBlocked.length >= DNR_TOP_DOMAINS_COUNT) break;
    }
  }

  logger.info(`DNR: ${topBlocked.length} top blocked domains selected from Tranco intersect`);
  return topBlocked;
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
      urlFilter: `||${domain}`,
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

/**
 * Update DNR rules based on the current blocklist + Tranco ranking.
 * Called after each blocklist sync.
 */
export const updateDnrBlocking = async () => {
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
};

/**
 * Initialize DNR blocking. Listens to protection toggle changes
 * to enable/disable rules dynamically.
 */
export const initDnrBlocking = () => {
  // Enable/disable rules when the protection toggle changes
  storeProtectionEnabled.subscribe(async (enabled) => {
    if (enabled) {
      await updateDnrBlocking();
    } else {
      await disableDnrBlocking();
    }
  });
};
