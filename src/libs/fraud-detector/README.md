# Fraud Detector

Heuristic-based script analysis library for the CyberGrandpa anti-fraud browser extension. Extracts all JavaScript from a webpage and scores it against weighted suspicious patterns.

## Scan Tiers

| Tier      | Who                                        | Trigger                             | What it checks                                                                                    | Perf budget |
| --------- | ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| **Light** | Premium (realtime) / Basic (manual)        | Auto on navigation or manual "Scan" | Inline scripts + event handlers, high-weight patterns only (≥6), entropy check, no external fetch | <50ms       |
| **Deep**  | Premium (realtime on idle) / Both (manual) | Page idle or manual "Deep Scan"     | All scripts incl. external fetch, full pattern set, entropy + minification heuristics             | <500ms      |

## Usage

### Light scan (fast, inline-only)

```typescript
import { scanLight } from '@/libs/fraud-detector';

const report = await scanLight();
console.log(report.summary.riskLevel); // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
```

### Deep scan (full, includes external scripts)

```typescript
import { scanDeep } from '@/libs/fraud-detector';

const report = await scanDeep();
console.log(report.summary.suspiciousCount);
console.log(report.details);
```

### Integration with browser extension

```typescript
import { scanLight, scanDeep, type FraudReport } from '@/libs/fraud-detector';

// Usage example for browser extension content script
async function runFraudDetection(deep = false): Promise<FraudReport | null> {
  try {
    const report = deep ? await scanDeep() : await scanLight();

    // Send results to extension background script or popup
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'FRAUD_ANALYSIS_RESULT',
        data: report,
      });
    }

    return report;
  } catch (error) {
    console.error('Fraud detection failed:', error);
    return null;
  }
}
```

### Auto-run on page load (for content script)

```typescript
import { scanLight } from '@/libs/fraud-detector';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void scanLight());
} else {
  void scanLight();
}
```

## Architecture

```
fraud-detector/
├── index.ts       — Public barrel exports
├── types.ts       — All interfaces, enums, types
├── patterns.ts    — Weighted regex patterns with category + scan level tags
├── extractor.ts   — DOM script extraction + external fetch
├── analyzer.ts    — Pattern matching + entropy calculation
├── reporter.ts    — Report generation + risk level calculation
├── scanner.ts     — Orchestrator: scanLight() + scanDeep()
└── README.md      — This file
```

## Detection Categories

- **OBFUSCATION** — eval, Function constructor, atob/btoa, encoding tricks
- **EXFILTRATION** — cookie access, storage, network requests, geolocation, clipboard
- **KEYLOGGING** — keyboard event listeners and handlers
- **FORM_HIJACK** — form submit interception
- **MINING** — CoinHive, crypto-loot, WebAssembly abuse
- **PHISHING** — brand name spoofing (PayPal, Amazon, etc.)
- **DOM_INJECTION** — dynamic iframe/script creation, innerHTML manipulation
- **MEDIA_ACCESS** — screen capture, camera/mic access
