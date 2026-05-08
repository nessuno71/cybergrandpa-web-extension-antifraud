# Component Instructions

Svelte 5 component patterns and conventions for the CyberGrandpa extension.

## Core Requirements

- All components must use Svelte 5 runes syntax
- Use TypeScript with strict typing
- Follow the established component structure
- Use SASS/SCSS with modular styling

## Component Structure

```svelte
<script lang="ts">
  import type { ComponentProps } from '@/utils';

  interface Props {
    label: string;
    onClick?: () => void;
  }

  let { label, onClick }: Props = $props();

  // Use runes for reactivity
  let isActive = $state(false);
  let displayText = $derived(label + (isActive ? ' (active)' : ''));

  $effect(() => {
    console.log('Component mounted or props changed');
  });
</script>

<button onclick={onClick} class:active={isActive}>
  {displayText}
</button>

<style lang="scss">
  button {
    color: var(--text-color-light);
    transition: all 0.2s ease;

    &.active {
      background-color: var(--accent-color);
    }
  }
</style>
```

## Base UI Components

- `button.svelte` - Standard button with variants
- `modal.svelte` - Modal dialog with overlay
- `toggle.svelte` - On/off toggle switch
- `status.svelte` - Status indicator with colors
- `header.svelte` - Consistent header component

## App Components

- `apps/overlay-loading-app.svelte` - Scanning overlay UI
- Entrypoint-specific components in respective folders

## Icon Components

- Icons in `icons/` folder
- Use consistent naming: `icon-name.svelte`
- Accept size and color props

## Styling Guidelines

- Use SCSS with modular architecture
- CSS variables for theming
- PostCSS with rem-to-px conversion
- BEM-like class naming for components
- Responsive design with mobile-first approach

## Props and Events

- Define explicit interfaces for all props
- Use `onclick` for simple events
- Use `dispatch()` for custom events
- Prefer callbacks over event dispatchers when possible

## Accessibility

- All interactive elements must have ARIA labels
- Support keyboard navigation
- Use semantic HTML elements
- Provide focus indicators
- Test with screen readers

## Performance

- Use `$derived` for computed values
- Avoid unnecessary re-renders
- Implement virtual scrolling for large lists
- Lazy load heavy components
