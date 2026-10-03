/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/types/index.ts
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Type definitions and interface contracts for the Fiona Identity Resolution Engine.
 * Covers biometric document attributes, optical character recognition (OCR) payloads,
 * sovereign registry verification records (REG_UA_TAX, REG_SE_MIGRATION, REG_EU_VISA),
 * deterministic reconciliation results, and eIDAS 2.0 compliant audit trail events.
 * ================================================================================
 */

export type PresetScenarioId = 'scenario_1' | 'scenario_2' | 'scenario_3';
export type ScenarioId = PresetScenarioId | 'custom_upload';

export type StatusColor = 'green' | 'red' | 'amber' | 'neutral';

export interface DocumentInfo {
  type: string;
  issuingCountry: string;
  documentNumber: string;
  rawName: string;
  normalizedName: string;
  dobRaw: string;
  dobIso: string;
  placeOfBirth: string;
  sex: string;
  expiryDate: string;
  mrzLine1: string;
  mrzLine2: string;
  scanConfidence: number;
  opticalCheck: string;
  imagePreview?: string;
  scriptDetected?: string;
  unreadableFields?: string[];
}

export interface RegistryRecord {
  id: string;
  name: string;
  status: 'MATCHED' | 'CONFLICT' | 'NOT_APPLICABLE' | 'PENDING' | 'BLOCKED_PENDING_CLERICAL_OVERRIDE';
  statusLabel: string;
  matchConfidence: number;
  recordId: string;
  registeredName: string;
  registeredDob: string;
  statusColor: StatusColor;
  details: string;
}

export interface ReconciliationData {
  confidenceScore: number;
  verdict:
    | 'AUTO-MERGE'
    | 'FLAGGED FOR HUMAN CLERICAL REVIEW'
    | 'MANUAL_REVIEW_REQUIRED'
    | 'CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION';
  verdictSummary: string;
  color: 'green' | 'red';
  scriptTransliterationStatus: string;
  dateNormalizationStatus: string;
  vectorSimilarity: number;
  reconciliationRulesApplied: string[];
  isCriticalError?: boolean;
  missingCriticalFields?: string[];
  isAutoMergeLocked?: boolean;
  manualOverrideApplied?: boolean;
}

export interface ScenarioBadge {
  label: string;
  score: number;
  status: 'APPROVED' | 'FLAGGED';
  color: 'green' | 'red';
  threshold: number;
  eidasLoa: 'HIGH' | 'SUBSTANTIAL_ONLY';
}

export interface GoldenRecordData {
  standardized_first_name: string;
  standardized_last_name: string;
  native_script_full_name: string;
  iso_date_of_birth: string;
  cross_border_match_confidence: number;
}

export interface EuWalletGoldenRecord {
  status:
    | 'VERIFIED_GOLDEN_RECORD'
    | 'FLAGGED_PENDING_CLERICAL_REVIEW'
    | 'BLOCKED_INSUBSTANTIAL_DOCUMENTATION';
  eidas_compliance_version: '2.0';
  golden_record: GoldenRecordData;
  data_lineage_audit: string[];
}

export interface ScenarioConfig {
  id: ScenarioId;
  tabLabel: string;
  title: string;
  description: string;
  badge: ScenarioBadge;
  document: DocumentInfo;
  registries: {
    REG_UA_TAX: RegistryRecord;
    REG_SE_MIGRATION: RegistryRecord;
    REG_EU_VISA: RegistryRecord;
  };
  reconciliation: ReconciliationData;
  goldenRecord?: EuWalletGoldenRecord;
  reasoningLog: string[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  action:
    | 'APPROVE_MASTER_PROFILE'
    | 'FLAG_FOR_REVIEW'
    | 'RESCAN_DOCUMENT'
    | 'SCENARIO_SWITCH'
    | 'MANUAL_CLERICAL_OVERRIDE';
  scenarioId: ScenarioId;
  operatorId: string;
  confidenceScore: number;
  verdict: string;
  details: string;
}
