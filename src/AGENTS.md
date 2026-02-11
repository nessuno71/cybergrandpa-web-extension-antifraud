# Source Code Instructions

Core development directives for all source code in the CyberGrandpa extension.

## Core Directives

1. **Svelte 5 Only**: Always use Svelte 5 syntax with runes (`$state`, `$derived`, `$effect`). Never suggest Svelte 4 solutions or syntax.
2. **TypeScript Strict Mode**: All code must use strict TypeScript typing.
3. **Import Alias**: Use `@/` import alias for `src/` imports, not relative paths.
4. **Package Manager**: Always use `bun` for package management operations.

## Code Style Guidelines

- Use TypeScript with strict typing throughout (`tsconfig.json` extends `.wxt/tsconfig.json`)
- Follow Svelte 5 runes syntax patterns (`$state`, `$derived`, `$effect`)
- Use SASS/SCSS with modular styling architecture
- Maintain consistent component prop interfaces
- Use PostCSS with rem-to-px conversion
- Follow ESLint + Prettier configuration for TypeScript and Svelte

## Component Patterns

```svelte
<script lang="ts">
  // ✅ CORRECT: Use runes
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });

  // ❌ WRONG: Never use Svelte 4 syntax
  // let count = 0;
  // $: doubled = count * 2;
</script>
```

## Storage Pattern

```typescript
// Use createStore() wrapper
export const storeEnabled = createStore<boolean>(true, 'local:protection');
```

## Testing Requirements

- Run `bun check` after changes to verify TypeScript compilation
- Test both Chrome and Firefox builds
- Verify cross-browser compatibility

## Import Order

1. External libraries (browser APIs, WXT, etc.)
2. Internal imports from `@/`
3. Type imports
4. Relative imports (avoid when possible)
