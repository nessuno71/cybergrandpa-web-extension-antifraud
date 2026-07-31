import apps from '@/components/apps';
import { APP_NAME } from '@/config';
import { storeScanning } from '@/libs/store';
import { pascalCase } from 'change-case';
import { unmount } from 'svelte';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { bootstrapApp } from './bootstrap-app';

export const createUi = (name: string, ctx: ContentScriptContext) => {
  return createShadowRootUi(ctx, {
    name: `${APP_NAME}-${name}`,
    position: 'overlay',
    // zIndex: 99999999,
    anchor: 'body',
    append: 'after',
    onMount: (container) => {
      const svelteApp = apps[pascalCase(name)];

      if (!svelteApp) {
        throw new Error(`No app registered for "${name}"`);
      }

      return bootstrapApp(svelteApp, container);
    },
    onRemove: (app) => {
      // Set the scanning state to 0
      storeScanning.set('0');

      // Unmount the SvelteApp when the ShadowRootUi is removed
      if (app) {
        unmount(app, { outro: true });
      }
    },
  });
};
