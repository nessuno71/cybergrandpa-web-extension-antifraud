# Utility Functions Instructions

Patterns for utility functions and helpers in the CyberGrandpa extension.

## Key Utility Categories

### Stream Processing

- `GetStream` - Fetch and handle response streams
- `decompressReadableStream()` - Decompress gzipped content
- `convertReadableStreamToString()` - Convert streams to text

### Storage Helpers

- `createStore()` - Wrapper around WXT storage API
- Provides typed storage with sync/local prefixes
- Handles serialization and deserialization

### Cross-Context Messaging

- `forwardMessageToCss()` - Forward messages between contexts
- Handle message routing and response aggregation
- Validate message types and payloads

### Tab Management

- `activateTab()` - Focus and bring tab to front
- `getTabId()` - Get current tab ID safely
- Handle tab creation and updates

### Parsing Utilities

- `getArrayFromString()` - Parse hosts file format
- URL validation and normalization
- Domain extraction and comparison

## Utility Function Patterns

```typescript
// Pure functions with clear inputs/outputs
export function parseDomain(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return null;
  }
}

// Async utilities with proper error handling
export async function fetchWithTimeout(url: string, ms = 5000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);

    const response = await fetch(url, { signal: controller.signal });
    return response;
  } catch {
    return null;
  }
}
```

## Error Handling

- Always handle errors gracefully
- Return null or undefined for expected failures
- Log errors with context
- Never throw from utility functions

## TypeScript Patterns

- Use generic types when appropriate
- Define clear return types
- Use utility types (Partial, Required, etc.)
- Avoid `any` - use `unknown` instead

## Browser API Wrappers

- Wrap browser APIs with error handling
- Provide consistent return types
- Handle both Chrome and Firefox differences
- Use proper async/await patterns

## Performance Considerations

- Memoize expensive computations
- Use efficient algorithms for data processing
- Avoid unnecessary object creation
- Use streams for large data processing

## Testing Utilities

- Export pure functions for easy testing
- Provide mock implementations for browser APIs
- Include test data generators
- Document edge cases and behavior
