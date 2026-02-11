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

export enum ScanLevel {
  LIGHT = 'LIGHT',
  DEEP = 'DEEP',
}

export enum ThreatCategory {
  OBFUSCATION = 'OBFUSCATION',
  EXFILTRATION = 'EXFILTRATION',
  KEYLOGGING = 'KEYLOGGING',
  FORM_HIJACK = 'FORM_HIJACK',
  MINING = 'MINING',
  PHISHING = 'PHISHING',
  DOM_INJECTION = 'DOM_INJECTION',
  MEDIA_ACCESS = 'MEDIA_ACCESS',
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

export type WeightedPattern = Readonly<{
  re: RegExp;
  weight: number;
  category: ThreatCategory;
  minScanLevel: ScanLevel;
}>;
