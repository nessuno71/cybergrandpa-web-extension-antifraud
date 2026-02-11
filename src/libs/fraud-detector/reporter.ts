import { RiskLevel, Severity, type FraudReport, type PageAnalysisResult, type ScriptAnalysisResult } from './types';

// Generate a summary report
export function generateReport(analysisResult: PageAnalysisResult): FraudReport {
  const report: FraudReport = {
    summary: {
      totalScripts: analysisResult.totalScripts,
      suspiciousCount: analysisResult.suspiciousScripts,
      riskLevel: calculateRiskLevel(analysisResult.results),
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

export function calculateRiskLevel(results: ScriptAnalysisResult[]): RiskLevel {
  if (results.length === 0) return RiskLevel.LOW;

  const maxScore = Math.max(...results.map((r) => r.score));
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  if (maxScore >= 20 || avgScore >= 15) return RiskLevel.CRITICAL;
  if (maxScore >= 15 || avgScore >= 10) return RiskLevel.HIGH;
  if (maxScore >= 10 || avgScore >= 7) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}
