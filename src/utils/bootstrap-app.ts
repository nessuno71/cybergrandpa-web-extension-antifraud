import { mount } from 'svelte';
import type { SvelteApp } from './types';

export const bootstrapApp = (svelteApp: SvelteApp, target: HTMLElement, props: Record<string, unknown> = {}) => {
  return mount(svelteApp, {
    target,
    props: {
      onClose: () => {
        // Send a request to forward to contentScript
        browser.runtime.sendMessage({ type: 'scanPage', command: 'destroy' });
      },
      ...props,
    },
  });
};
