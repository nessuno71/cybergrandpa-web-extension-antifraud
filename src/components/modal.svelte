<script lang="ts">
  import { type ModalProps } from '@/utils';
  import { Jumper } from 'svelte-loading-spinners';
  import { fade } from 'svelte/transition';
  import UiMessage from './ui-message.svelte';

  const defaultModalOnClose = () => {
    show = false;
  };

  const onCloseHandler = async () => {
    defaultModalOnClose();

    return new Promise((resolve) => {
      setTimeout(() => {
        onClose();
        resolve(true);
      }, 500);
    });
  };

  let { show = false, autoShow = false, children, onClose = defaultModalOnClose, loader, logo }: ModalProps = $props();

  let t = i18n.t;

  $effect(() => {
    if (!autoShow) return;

    const timeout = setTimeout(() => {
      show = true;
    }, 100);

    return () => clearTimeout(timeout);
  });
</script>

<div class="modal {show ? 'modal--show' : ''}">
  <div class="modal-wrap">
    {#if loader}
      <div transition:fade>
        <Jumper size="10" color="var(--color-primary)" unit="rem" duration="1s" />
      </div>
    {:else if children}
      <div class="modal-content" transition:fade>
        {@render children()}
      </div>
    {/if}

    <button class="modal-btn" onclick={onCloseHandler} aria-label={t('global.close')}>⨯</button>

    {#if logo}
      <div class="modal-logo">
        <UiMessage text={loader ? t('global.scanning') : undefined} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .modal {
    z-index: 9999999999999999;
    position: fixed;
    margin: 0 auto;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    transition: opacity 250ms ease;
    pointer-events: none;
    background: rgba(31, 32, 41, 0.9);
    opacity: 0;

    @media screen and (min-width: 40rem) {
      background: rgba(31, 32, 41, 0.7);
    }

    &.modal--show {
      pointer-events: auto;
      opacity: 1;
    }
  }

  .modal-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 1.25rem;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(1.6);
    transition:
      opacity 250ms 250ms ease,
      transform 300ms 250ms ease;

    .modal--show & {
      opacity: 1;
      transform: scale(1);
      transition:
        opacity 250ms 500ms ease,
        transform 350ms 500ms ease;
    }
  }

  .modal-content {
    position: absolute;
    top: auto;
    display: block;
    width: 100%;
    max-width: 25rem;
    margin: 0 auto;
    border-radius: 0.25rem;
    overflow: hidden;
    padding: 1.25rem;
    background-color: light-dark(var(--background-color-light), var(--background-color-dark));
    -ms-flex-item-align: center;
    align-self: center;
    box-shadow: 0 0.75rem 1.5625rem 0 rgba(199, 175, 189, 0.25);
  }

  .modal-btn {
    position: fixed;
    top: 2rem;
    right: 2rem;
    text-align: center;
    line-height: 0rem;
    font-size: 5rem;
    color: var(--color-primary);
    box-shadow: 0 0.75rem 1.5625rem 0 rgba(16, 39, 112, 0.25);
    cursor: pointer;
    appearance: none;
    border: none;
    background: none;
  }

  .modal-logo {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
  }

  @media screen and (max-width: 40rem) {
    .modal-btn,
    .modal-logo {
      right: auto;
      left: auto;
      width: 100%;
      text-align: center;
    }

    .modal-content {
      max-width: calc(100% - 2rem);
    }
  }
</style>
