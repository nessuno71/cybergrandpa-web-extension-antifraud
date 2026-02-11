---
title: Performance Guidelines
description: Performance optimization patterns and best practices
---

# Performance Guidelines

## Blocklist Optimization

- Store blocklist compressed as base64 to minimize storage usage
- Use stream-based decompression for large datasets
- Keep URL array in memory for fast lookups
- Minimize content script injection overhead

## Script Loading

- Lazy load non-critical scripts
- Use dynamic imports for conditional features
- Defer heavy operations until after page load

## Memory Management

- Clean up event listeners on component unmount
- Use WeakMap/WeakSet for temporary object storage
- Avoid memory leaks in long-running background scripts

## Network Optimization

- Cache API responses appropriately
- Use efficient data structures for URL matching
- Batch operations when possible

## UI Performance

- Use Svelte 5 reactivity efficiently
- Avoid unnecessary re-renders with `$derived`
- Implement virtual scrolling for large lists
- Debounce user input events

## Testing Performance

- Monitor extension memory usage
- Test with large blocklists
- Verify startup time on both browsers
- Check impact on page load performance
