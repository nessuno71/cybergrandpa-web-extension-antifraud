<script lang="ts">
  import Button from '@/components/button.svelte';
  import Header from '@/components/header.svelte';
  import Status from '@/components/status.svelte';
  import { CONFIG_WWW_HELP } from '@/config';
  import { storeNewsCache, storeNewsEnabled } from '@/libs/store';
  import type { NewsItem } from '@/utils/types';
  import { get } from 'svelte/store';

  let t = i18n.t;

  let newsEnabled = $state(get(storeNewsEnabled));
  let newsItems = $state<NewsItem[]>(get(storeNewsCache) ?? []);

  storeNewsEnabled.subscribe((value) => {
    newsEnabled = value;
  });

  storeNewsCache.subscribe((value) => {
    newsItems = value ?? [];
  });
</script>

<main class="main">
  <div class="container">
    <Header logoSize={64} twoRows={true} />

    <div class="inner-container settings">
      <h4>{t('global.options')}</h4>
      <Status />
    </div>

    <div class="settings">
      <h4>{t('popup.tools')}</h4>
      <ul>
        <li>
          <span class="feature">{t('popup.settings')}</span>
          <span class="feature-link">
            <Button url="wizard.html" size="small">{t('popup.wizard')}</Button>
          </span>
        </li>
        <li>
          <span class="feature">{t('global.support')}</span>
          <span class="feature-link">
            <Button url={CONFIG_WWW_HELP} size="small">{t('popup.help')}</Button>
          </span>
        </li>
      </ul>
    </div>

    {#if newsEnabled}
      <div class="settings news-section">
        <h4>{t('options.newsTitle')}</h4>
        {#if newsItems.length > 0}
          <ul class="news-list">
            {#each newsItems as item (item.id)}
              <li>
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                <span class="news-date">{item.date}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="news-empty">{t('options.newsEmpty')}</p>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style lang="scss">
  :global(html) {
    // This controls the minimum popup width
    min-width: 30rem;
    // This controls the minimum popup height
    min-height: 35rem;
  }

  .news-section {
    .news-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: 0.75rem 0;
        border-bottom: 0.0625rem solid var(--color-secondary, #eee);

        &:last-child {
          border-bottom: none;
        }

        a {
          display: block;
          color: var(--text-color-light, #333);
          text-decoration: none;
          font-size: 1rem;
          margin-bottom: 0.25rem;

          &:hover {
            text-decoration: underline;
          }
        }

        .news-date {
          font-size: 0.85rem;
          color: var(--text-color-muted, #999);
        }
      }
    }

    .news-empty {
      color: var(--text-color-muted, #999);
      font-style: italic;
      padding: 0.5rem 0;
    }
  }
</style>
