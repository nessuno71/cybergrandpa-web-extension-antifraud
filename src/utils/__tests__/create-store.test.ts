import { fakeBrowser } from '@webext-core/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../create-store';

describe('createStore', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('initializes with a fallback value', async () => {
    const store = createStore('default', 'local:test-key');
    const value = await store.ready();
    expect(value).toBe('default');
  });

  it('set updates the value', async () => {
    const store = createStore('default', 'local:test-set');
    await store.set('new-value');
    const value = await store.ready();
    expect(value).toBe('new-value');
  });

  // NOTE: The 'subscribe receives updates' test is skipped because
  // @webext-core/fake-browser doesn't implement storage.onChanged events,
  // which WXT's storage.watch relies on. The subscribe mechanism works in
  // real browsers but can't be tested with the fake browser.
  it.skip('subscribe receives updates', async () => {
    const store = createStore('initial', 'local:test-subscribe');
    let received = 'initial';

    store.subscribe((value) => {
      received = value;
    });

    await store.set('updated');
    await vi.waitFor(() => expect(received).toBe('updated'), { timeout: 1000 });
  });

  it('persists across store instances (same key)', async () => {
    const store1 = createStore('first', 'local:test-persist');
    await store1.set('persisted-value');

    const store2 = createStore('different-default', 'local:test-persist');
    const value = await store2.ready();
    expect(value).toBe('persisted-value');
  });

  it('works with boolean values', async () => {
    const store = createStore(false, 'local:test-bool');
    await store.set(true);
    const value = await store.ready();
    expect(value).toBe(true);
  });

  it('works with object values', async () => {
    const store = createStore<{ name: string } | null>(null, 'local:test-obj');
    await store.set({ name: 'test' });
    const value = await store.ready();
    expect(value).toEqual({ name: 'test' });
  });
});
