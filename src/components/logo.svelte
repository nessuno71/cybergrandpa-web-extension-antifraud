<script lang="ts">
  import type { LogoProps } from '@/utils';

  let { size = 128, alt = '' }: LogoProps = $props();

  // svelte-ignore state_referenced_locally
  const src = browser.runtime.getURL(`/icon/${size}.png` as never);
</script>

<div class="logo">
  <img {src} width={size} height={size} {alt} />
</div>

<style lang="scss">
  .logo {
    background-color: var(--background-color-light);
    border-radius: 100%;
    display: block;

    img {
      display: block;
      margin: 0 auto;
    }
  }
</style>
