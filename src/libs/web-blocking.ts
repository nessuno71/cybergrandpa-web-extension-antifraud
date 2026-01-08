import { CONFIG_LOCAL_URL_PATTERN } from '@/config';
import { logger } from '@/utils/logger';
import { browser } from 'wxt/browser';
import { getUrlService } from './urls-service';

export const initWebBlocking = () => {
  const urlService = getUrlService();

  browser?.webNavigation?.onBeforeNavigate?.addListener(
    async (details) => {
      if (details.frameType !== 'outermost_frame') return;

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
      }
    },
    { url: CONFIG_LOCAL_URL_PATTERN }
  );
};
