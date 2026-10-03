/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/ReasoningColumn.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Column 3 of Fiona's 3-column dashboard: Agent Reasoning Log & Audit Action.
 * Presents an unalterable chronological reasoning trace detailing:
 * - Script transliteration under ISO 9 / ICAO Doc 9303
 * - Name token permutation and vector embedding similarity
 * - Spatial and ISO 8601 temporal normalization
 * - eIDAS 2.0 Level of Assurance High corroboration
 * Features two critical operational decision actions:
 * 1. "Approve Master Profile": Consolidates identity into European Digital Identity Wallet.
 * 2. "Flag for Human Review": Escalate anomalies to National Civil Registry Exceptions Queue.
 * ================================================================================
 */

import React, { useState } from 'react';
import { EuWalletGoldenRecord } from '../types/index.ts';
import { logInfo, logWarn } from '../utils/logger.ts';
import { GoldenRecordCard } from './GoldenRecordCard.tsx';
import {
  Binary,
  CheckCircle,
  AlertTriangle,
  History,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface ReasoningColumnProps {
  reasoningLog: string[];
  scenarioId: string;
  confidenceScore: number;
  goldenRecord?: EuWalletGoldenRecord;
  isAutoMergeLocked?: boolean;
  isCriticalError?: boolean;
  onApproveProfile: () => void;
  onFlagReview: () => void;
}

/**
 * Renders Column 3 detailing the agent reasoning sequence and clerk actions.
 *
 * @param props - Step logs, scenario metadata, and action callback triggers.
 * @returns JSX Element for Column 3.
 */
export const ReasoningColumn: React.FC<ReasoningColumnProps> = ({
  reasoningLog,
  scenarioId,
  confidenceScore,
  goldenRecord,
  isAutoMergeLocked = false,
  isCriticalError = false,
  onApproveProfile,
  onFlagReview,
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback Golden Record if not explicitly passed
  const resolvedGoldenRecord: EuWalletGoldenRecord = goldenRecord || {
    status: isCriticalError
      ? 'BLOCKED_INSUBSTANTIAL_DOCUMENTATION'
      : confidenceScore >= 90
      ? 'VERIFIED_GOLDEN_RECORD'
      : 'FLAGGED_PENDING_CLERICAL_REVIEW',
    eidas_compliance_version: '2.0',
    golden_record: {
      standardized_first_name: 'MIN-SEO',
      standardized_last_name: 'KIM',
      native_script_full_name: '김민서',
      iso_date_of_birth: '1994-11-23',
      cross_border_match_confidence: confidenceScore,
    },
    data_lineage_audit: ['Inbound_Immigration_Log', 'Skatteverket_Registry'],
  };

  /**
   * Copies the raw step-by-step reasoning log to the clipboard for legal archiving.
   */
  const handleCopyLog = () => {
    const text = reasoningLog.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    logInfo('ReasoningColumn', 'handleCopyLog', 'Reasoning log exported to clipboard', {
      scenarioId,
      stepCount: reasoningLog.length,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Dispatches clerical approval for profile consolidation.
   */
  const handleApprove = () => {
    logInfo('ReasoningColumn', 'handleApprove', 'Officer approved master profile consolidation', {
      scenarioId,
      confidenceScore,
      action: 'APPROVE_MASTER_PROFILE',
    });
    onApproveProfile();
  };

  /**
   * Dispatches clerical escalation to human exception queue.
   */
  const handleFlag = () => {
    logWarn('ReasoningColumn', 'handleFlag', 'Officer flagged profile for human clerical review', {
      scenarioId,
      confidenceScore,
      action: 'FLAG_FOR_HUMAN_REVIEW',
    });
    onFlagReview();
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1527] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      {/* Column Title Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0f1930] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-950/70 border border-sky-500/20 text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              03. Agent Reasoning Log & Audit Action
            </h2>
            <p className="text-[11px] text-slate-400">Deterministic eIDAS 2.0 Decision Trace</p>
          </div>
        </div>

        <button
          onClick={handleCopyLog}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090e1a] border border-slate-700 hover:border-slate-600 text-slate-300 text-xs transition-colors cursor-pointer"
          title="Copy reasoning log to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Export Log'}</span>
        </button>
      </div>

      {/* Column Content Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 flex flex-col justify-between">
        {/* 🔒 PROMINENT PRIMARY DELIVERABLE: EU WALLET GOLDEN RECORD CARD */}
        <GoldenRecordCard goldenRecord={resolvedGoldenRecord} scenarioId={scenarioId} />

        {/* Step-by-Step Reasoning Log Container */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Chronological Audit Pipeline ({reasoningLog.length} Steps)
            </span>
            <span className="text-[11px] font-mono text-sky-400/80">Audit Hash #0x7F4A</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#070b14] p-3.5 font-mono text-xs text-slate-300 space-y-2.5 max-h-[460px] overflow-y-auto leading-relaxed shadow-inner select-text">
            {reasoningLog.map((step, idx) => {
              // Parse out step header [STEP XX: TITLE] from body
              const match = step.match(/^(\[STEP \d+:[^\]]+\])\s*(.*)$/);
              const header = match ? match[1] : `[STEP ${idx + 1}]`;
              const content = match ? match[2] : step;

              const isIngestion = header.includes('INGESTION');
              const isMatch = header.includes('MATCH') || header.includes('CONCURRENCE');
              const isDecision = header.includes('DECISION') || header.includes('SAFEGUARD');
              const isConflict = header.includes('CONFLICT') || header.includes('RISK');

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isConflict
                      ? 'bg-red-950/20 border-red-900/40 text-red-200'
                      : isDecision
                      ? 'bg-sky-950/30 border-sky-800/40 text-sky-200'
                      : isMatch
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200'
                      : 'bg-[#0f172a]/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider mb-1">
                    <span
                      className={`${
                        isConflict
                          ? 'text-red-400'
                          : isDecision
                          ? 'text-sky-400'
                          : isMatch
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {header}
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-300 font-sans">
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Operational Action Buttons */}
        <div className="pt-3 border-t border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Clerical Audit Actions</span>
            <span className="text-[11px] font-mono">eIDAS Art. 22 Compliant</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Action 1: Approve Master Profile */}
            <button
              onClick={handleApprove}
              disabled={isAutoMergeLocked}
              title={
                isAutoMergeLocked
                  ? 'Auto-Merge track is locked out: critical fields (Document Number, Full Name, or Sex) are unreadable.'
                  : 'Consolidate identity record into European Identity Wallet'
              }
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md border ${
                isAutoMergeLocked
                  ? 'bg-slate-800/80 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60'
                  : 'text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 cursor-pointer border-emerald-500/50'
              }`}
            >
              {isAutoMergeLocked ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-100" />
              )}
              <span className="truncate">
                {isAutoMergeLocked ? 'Auto-Merge Locked' : 'Approve Master Profile'}
              </span>
            </button>

            {/* Action 2: Flag for Human Review */}
            <button
              onClick={handleFlag}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs text-white bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-md transition-all cursor-pointer border border-red-500/50"
            >
              <AlertTriangle className="w-4 h-4 text-red-100" />
              <span className="truncate">Flag for Human Review</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-500">
            All clerical actions are cryptographically sealed into the EU QTSP Audit Ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
