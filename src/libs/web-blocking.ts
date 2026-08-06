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
      // Compose the confirm message here (i18n is available in background context)
      // and pass it to the injected func — the func is stringified and can't
      // access imports.
      const confirmMsg = `${i18n.t('overlay.confirmClose')}\n\n${details.url}`;

      // Inject into ISOLATED world (default) — NOT 'MAIN' — so window.confirm
      // works and we get the return value back. The actual tab removal happens
      // back here in the background script where `browser` is in scope.
      const results = await browser.scripting.executeScript({
        target: { tabId: details.tabId },
        injectImmediately: true,
        args: [confirmMsg],
        func: (msg: string) => {
          return window.confirm(msg);
        },
      });

      const wasClosed = results?.[0]?.result === true;
      logger.info('URL blocked, confirmed:', wasClosed, details.url);

      if (wasClosed) {
        await browser.tabs.remove(details.tabId);
        notifyBlockedUrl(details.url);
      }
    }
  };

  // Full page navigations
  browser?.webNavigation?.onBeforeNavigate?.addListener(closeTabIfBlocked, { url: CONFIG_LOCAL_URL_PATTERN });

  // SPA / History API route changes (e.g. history.pushState) don't trigger
  // onBeforeNavigate, so they need their own listener to be caught.
  browser?.webNavigation?.onHistoryStateUpdated?.addListener(closeTabIfBlocked, { url: CONFIG_LOCAL_URL_PATTERN });
};
