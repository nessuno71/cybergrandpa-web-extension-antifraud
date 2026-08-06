import { CONFIG_LOCAL_URL_PATTERN } from '@/config';
import { logger } from '@/utils/logger';
import { browser, type Browser } from 'wxt/browser';
import { notifyBlockedUrl } from './notify';
import { storeProtectionEnabled } from './store';
import { getUrlService } from './urls-service';

export const initWebBlocking = () => {
  const urlService = getUrlService();

  const closeTabIfBlocked = async (details: Browser.webNavigation.WebNavigationBaseCallbackDetails) => {
    if (details.frameType !== 'outermost_frame') return;

    // Read on every navigation so toggling protection takes effect immediately
    if (!(await storeProtectionEnabled.ready())) return;

    // For test: ---adbs186282--54223580950k.gbc.criteo.com
    const isUrlBlocked = await urlService.seek(details.url);

    logger.debug('URL:', isUrlBlocked, details.url);

    if (isUrlBlocked) {
      const response = await browser.scripting.executeScript({
        target: { tabId: details.tabId },
        world: 'MAIN',
        // files: ['/content-scripts/close.js'],
        //   injectImmediately: true,
        args: [details.tabId],
        func: (tabId) => {
          // Note: logger not available in injected func context
          browser.tabs.remove(tabId);
        },
      });

      logger.info('URL blocked:', response);

      // Tell the user why their tab just disappeared (if alerts are opted into)
      notifyBlockedUrl(details.url);
    }
  };

  // Full page navigations
  browser?.webNavigation?.onBeforeNavigate?.addListener(closeTabIfBlocked, { url: CONFIG_LOCAL_URL_PATTERN });

  // SPA / History API route changes (e.g. history.pushState) don't trigger
  // onBeforeNavigate, so they need their own listener to be caught.
  browser?.webNavigation?.onHistoryStateUpdated?.addListener(closeTabIfBlocked, { url: CONFIG_LOCAL_URL_PATTERN });
};
