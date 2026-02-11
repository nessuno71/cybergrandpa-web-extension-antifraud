import type { PatternMatch, ScriptAnalysisResult, ScriptInfo, WeightedPattern } from './types';

// Analyze script content for suspicious patterns
export function analyzeScript(
  scriptContent: string,
  patterns: readonly WeightedPattern[],
  scriptInfo?: ScriptInfo
): ScriptAnalysisResult {
  if (!scriptContent || typeof scriptContent !== 'string') {
    return { suspicious: false, score: 0, matches: [] };
  }

  const matches: PatternMatch[] = [];
  let totalScore = 0;

  // Check against suspicious patterns
  patterns.forEach((pattern) => {
    const patternMatches = scriptContent.match(pattern.re);
    if (patternMatches) {
      const score = patternMatches.length * pattern.weight;
      totalScore += score;

      matches.push({
        pattern: pattern.re.toString(),
        count: patternMatches.length,
        weight: pattern.weight,
        score: score,
        samples: patternMatches.slice(0, 3), // First 3 matches as samples
      });
    }
  });

  // Additional heuristics
  const entropy = calculateEntropy(scriptContent);
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
export function calculateEntropy(text: string): number {
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
