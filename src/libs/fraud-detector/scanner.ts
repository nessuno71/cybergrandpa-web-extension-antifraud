import { analyzeScript } from './analyzer';
import { extractPageScripts, fetchExternalScript } from './extractor';
import { getPatternsForLevel } from './patterns';
import { generateReport } from './reporter';
import { ScanLevel, type FraudReport, type PageAnalysisResult, type ScriptAnalysisResult } from './types';

// Light scan: inline scripts + event handlers only, high-weight patterns, no external fetch
export async function scanLight(doc?: Document): Promise<FraudReport> {
  const scripts = extractPageScripts(doc);
  const patterns = getPatternsForLevel(ScanLevel.LIGHT);
  const results: ScriptAnalysisResult[] = [];

  // Light scan skips external scripts (no fetch) — only analyze scripts with content
  for (const script of scripts) {
    if (script.type === 'external') continue;

    const content = script.content;
    if (content) {
      const analysis = analyzeScript(content, patterns, script);
      if (analysis.suspicious || analysis.score > 5) {
        results.push(analysis);
      }
    }
  }

  const analysisResult: PageAnalysisResult = {
    totalScripts: scripts.length,
    suspiciousScripts: results.length,
    results: results,
    timestamp: new Date().toISOString(),
  };

  return generateReport(analysisResult);
}

// Deep scan: all scripts including external fetch, full pattern set
export async function scanDeep(doc?: Document): Promise<FraudReport> {
  const scripts = extractPageScripts(doc);
  const patterns = getPatternsForLevel(ScanLevel.DEEP);
  const results: ScriptAnalysisResult[] = [];

  for (const script of scripts) {
    let content = script.content;

    // Fetch external scripts if needed
    if (script.type === 'external' && script.source) {
      content = await fetchExternalScript(script.source);
    }

    if (content) {
      const analysis = analyzeScript(content, patterns, script);
      if (analysis.suspicious || analysis.score > 5) {
        results.push(analysis);
      }
    }
  }

  const analysisResult: PageAnalysisResult = {
    totalScripts: scripts.length,
    suspiciousScripts: results.length,
    results: results,
    timestamp: new Date().toISOString(),
  };

  return generateReport(analysisResult);
}
