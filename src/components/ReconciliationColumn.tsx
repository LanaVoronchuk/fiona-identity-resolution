/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/ReconciliationColumn.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Column 2 of Fiona's 3-column dashboard: Reconciliation Engine & Registry Match.
 * Evaluates identity confidence and renders dynamic status badges:
 * - Green (>= 90%): AUTO-MERGE
 * - Red (< 90%): HUMAN REVIEW REQUIRED
 * Displays 3 sovereign source registry cards:
 * 1. REG_UA_TAX (State Tax Service of Ukraine)
 * 2. REG_SE_MIGRATION (Swedish Migration Agency)
 * 3. REG_EU_VISA (European Visa Information System)
 * Cross-references transliteration standards, vector proximity, and eIDAS 2.0 LoA.
 * ================================================================================
 */

import React from 'react';
import { ReconciliationData, RegistryRecord } from '../types/index.ts';
import { logInfo } from '../utils/logger.ts';
import { ManualOverrideForm } from './ManualOverrideForm.tsx';
import {
  GitMerge,
  ShieldCheck,
  AlertOctagon,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Sparkles,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface ReconciliationColumnProps {
  reconciliation: ReconciliationData;
  registries: {
    REG_UA_TAX: RegistryRecord;
    REG_SE_MIGRATION: RegistryRecord;
    REG_EU_VISA: RegistryRecord;
  };
  scenarioId: string;
  onApplyOverride?: (overrides: {
    documentNumber: string;
    rawName: string;
    normalizedName?: string;
    sex: string;
    dobIso?: string;
  }) => void;
  documentFields?: {
    documentNumber?: string;
    rawName?: string;
    normalizedName?: string;
    sex?: string;
    dobIso?: string;
  };
}

/**
 * Renders Column 2 containing the confidence badge, vector metrics, and 3 registry source cards.
 *
 * @param props - Reconciliation metrics and sovereign registry data.
 * @returns JSX Element for Column 2.
 */
export const ReconciliationColumn: React.FC<ReconciliationColumnProps> = ({
  reconciliation,
  registries,
  scenarioId,
  onApplyOverride,
  documentFields,
}) => {
  const isAutoMerge = !reconciliation.isCriticalError && reconciliation.confidenceScore >= 90;
  const isCriticalError = Boolean(reconciliation.isCriticalError);

  React.useEffect(() => {
    logInfo('ReconciliationColumn', 'render', `Reconciliation evaluated for scenario ${scenarioId}`, {
      score: reconciliation.confidenceScore,
      verdict: reconciliation.verdict,
      isAutoMerge,
      isCriticalError,
    });
  }, [reconciliation, scenarioId, isAutoMerge, isCriticalError]);

  return (
    <div className="flex flex-col h-full bg-[#0d1527] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      {/* Column Title Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0f1930] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-950/70 border border-sky-500/20 text-sky-400">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              02. Reconciliation Engine & Registry Match
            </h2>
            <p className="text-[11px] text-slate-400">Multi-Source Cross-Registry Corroboration</p>
          </div>
        </div>

        {/* Level of Assurance Pill */}
        <div
          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
            isCriticalError
              ? 'bg-red-950/80 border-red-500/50 text-red-300 font-bold'
              : isAutoMerge
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          }`}
        >
          {isCriticalError ? 'LoA SUSPENDED' : isAutoMerge ? 'LoA HIGH' : 'LoA SUBSTANTIAL'}
        </div>
      </div>

      {/* Column Content Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* Dynamic Match Confidence Badge Card */}
        <div
          className={`rounded-xl border p-4.5 transition-colors ${
            isCriticalError
              ? 'bg-gradient-to-br from-[#330f18] via-[#200f1c] to-[#0d1222] border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30'
              : isAutoMerge
              ? 'bg-gradient-to-br from-[#0c261e] via-[#0e1d2c] to-[#0c1626] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
              : 'bg-gradient-to-br from-[#2a1118] via-[#1a1426] to-[#0c1426] border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Cross-Border Consensus Score
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5 flex-wrap">
                <span
                  className={`text-3xl lg:text-4xl font-mono font-bold tracking-tight ${
                    isCriticalError
                      ? 'text-red-400 animate-pulse'
                      : isAutoMerge
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {reconciliation.confidenceScore}%
                </span>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                    isCriticalError
                      ? 'bg-red-950 text-red-200 border-red-500 shadow-md'
                      : isAutoMerge
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/80 text-red-300 border-red-500/40'
                  }`}
                >
                  {isCriticalError ? (
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  ) : isAutoMerge ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>
                    {isCriticalError
                      ? '🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION'
                      : isAutoMerge
                      ? 'AUTO-MERGE'
                      : 'HUMAN REVIEW REQUIRED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Threshold Tag */}
            <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
              <div className={isCriticalError ? 'text-red-400 font-bold' : ''}>
                {isCriticalError ? 'Score < 40% (Degraded)' : 'Rule: Score ≥ 90%'}
              </div>
              <div className="text-slate-500">eIDAS 2.0 Security Floor</div>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
            {reconciliation.verdictSummary}
          </p>

          {/* Auto-Merge Lockout Notice when critical fields unreadable */}
          {isCriticalError && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>AUTO-MERGE TRACK LOCKED:</strong> Insubstantial documentation. Automated resolution is legally prohibited under eIDAS 2.0 LoA High and GDPR Article 22 until manual clerical override is completed.
              </span>
            </div>
          )}

          {/* Metric Matrix Dividers */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-[#090e1a]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Script Transliteration
              </span>
              <span className="text-[11px] font-medium text-slate-200 mt-0.5 block truncate">
                {reconciliation.scriptTransliterationStatus}
              </span>
            </div>
            <div className="p-2 rounded bg-[#090e1a]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Vector Proximity
              </span>
              <span className="text-[11px] font-mono font-medium text-sky-400 mt-0.5 block">
                Cosine Distance: {reconciliation.vectorSimilarity}
              </span>
            </div>
          </div>
        </div>

        {/* 4. HUMAN TRIGGER: Display Manual Override Form when Insubstantial Documentation is Flagged */}
        {isCriticalError && onApplyOverride && (
          <ManualOverrideForm
            missingFields={reconciliation.missingCriticalFields || ['Document Number', 'Full Name', 'Sex']}
            initialValues={documentFields}
            onSubmitOverride={onApplyOverride}
          />
        )}

        {/* 3 Static Sovereign Source Status Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-0.5">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Sovereign Registry Federation (3 Endpoints)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {isCriticalError ? 'Queries Suspended' : 'eIDAS Certified'}
            </span>
          </div>

          {/* Card 1: REG_UA_TAX */}
          <RegistrySourceCard
            record={registries.REG_UA_TAX}
            registryCode="REG_UA_TAX"
          />

          {/* Card 2: REG_SE_MIGRATION */}
          <RegistrySourceCard
            record={registries.REG_SE_MIGRATION}
            registryCode="REG_SE_MIGRATION"
          />

          {/* Card 3: REG_EU_VISA */}
          <RegistrySourceCard
            record={registries.REG_EU_VISA}
            registryCode="REG_EU_VISA"
          />
        </div>

        {/* Rules Applied Snapshot */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Scale className="w-3.5 h-3.5 text-sky-400" />
            <span>Deterministic Consensus Policies</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            {reconciliation.reconciliationRulesApplied.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0 font-mono">0{idx + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface RegistrySourceCardProps {
  record: RegistryRecord;
  registryCode: string;
}

/**
 * Individual source registry status card displaying verification status, confidence, and details.
 */
const RegistrySourceCard: React.FC<RegistrySourceCardProps> = ({ record, registryCode }) => {
  const isMatch = record.status === 'MATCHED';
  const isConflict = record.status === 'CONFLICT';
  const isBlocked = record.status === 'BLOCKED_PENDING_CLERICAL_OVERRIDE';
  const isNA = record.status === 'NOT_APPLICABLE';

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all ${
        isBlocked
          ? 'bg-[#260e14]/90 border-red-900/80 hover:border-red-600'
          : isMatch
          ? 'bg-[#101b33]/90 border-slate-700/70 hover:border-emerald-500/40'
          : isConflict
          ? 'bg-[#21131e]/90 border-red-900/60 hover:border-red-500/40'
          : 'bg-[#101628]/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-sky-400">
              {registryCode}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-[11px] font-semibold text-slate-200 truncate">
              {record.name}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Record ID: <span className="text-slate-300 font-medium">{record.recordId}</span>
          </div>
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium shrink-0 border ${
            isBlocked
              ? 'bg-red-950 text-red-300 border-red-600 font-bold'
              : isMatch
              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30'
              : isConflict
              ? 'bg-red-950/70 text-red-400 border-red-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isBlocked ? (
            <Lock className="w-3 h-3 text-red-400" />
          ) : isMatch ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : isConflict ? (
            <XCircle className="w-3 h-3 text-red-400" />
          ) : (
            <HelpCircle className="w-3 h-3 text-slate-400" />
          )}
          <span>{record.matchConfidence}%</span>
        </div>
      </div>

      {/* Registry Data Payload Comparison */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Registered Name</span>
          <span className="font-medium text-slate-200 truncate block">{record.registeredName}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Registered DOB</span>
          <span className="font-mono text-slate-200">{record.registeredDob}</span>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 bg-[#090e1a]/60 rounded p-2 border border-slate-800/80 leading-relaxed">
        {record.details}
      </div>
    </div>
  );
};
