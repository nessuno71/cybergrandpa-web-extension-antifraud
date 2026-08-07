export * from './utils/env';
import { i18n } from '#i18n';

export const APP_NAME = 'cybergrandpa-antifraud';

export const CONFIG_LINK_PREFIX = 'https://';

export const CONFIG_WWW_HELP = CONFIG_LINK_PREFIX + i18n.t('global.wwwHelp');

export const CONFIG_WWW_MAIN = CONFIG_LINK_PREFIX + i18n.t('global.wwwMain');

export const CONFIG_LOCAL_URL_MATCHES = '^(?!chrome|firefox|edge|file).*';

export const CONFIG_LOCAL_URL_PATTERN = [
  { urlMatches: 'https://*/*' },
  { urlMatches: 'http://*/*' },
  { urlMatches: 'ftp://*/*' },
  { urlMatches: 'ftps://*/*' },
  { urlMatches: 'data*/*/*' },
  { urlMatches: '!chrome://*/*' },
  { urlMatches: '!firefox://*/*' },
  { urlMatches: '!edge://*/*' },
  { urlMatches: '!file://*/*' },
  { urlMatches: '!file:///*' },
  { urlMatches: '!about:blank' },
];

export const STORAGE_DB_URLS = 'local:urls-db';

export const STORAGE_KEY_URLS = 'local:syncing-urls';

export const STORAGE_KEY_NEWS = 'local:syncing-news';

export const STREAM_URL = 'https://hblock.molinero.dev/hosts';

// Tranco top-1M domains list — used to prioritize DNR rules for the most
// popular blocked domains. DNR has a 30K dynamic rule limit (Chrome 121+),
// so we intersect the blocklist with Tranco to pick the most impactful subset.
export const TRANCO_LIST_URL = 'https://tranco-list.eu/download/Q7X6/NX7Q';

// Max DNR dynamic rules to register. Chrome 121+ allows 30K safe rules
// (block/allow actions). Firefox allows 5K. We use 5K for cross-browser safety.
export const DNR_TOP_DOMAINS_COUNT = 5000;

// Placeholder until the backend at cybergrandpa.space serves a real feed.
// Returns an empty array gracefully — the UI shows "No updates" instead of breaking.
export const NEWS_FEED_URL = 'https://cybergrandpa.space/api/news.json';
