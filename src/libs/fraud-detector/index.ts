export {
  type ScriptType,
  type ScriptInfo,
  type PatternMatch,
  type ScriptAnalysisResult,
  type PageAnalysisResult,
  type ThreatSummary,
  type ReportDetail,
  type FraudReport,
  type WeightedPattern,
  RiskLevel,
  Severity,
  ScanLevel,
  ThreatCategory,
} from './types';

export { scanLight, scanDeep } from './scanner';
export { analyzeScript, calculateEntropy } from './analyzer';
export { extractPageScripts, fetchExternalScript } from './extractor';
export { generateReport, calculateRiskLevel } from './reporter';
export { WEIGHTED_PATTERNS, getPatternsForLevel } from './patterns';
