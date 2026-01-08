import { STORAGE_DB_URLS } from '@/config';
import { initDb } from '@/libs/init-db';
import { storeOnBoardingCompleted, storeScanning } from '@/libs/store';
import { registerUrlService } from '@/libs/urls-service';
import { initWebBlocking } from '@/libs/web-blocking';
import { forwardMessageToCss } from '@/utils';
import { logger } from '@/utils/logger';

// Register proxy-service so other JS context's can get or insert data
const urlService = registerUrlService(STORAGE_DB_URLS);

const onInstalledHandler = async ({ reason }: { reason: string }) => {
  if (reason !== 'install' && reason !== 'startup' && reason !== 'update') return;

  // Set the scanning state to 0
  storeScanning.set('0');

  if (reason === 'startup' || import.meta.env.DEV) {
    if (await storeOnBoardingCompleted.ready()) {
      return;
    }
  }

  // Open a tab on install
  await browser.tabs.create({
    url: browser.runtime.getURL('/wizard.html'),
    active: true,
  });
};

const onMessageHandler = async (
  request: globalThis.SendMessageParams,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (
    arg0: chrome.scripting.InjectionResult<unknown>[] | { tab: number | undefined; response: unknown }[]
  ) => void
) => {
  if (request.tabId) {
    if (request.type === 'loadContentScript') {
      // Returning a promise will send a response back to the sender
      const response = await browser.scripting.executeScript({
        target: { tabId: request.tabId },
        files: ['/content-scripts/content.js'],
      });

      sendResponse(response);

      return true;
    }

    if (request.type === 'stopHostPageLoading') {
      const response = await browser.scripting.executeScript({
        target: { tabId: request.tabId },
        files: ['/content-scripts/close.js'],
      });

      logger.debug('stopHostPageLoading response:', response);

      return true;
    }
  }

  const responses = await forwardMessageToCss(request);

  // Send responses back to sender
  sendResponse(responses);

  // Return true for async
  return true;
};

const main = () => {
  browser.runtime.onInstalled.addListener(onInstalledHandler);

  browser.runtime.onStartup.addListener(() => onInstalledHandler({ reason: 'startup' }));

  browser.runtime.onSuspend.addListener(() => onInstalledHandler({ reason: 'suspend' }));

  browser.runtime.onMessage.addListener(onMessageHandler);

  // Initialize database
  initDb(urlService);

  // Initialize web blocking
  initWebBlocking();
};

export default defineBackground({
  type: 'module',
  main,
});
