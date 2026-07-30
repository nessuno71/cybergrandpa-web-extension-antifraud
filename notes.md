# Development Notes

This file contains development notes, code snippets, and examples for the CyberGrandpa AntiFraud browser extension.

## Internationalization (i18n)

### Basic i18n Usage

```javascript
// Set document language
document.documentElement.lang = lang;

// Get browser UI language
console.log(browser.i18n.getUILanguage());

// Set document title
document.title = i18n.t('popup.title');

// Set element text content with parameters
declare const messageH1: HTMLHeadingElement;
messageH1.textContent = i18n.t('popup.hello', ['John Smith']);
```

## Background Script Examples

### Basic Message Handling

```typescript
import { Runtime } from 'wxt/browser';

export default defineBackground(() => {
  // Setup listener for one-time messages
  browser.runtime.onMessage.addListener((message) => {
    // Only respond to hello messages
    if (message.type === 'hello')
      // Returning a promise will send a response back to the sender
      return Promise.resolve(`Hello ${message.name}, this is the background!`);

    throw Error('Unknown message');
  });

  // Setup broadcast channel to send messages to all connected ports
  let ports: Runtime.Port[] = [];
  setInterval(() => {
    const message = { date: Date.now(), value: Math.random() };
    ports.forEach((port) => port.postMessage(message));
  }, 1e3);
  
  browser.runtime.onConnect.addListener((port) => {
    ports.push(port);
    port.onDisconnect.addListener(() => {
      ports.splice(ports.indexOf(port), 1);
    });
  });
});
```

### Port Communication

```typescript
// Setup broadcast channel to send messages to all connected ports
const ports: Runtime.Port[] = [];

// Listen for new connections
browser.runtime.onConnect.addListener((port) => {
  ports.push(port as Runtime.Port);
  
  port.onDisconnect.addListener(() => {
    ports.splice(ports.indexOf(port as Runtime.Port), 1);
  });
});

// Connect to background script
const port = browser.runtime.connect();

port.onMessage.addListener(portMessageHandler);

const portMessageHandler = (message: string) => {
  longLivedMessageList.push(JSON.stringify(message));
  console.dir(longLivedMessageList);
  return;
};

// Cleanup
port.onMessage.removeListener(portMessageHandler);
port.disconnect();
```

## Storage

### Custom Store Implementation

Reference: [WXT Svelte Custom Store Example](https://github.com/wxt-dev/examples/blob/main/examples/svelte-custom-store/src/lib/store.ts)

## URL Blocking

### Blocklist Source

The extension uses the following URL for the blocklist:

```txt
https://hblock.molinero.dev/hosts
```

### URL Processing

```typescript
const getArrayFromStream = (body: string) => {
  return body
    .split('\n')
    .filter((x) => x.length > 0 && !x.startsWith('#'))
    .map((x) => x.replace('0.0.0.0 ', ''));
};
```

## Browser Extensions API

### Background Page Access

```javascript
let page = browser.extension.getBackgroundPage()
```

### Notifications

```javascript
let options = {
  type: 'basic',
  title: 'Basic Notification',
  message: 'This is a Basic Notification',
  iconUrl: 'icon.png'
};
chrome.notifications.create(options);
```

### Badge Text

```javascript
chrome.browserAction.setBadgeText({ text: badgeText });
```

## Service Worker Management

### Keep Service Worker Alive

```typescript
async function waitUntil(promise) {
  const keepAlive = setInterval(chrome.runtime.getPlatformInfo, 25 * 1000);
  try {
    await promise;
  } finally {
    clearInterval(keepAlive);
  }
}

// Usage
waitUntil(someExpensiveCalculation());
```

Reference: [Chrome Service Worker Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep_a_service_worker_alive_continuously)

### Unlisted Script Example

```typescript
const init = () => {
  console.log('Hello from worker');
  return urlService;
};

export default defineUnlistedScript({
  main: init,
});
```

## Stream Processing

### Compressed Stream Storage Example

```typescript
// Usage example
async function example() {
    // Create a sample stream
    const text = 'Hello, World!';
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(text));
            controller.close();
        }
    });

    // Save the compressed stream
    await saveCompressedStreamToStorage('myKey', stream);

    // Later, retrieve and decompress the stream
    const decompressedStream = await getDecompressedStreamFromStorage('myKey');
    
    // Read the decompressed data
    const reader = decompressedStream.getReader();
    const chunks = [];
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const decompressedText = new TextDecoder().decode(
        new Uint8Array(chunks.flat())
    );
    console.log('Decompressed text:', decompressedText);
}
```

## System Notes

### SSH Recovery

```txt
Starting additional sshd

To make recovery in case of failure easier, an additional sshd will
be started on port '1022'. If anything goes wrong with the running
ssh you can still connect to the additional one.
If you run a firewall, you may need to temporarily open this port. As
this is potentially dangerous it's not done automatically. You can
open the port with e.g.:
'iptables -I INPUT -p tcp --dport 1022 -j ACCEPT'

To continue please press [ENTER]
```

## WXT Module Development

### Custom Entrypoint Example

```typescript
// export default defineWxtModule(async (wxt) => {
//   const entrypointPath = '/path/to/my-entrypoint.ts';

//   addEntrypoint(wxt, {
//     type: 'background',
//     name: 'some-name',
//     inputPath: entrypointPath,
//     outputDir: wxt.config.outDir,
//     options: await wxt.builder.importEntrypoint(entrypointPath),
//   });
// });
```
