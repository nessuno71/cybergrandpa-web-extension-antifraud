<script lang="ts">
  import Modal from '@/components/modal.svelte';
  import { getUrlService } from '@/libs/urls-service';

  interface Props {
    onClose: () => void;
    // Skip the artificial minimum loading duration below; used when the caller
    // (real-time protection) already confirmed the page is malicious.
    immediate?: boolean;
  }

  const MIN_LOADER_MS = 1000;

  let { onClose, immediate = false }: Props = $props();

  let loader = $state(true);
  let hasIssues = $state(false);
  let t = i18n.t;

  $effect(() => {
    let cancelled = false;

    (async () => {
      const startTime = performance.now();
      const found = await getUrlService().seek(window.location.href);

      if (!immediate) {
        const remainingMs = MIN_LOADER_MS - (performance.now() - startTime);

        if (remainingMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingMs));
        }
      }

      if (cancelled) return;

      loader = false;
      hasIssues = found;
    })();

    return () => {
      cancelled = true;
    };
  });
</script>

<Modal logo autoShow {loader} {onClose}>
  <h4>{t('overlay.title')}</h4>
  <p>{hasIssues ? t('overlay.truthyMessage') : t('overlay.falsyMessage')}</p>
</Modal>

<style lang="scss">
  :global(body) {
    // overflow: hidden;
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
