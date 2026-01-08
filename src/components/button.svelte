<script lang="ts">
  import { browser } from 'wxt/browser';
  import { logger } from '@/utils/logger';
  import type { ButtonProps } from '@/utils';

  let { children, url, onClick, size, disabled, loading = false }: ButtonProps = $props();

  if (!!url && !!onClick) {
    logger.error('Button: Either url or onClick should be defined, not both');
  } else if (!url && !onClick) {
    logger.error('Button: Either only url or only onClick should be defined');
  } else {
    if (!!url && !onClick) {
      onClick = () => browser.tabs.create({ url, active: true });
    }
  }

  let style = [
    `--font-size: ${size === 'small' ? '0.8rem' : size === 'large' ? '1.3rem' : '1rem'}`,
    `--padding-size: ${size === 'small' ? '.3rem .6rem' : size === 'large' ? '.25rem .8125rem' : '0.3rem 0.5rem'}`,
  ].join(';');
</script>

<button class="button {loading && 'running'}" onclick={onClick} {style} {disabled}>
  {@render children()}
</button>

<style lang="scss">
  .button {
    min-width: 5.25rem;
    font-size: var(--font-size);
    font-family: Arial;
    padding: var(--padding-size);
    border-width: 0.0625rem;
    font-weight: bold;
    cursor: pointer;
    text-transform: uppercase;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    color: var(--text-color-light);
    border-color: var(--color-tertiary);
    box-shadow: 0rem 0.0625rem 0rem 0rem var(--color-primary);
    text-shadow: 0rem 0.0625rem 0rem var(--color-primary);
    background: linear-gradient(var(--color-primary), var(--color-tertiary));

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.running {
      cursor: progress;
    }
  }

  .button:hover {
    background: linear-gradient(var(--color-tertiary), var(--color-primary));
  }
</style>
