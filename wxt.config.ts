import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/i18n/module'],
  manifest: {
    name: '__MSG_extension_name__' + ' ' + '__MSG_extension_subname__',
    description: '__MSG_extension_description__',
    default_locale: 'en',
    permissions: [
      'activeTab',
      'alarms',
      'notifications',
      'scripting',
      'storage',
      'tabs',
      'webNavigation',
      'declarativeNetRequest',
      'declarativeNetRequestWithHostAccess',
    ],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        matches: ['<all_urls>'],
        resources: ['/icon/*.png', '/images/**/*.png', '/images/**/*.svg', '/content-scripts/*.js'],
      },
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
    },
  },
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
});
