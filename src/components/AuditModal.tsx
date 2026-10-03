/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/AuditModal.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * European Digital Identity (eIDAS 2.0) Audit Ledger Inspector.
 * Displays immutable chronological audit trail of operator decisions,
 * automated match consensus records, and document re-scans.
 * Ensures compliance with GDPR Article 22 (automated individual decision-making)
 * and Regulation (EU) 2024/1183 requirements for algorithmic transparency.
 * ================================================================================
 */

import React from 'react';
import { AuditRecord } from '../types/index.ts';
import { logInfo } from '../utils/logger.ts';
import { ShieldCheck, X, FileKey2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: AuditRecord[];
  onClearTrail?: () => void;
}

/**
 * Modal dialog for inspecting the eIDAS 2.0 immutable audit ledger.
 *
 * @param props - Modal state, close handler, and audit records list.
 * @returns JSX Element for the audit ledger modal.
 */
export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  auditTrail,
  onClearTrail,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      logInfo('AuditModal', 'open', 'Audit Ledger inspector opened', {
        recordCount: auditTrail.length,
      });
    }
  }, [isOpen, auditTrail.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0b1222] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0f1930] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-400">
              <FileKey2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                European Identity Ledger · Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                eIDAS 2.0 Compliance Archive · Regulation (EU) 2024/1183
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
          {auditTrail.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No clerical audit records committed in this session yet.
            </div>
          ) : (
            auditTrail.map((record) => {
              const isApprove = record.action === 'APPROVE_MASTER_PROFILE';
              const isFlag = record.action === 'FLAG_FOR_REVIEW';

              return (
                <div
                  key={record.id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isApprove
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : isFlag
                      ? 'bg-red-950/20 border-red-800/40 text-red-200'
                      : 'bg-[#10192e] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      {isApprove ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isFlag ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span className="font-bold tracking-wider">{record.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {new Date(record.timestamp).toLocaleTimeString()} · {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Scenario</span>
                      <span className="text-slate-200">{record.scenarioId}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Officer / Agent</span>
                      <span className="text-slate-200">{record.operatorId}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Score</span>
                      <span className="text-slate-200 font-bold">{record.confidenceScore}%</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Verdict</span>
                      <span className="text-slate-200 truncate">{record.verdict}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-300 font-sans leading-relaxed">
                    {record.details}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0c1426] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Signature: QTSP-SHA256-EU-ROOT</span>
          </div>

          <div className="flex items-center gap-2">
            {onClearTrail && auditTrail.length > 0 && (
              <button
                onClick={onClearTrail}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Clear Session Trail
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
