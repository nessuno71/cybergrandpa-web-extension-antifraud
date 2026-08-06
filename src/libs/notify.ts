import { logger } from '@/utils/logger';
import { browser } from 'wxt/browser';
import { storeAlertsEnabled } from './store';

/**
 * Notify the user that a page was blocked. Without this, a hard-blocked tab just
 * disappears with no explanation, which is confusing for our audience.
 *
 * Opt-in via the onboarding wizard's "important security alerts" question
 * (`storeAlertsEnabled`).
 */
export const notifyBlockedUrl = async (url: string) => {
  if (!(await storeAlertsEnabled.ready())) return;

  // Undefined when the `notifications` permission isn't granted
  if (!browser.notifications) return;

  try {
    await browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title: `${i18n.t('extension.name')} ${i18n.t('extension.subname')}`,
      message: `${i18n.t('overlay.truthyMessage')} ${url}`,
    });
  } catch (error) {
    logger.error('Failed to create blocked URL notification:', error);
  }
};
