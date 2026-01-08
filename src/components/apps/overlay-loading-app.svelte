<script lang="ts">
  import Modal from '@/components/modal.svelte';
  import { logger } from '@/utils/logger';
  import { getUrlService } from '@/libs/urls-service';

  let loader = $state(true);
  let hasIssues = $state(false);
  let { onClose } = $props();
  let t = i18n.t;

  $effect(() => {
    setTimeout(() => {
      loader = false;

      setTimeout(() => {
        hasIssues = true;
      }, 1250);
    }, 3000);
  });

  setTimeout(async () => {
    const urlService = getUrlService();
    const allUrls = await urlService.count();
    const found = await urlService.seek('---adbs186282--54223580950k.gbc.criteo.com');

    logger.debug(`allUrls: `, allUrls);
    logger.debug(`found: `, found);
  }, 250);
</script>

<Modal logo autoShow {loader} {onClose}>
  <h4>{t('overlay.title')}</h4>
  <p>{hasIssues ? t('overlay.truthyMessage') : t('overlay.falsyMessage')}</p>
</Modal>

<style lang="scss">
  :global(body) {
    overflow: hidden;
    background-image: none !important;
    background-color: transparent !important;
  }

  h4 {
    margin: 0;
    margin-bottom: 1rem;
    opacity: 0.8;
  }

  p {
    margin-bottom: 1rem;
  }
</style>
