import { NEWS_FEED_URL, STORAGE_KEY_NEWS } from '@/config';
import { checkAlarmState } from '@/utils';
import { logger } from '@/utils/logger';
import type { NewsItem } from '@/utils/types';
import { storeNewsCache, storeNewsEnabled } from './store';

const NEWS_ALARM_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

const isValidNewsItem = (item: unknown): item is NewsItem => {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.date === 'string'
  );
};

const syncNews = async () => {
  // Don't fetch if the user hasn't opted in
  if (!(await storeNewsEnabled.ready())) return;

  try {
    const response = await fetch(NEWS_FEED_URL, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      logger.error('News feed returned non-OK status:', response.status);
      return;
    }

    const data: unknown = await response.json();

    // Graceful empty state: backend may return [] or an empty object
    if (!Array.isArray(data)) {
      storeNewsCache.set([]);
      return;
    }

    const items = data.filter(isValidNewsItem);

    storeNewsCache.set(items);
  } catch (error) {
    logger.error('Failed to sync news feed:', error);
  }
};

export const initNewsService = () => {
  checkAlarmState(STORAGE_KEY_NEWS, NEWS_ALARM_INTERVAL);

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === STORAGE_KEY_NEWS) {
      syncNews();
    }
  });

  // Self-start after a short delay so it doesn't compete with blocklist sync
  setTimeout(() => syncNews(), 2000);
};
