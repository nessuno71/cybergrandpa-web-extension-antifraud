/**
 * Logger utility for the extension
 * Only logs in development mode to avoid console spam in production
 */

const isDev = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log('[CyberGrandpa]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn('[CyberGrandpa]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error('[CyberGrandpa]', ...args);
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      console.info('[CyberGrandpa]', ...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug('[CyberGrandpa]', ...args);
    }
  },
};
