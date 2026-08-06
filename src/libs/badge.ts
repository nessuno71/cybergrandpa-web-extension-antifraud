import { logger } from '@/utils/logger';
import { browser } from 'wxt/browser';
import { storeProtectionEnabled } from './store';

// Matches --color-red in src/styles/style.scss
const BADGE_COLOR_ALERT = '#f20606';

// Badges only fit a few characters (and would need translating in 30 locales),
// so use a symbol here and put the translated status in the tooltip instead.
const BADGE_TEXT_DISABLED = '!';

// MV3 exposes `action`, MV2 (Firefox) exposes `browserAction`
const setBadgeText = (text: string) => {
  if (browser.action) return browser.action.setBadgeText({ text });

  return browser.browserAction?.setBadgeText({ text });
};

const setBadgeBackgroundColor = (color: string) => {
  if (browser.action) return browser.action.setBadgeBackgroundColor({ color });

  return browser.browserAction?.setBadgeBackgroundColor({ color });
};

const setTitle = (title: string) => {
  if (browser.action) return browser.action.setTitle({ title });

  return browser.browserAction?.setTitle({ title });
};

const updateBadge = async (isProtectionEnabled: boolean) => {
  const appName = `${i18n.t('extension.name')} ${i18n.t('extension.subname')}`;
  const status = isProtectionEnabled ? i18n.t('global.enabled') : i18n.t('global.disabled');

  try {
    await Promise.all([
      setBadgeText(isProtectionEnabled ? '' : BADGE_TEXT_DISABLED),
      setBadgeBackgroundColor(BADGE_COLOR_ALERT),
      setTitle(`${appName} - ${status}`),
    ]);
  } catch (error) {
    logger.error('Failed to update the toolbar badge:', error);
  }
};

/**
 * Keep the toolbar icon in sync with the protection state, so it's obvious at a
 * glance when protection is off.
 */
export const initBadge = () => {
  // `subscribe` fires immediately with the current value, then on every change
  storeProtectionEnabled.subscribe(updateBadge);
};
