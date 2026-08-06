import { storeRealtimeEnabled } from '@/libs/store';
import { getUrlService } from '@/libs/urls-service';
import '@/styles/style.scss';
import { ENV_APP_VERSION, type SendMessageParams, getLog, isIgnoreUrlMatch } from '@/utils';
import { createUi } from '@/utils/create-ui';
import { logger } from '@/utils/logger';
import type { Browser } from 'wxt/browser';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

const mainContentScript = async (ctx: ContentScriptContext) => {
  let ui: Awaited<ReturnType<typeof createUi>> | undefined;

  // Mutable so we can flip `immediate` between mounts without recreating the UI
  const uiProps = {
    immediate: false,
    onClose: () => ui?.remove(),
  };

  const getUi = async () => {
    ui ??= await createUi('overlay-loading-app', ctx, uiProps);

    return ui;
  };

  // Real-time protection: silently check the page against the blocklist and only
  // surface the overlay when a real threat is found. Runs on load and on every
  // in-page (SPA) navigation, since `webNavigation.onBeforeNavigate` in the
  // background script never fires for `history.pushState`-based route changes.
  const runRealtimeScan = async (url: string) => {
    if (isIgnoreUrlMatch(url)) return;

    const isRealtimeEnabled = await storeRealtimeEnabled.ready();

    if (!isRealtimeEnabled) return;

    const isMalicious = await getUrlService().seek(url);

    if (!isMalicious) return;

    uiProps.immediate = true;
    (await getUi()).mount();
  };

  const addListenerHandler = (
    request: SendMessageParams,
    _sender: Browser.runtime.MessageSender,
    sendResponse: (response: string) => void
  ) => {
    if (request.type === 'scanPage') {
      // Returning a promise will send a response back to the sender
      if (request.command === 'open') {
        uiProps.immediate = false;
        getUi().then((instance) => instance.mount());
      }

      if (request.command === 'close' || request.command === 'destroy') {
        ui?.remove();
      }

      sendResponse(getLog(request));

      return true;
    }
  };

  const addListeners = () => {
    browser.runtime.onMessage.addListener(addListenerHandler);

    ctx.addEventListener(window, 'beforeunload', () => {
      browser.runtime.onMessage.removeListener(addListenerHandler);

      ui?.remove();
      ctx.abort();
    });

    // Re-run the scan whenever the URL changes without a full page reload (SPAs)
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      runRealtimeScan(newUrl.toString());
    });
  };

  addListeners();

  // Scan the page we just loaded on too, not just future navigations
  runRealtimeScan(window.location.href);

  logger.info('content script loaded. ENV_APP_VERSION:', ENV_APP_VERSION);
};

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  main: mainContentScript,
});
