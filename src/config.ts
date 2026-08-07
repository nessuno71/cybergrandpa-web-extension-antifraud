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

export const STREAM_URL = 'https://hblock.molinero.dev/hosts';
