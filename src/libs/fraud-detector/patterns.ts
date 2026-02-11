import { ScanLevel, ThreatCategory, type WeightedPattern } from './types';

export const WEIGHTED_PATTERNS: readonly WeightedPattern[] = [
  // Obfuscation patterns
  { re: /eval\s*\(/gi, weight: 10, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.LIGHT },
  { re: /Function\s*\(/gi, weight: 8, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.LIGHT },
  { re: /setTimeout\s*\(\s*["'`][^"'`]*["'`]/gi, weight: 6, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.LIGHT },
  { re: /setInterval\s*\(\s*["'`][^"'`]*["'`]/gi, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },

  // Data exfiltration patterns
  { re: /document\.cookie/gi, weight: 7, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.LIGHT },
  { re: /localStorage\./gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /sessionStorage\./gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /\.send\s*\(/gi, weight: 5, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /fetch\s*\(/gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /XMLHttpRequest/gi, weight: 5, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },

  // DOM manipulation for fraud
  { re: /createElement\s*\(\s*["'`]iframe["'`]/gi, weight: 3, category: ThreatCategory.DOM_INJECTION, minScanLevel: ScanLevel.DEEP },
  { re: /createElement\s*\(\s*["'`]script["'`]/gi, weight: 3, category: ThreatCategory.DOM_INJECTION, minScanLevel: ScanLevel.DEEP },
  { re: /innerHTML\s*=/gi, weight: 4, category: ThreatCategory.DOM_INJECTION, minScanLevel: ScanLevel.DEEP },
  { re: /outerHTML\s*=/gi, weight: 3, category: ThreatCategory.DOM_INJECTION, minScanLevel: ScanLevel.DEEP },

  // Keylogging patterns
  { re: /addEventListener\s*\(\s*["'`]keydown["'`]/gi, weight: 9, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.LIGHT },
  { re: /addEventListener\s*\(\s*["'`]keyup["'`]/gi, weight: 9, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.LIGHT },
  { re: /addEventListener\s*\(\s*["'`]keypress["'`]/gi, weight: 9, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.LIGHT },
  { re: /onkeydown\s*=/gi, weight: 3, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.DEEP },
  { re: /onkeyup\s*=/gi, weight: 3, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.DEEP },
  { re: /addEventListener\s*\(\s*["'`]key/gi, weight: 9, category: ThreatCategory.KEYLOGGING, minScanLevel: ScanLevel.LIGHT },

  // Form hijacking
  { re: /addEventListener\s*\(\s*["'`]submit["'`]/gi, weight: 3, category: ThreatCategory.FORM_HIJACK, minScanLevel: ScanLevel.DEEP },
  { re: /onsubmit\s*=/gi, weight: 3, category: ThreatCategory.FORM_HIJACK, minScanLevel: ScanLevel.DEEP },
  { re: /form\.submit/gi, weight: 3, category: ThreatCategory.FORM_HIJACK, minScanLevel: ScanLevel.DEEP },

  // Suspicious encoding
  { re: /atob\s*\(/gi, weight: 6, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.LIGHT },
  { re: /btoa\s*\(/gi, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },
  { re: /unescape\s*\(/gi, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },
  { re: /decodeURIComponent\s*\(/gi, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },

  // Common fraud domains/patterns
  { re: /paypal[^\.]/gi, weight: 8, category: ThreatCategory.PHISHING, minScanLevel: ScanLevel.LIGHT },
  { re: /amazon[^\.]/gi, weight: 3, category: ThreatCategory.PHISHING, minScanLevel: ScanLevel.DEEP },
  { re: /google[^\.]/gi, weight: 3, category: ThreatCategory.PHISHING, minScanLevel: ScanLevel.DEEP },
  { re: /microsoft[^\.]/gi, weight: 3, category: ThreatCategory.PHISHING, minScanLevel: ScanLevel.DEEP },
  { re: /apple[^\.]/gi, weight: 3, category: ThreatCategory.PHISHING, minScanLevel: ScanLevel.DEEP },

  // Cryptocurrency mining
  { re: /CoinHive/gi, weight: 10, category: ThreatCategory.MINING, minScanLevel: ScanLevel.LIGHT },
  { re: /coinhive/gi, weight: 10, category: ThreatCategory.MINING, minScanLevel: ScanLevel.LIGHT },
  { re: /crypto-loot/gi, weight: 3, category: ThreatCategory.MINING, minScanLevel: ScanLevel.DEEP },
  { re: /WebAssembly/gi, weight: 3, category: ThreatCategory.MINING, minScanLevel: ScanLevel.DEEP },

  // Screen capture
  { re: /getDisplayMedia/gi, weight: 3, category: ThreatCategory.MEDIA_ACCESS, minScanLevel: ScanLevel.DEEP },
  { re: /getUserMedia/gi, weight: 3, category: ThreatCategory.MEDIA_ACCESS, minScanLevel: ScanLevel.DEEP },
  { re: /captureStream/gi, weight: 3, category: ThreatCategory.MEDIA_ACCESS, minScanLevel: ScanLevel.DEEP },

  // Geolocation tracking
  { re: /navigator\.geolocation/gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /getCurrentPosition/gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },

  // Clipboard access
  { re: /clipboard\.read/gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },
  { re: /clipboard\.write/gi, weight: 3, category: ThreatCategory.EXFILTRATION, minScanLevel: ScanLevel.DEEP },

  // Suspicious string patterns
  { re: /String\.fromCharCode/gi, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },
  { re: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, weight: 3, category: ThreatCategory.OBFUSCATION, minScanLevel: ScanLevel.DEEP },
];

export function getPatternsForLevel(level: ScanLevel): readonly WeightedPattern[] {
  if (level === ScanLevel.DEEP) {
    return WEIGHTED_PATTERNS;
  }

  return WEIGHTED_PATTERNS.filter((p) => p.minScanLevel === ScanLevel.LIGHT);
}
