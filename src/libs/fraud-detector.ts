export type ScriptType = 'external' | 'inline' | 'event_handler' | 'javascript_url';

export interface ScriptInfo {
  type: ScriptType;
  source: string;
  content: string | null;
  element: Element;
  id: string;
}

export interface PatternMatch {
  pattern: string;
  count: number;
  weight: number;
  score: number;
  samples: string[];
}

export interface ScriptAnalysisResult {
  suspicious: boolean;
  score: number;
  matches: PatternMatch[];
  info?: ScriptInfo;
  entropy?: number;
}

export interface PageAnalysisResult {
  totalScripts: number;
  suspiciousScripts: number;
  results: ScriptAnalysisResult[];
  timestamp: string;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ThreatSummary {
  pattern: string;
  severity: Severity;
}

export interface ReportDetail {
  type: ScriptInfo['type'];
  source: string;
  score: number;
  topThreats: ThreatSummary[];
}

export interface FraudReport {
  summary: {
    totalScripts: number;
    suspiciousCount: number;
    riskLevel: RiskLevel;
    timestamp: string;
  };
  details: ReportDetail[];
}

export class FraudDetector {
  private suspiciousPatterns: RegExp[];
  private weightedPatterns: Map<RegExp, number>;

  constructor() {
    this.suspiciousPatterns = [
      // Obfuscation patterns
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*["'`][^"'`]*["'`]/gi,
      /setInterval\s*\(\s*["'`][^"'`]*["'`]/gi,

      // Data exfiltration patterns
      /document\.cookie/gi,
      /localStorage\./gi,
      /sessionStorage\./gi,
      /\.send\s*\(/gi,
      /fetch\s*\(/gi,
      /XMLHttpRequest/gi,

      // DOM manipulation for fraud
      /createElement\s*\(\s*["'`]iframe["'`]/gi,
      /createElement\s*\(\s*["'`]script["'`]/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,

      // Keylogging patterns
      /addEventListener\s*\(\s*["'`]keydown["'`]/gi,
      /addEventListener\s*\(\s*["'`]keyup["'`]/gi,
      /addEventListener\s*\(\s*["'`]keypress["'`]/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,

      // Form hijacking
      /addEventListener\s*\(\s*["'`]submit["'`]/gi,
      /onsubmit\s*=/gi,
      /form\.submit/gi,

      // Suspicious encoding
      /atob\s*\(/gi,
      /btoa\s*\(/gi,
      /unescape\s*\(/gi,
      /decodeURIComponent\s*\(/gi,

      // Common fraud domains/patterns
      /paypal[^\.]/gi,
      /amazon[^\.]/gi,
      /google[^\.]/gi,
      /microsoft[^\.]/gi,
      /apple[^\.]/gi,

      // Cryptocurrency mining
      /CoinHive/gi,
      /coinhive/gi,
      /crypto-loot/gi,
      /WebAssembly/gi,

      // Screen capture
      /getDisplayMedia/gi,
      /getUserMedia/gi,
      /captureStream/gi,

      // Geolocation tracking
      /navigator\.geolocation/gi,
      /getCurrentPosition/gi,

      // Clipboard access
      /clipboard\.read/gi,
      /clipboard\.write/gi,

      // Suspicious string patterns
      /String\.fromCharCode/gi,
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, // Control characters
    ];

    this.weightedPatterns = new Map<RegExp, number>([
      [/eval\s*\(/gi, 10],
      [/Function\s*\(/gi, 8],
      [/document\.cookie/gi, 7],
      [/atob\s*\(/gi, 6],
      [/XMLHttpRequest/gi, 5],
      [/addEventListener\s*\(\s*["'`]key/gi, 9],
      [/innerHTML\s*=/gi, 4],
      [/setTimeout\s*\(\s*["'`]/gi, 6],
      [/\.send\s*\(/gi, 5],
      [/paypal[^\.]/gi, 8],
      [/CoinHive/gi, 10],
    ]);
  }

  // Extract all JavaScript from the current page
  extractPageScripts(): ScriptInfo[] {
    const scripts: ScriptInfo[] = [];

    try {
      // Inline scripts in <script> tags
      const scriptTags = document.querySelectorAll('script');
      scriptTags.forEach((script, index) => {
        if (script.src) {
          scripts.push({
            type: 'external',
            source: script.src,
            content: null,
            element: script,
            id: `external_${index}`,
          });
        } else if (script.textContent?.trim()) {
          scripts.push({
            type: 'inline',
            source: 'inline',
            content: script.textContent,
            element: script,
            id: `inline_${index}`,
          });
        }
      });

      // Event handlers in HTML attributes
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element, index) => {
        const eventAttrs = Array.from(element.attributes).filter(
          (attr) => attr.name.startsWith('on') && attr.value.trim()
        );

        eventAttrs.forEach((attr) => {
          scripts.push({
            type: 'event_handler',
            source: `${element.tagName.toLowerCase()}.${attr.name}`,
            content: attr.value,
            element: element,
            id: `event_${index}_${attr.name}`,
          });
        });
      });

      // JavaScript URLs (href="javascript:...")
      const jsLinks = document.querySelectorAll<HTMLAnchorElement | HTMLAreaElement>(
        'a[href^="javascript:"], area[href^="javascript:"]'
      );
      jsLinks.forEach((link, index) => {
        scripts.push({
          type: 'javascript_url',
          source: 'javascript_url',
          content: link.href.substring(11), // Remove "javascript:"
          element: link,
          id: `jsurl_${index}`,
        });
      });
    } catch (error) {
      console.error('Error extracting scripts:', error);
    }

    return scripts;
  }

  // Fetch external script content
  async fetchExternalScript(url: string): Promise<string | null> {
    try {
      // Check if URL is from same origin or use proxy for CORS
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.warn(`Could not fetch external script: ${url}`, error);
    }
    return null;
  }

  // Analyze script content for suspicious patterns
  analyzeScript(scriptContent: string, scriptInfo?: ScriptInfo): ScriptAnalysisResult {
    if (!scriptContent || typeof scriptContent !== 'string') {
      return { suspicious: false, score: 0, matches: [] };
    }

    const matches: PatternMatch[] = [];
    let totalScore = 0;

    // Check against suspicious patterns
    this.suspiciousPatterns.forEach((pattern) => {
      const patternMatches = scriptContent.match(pattern);
      if (patternMatches) {
        const weight = this.getWeightForPattern(pattern);
        const score = patternMatches.length * weight;
        totalScore += score;

        matches.push({
          pattern: pattern.toString(),
          count: patternMatches.length,
          weight: weight,
          score: score,
          samples: patternMatches.slice(0, 3), // First 3 matches as samples
        });
      }
    });

    // Additional heuristics
    const entropy = this.calculateEntropy(scriptContent);
    if (entropy > 4.5) {
      totalScore += 5;
      matches.push({
        pattern: 'High entropy (possible obfuscation)',
        count: 1,
        weight: 5,
        score: 5,
        samples: [`Entropy: ${entropy.toFixed(2)}`],
      });
    }

    // Check for heavily minified/obfuscated code
    const lines = scriptContent.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    if (avgLineLength > 200) {
      totalScore += 3;
      matches.push({
        pattern: 'Extremely long lines (possible minification/obfuscation)',
        count: 1,
        weight: 3,
        score: 3,
        samples: [`Avg line length: ${avgLineLength.toFixed(0)}`],
      });
    }

    return {
      suspicious: totalScore > 10,
      score: totalScore,
      matches: matches,
      info: scriptInfo,
      entropy: entropy,
    };
  }

  // Calculate Shannon entropy of text
  calculateEntropy(text: string): number {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const len = text.length;

    for (const char in freq) {
      const p = (freq[char] ?? 0) / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  // Main analysis function
  async analyzePageScripts(): Promise<PageAnalysisResult> {
    const scripts = this.extractPageScripts();
    const results: ScriptAnalysisResult[] = [];

    for (const script of scripts) {
      let content = script.content;

      // Fetch external scripts if needed
      if (script.type === 'external' && script.source) {
        content = await this.fetchExternalScript(script.source);
      }

      if (content) {
        const analysis = this.analyzeScript(content, script);
        if (analysis.suspicious || analysis.score > 5) {
          results.push(analysis);
        }
      }
    }

    return {
      totalScripts: scripts.length,
      suspiciousScripts: results.length,
      results: results,
      timestamp: new Date().toISOString(),
    };
  }

  // Generate a summary report
  generateReport(analysisResult: PageAnalysisResult): FraudReport {
    const report: FraudReport = {
      summary: {
        totalScripts: analysisResult.totalScripts,
        suspiciousCount: analysisResult.suspiciousScripts,
        riskLevel: this.calculateRiskLevel(analysisResult.results),
        timestamp: analysisResult.timestamp,
      },
      details: analysisResult.results.map((result) => ({
        type: result.info!.type,
        source: result.info!.source,
        score: result.score,
        topThreats: result.matches
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((match) => ({
            pattern: match.pattern,
            severity: match.score >= 8 ? Severity.HIGH : match.score >= 5 ? Severity.MEDIUM : Severity.LOW,
          })),
      })),
    };

    return report;
  }

  private calculateRiskLevel(results: ScriptAnalysisResult[]): RiskLevel {
    if (results.length === 0) return RiskLevel.LOW;

    const maxScore = Math.max(...results.map((r) => r.score));
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    if (maxScore >= 20 || avgScore >= 15) return RiskLevel.CRITICAL;
    if (maxScore >= 15 || avgScore >= 10) return RiskLevel.HIGH;
    if (maxScore >= 10 || avgScore >= 7) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private getWeightForPattern(pattern: RegExp): number {
    // WeightedPatterns uses different RegExp instances, so match by source + flags
    for (const [key, weight] of this.weightedPatterns) {
      if (key.source === pattern.source && key.flags === pattern.flags) {
        return weight;
      }
    }
    return 3;
  }
}

// Usage example for browser extension
export async function runFraudDetection(): Promise<FraudReport | null> {
  const detector = new FraudDetector();

  try {
    console.log('Starting fraud detection analysis...');
    const analysis = await detector.analyzePageScripts();
    const report = detector.generateReport(analysis);

    console.log('Analysis Report:', report);

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

// Auto-run on page load (for content script)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void runFraudDetection());
} else {
  void runFraudDetection();
}
