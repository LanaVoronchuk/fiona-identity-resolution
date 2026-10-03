/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/GoldenRecordCard.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Fiona's core product deliverable: The standardized "eIDAS 2.0 EU Wallet Golden Record".
 *
 * This component prominently renders the canonical output card titled:
 * "🔒 OUTPUT: EU WALLET GOLDEN RECORD"
 *
 * It formats and displays the strict enterprise-grade schema:
 * {
 *   "status": "VERIFIED_GOLDEN_RECORD",
 *   "eidas_compliance_version": "2.0",
 *   "golden_record": {
 *     "standardized_first_name": "MIN-SEO",
 *     "standardized_last_name": "KIM",
 *     "native_script_full_name": "김민서",
 *     "iso_date_of_birth": "1994-11-23",
 *     "cross_border_match_confidence": 98
 *   },
 *   "data_lineage_audit": ["Inbound_Immigration_Log", "Skatteverket_Registry"]
 * }
 *
 * Capabilities:
 * 1. Prominent "🔒 OUTPUT: EU WALLET GOLDEN RECORD" header banner.
 * 2. Visual structured breakdown of standardized names, native script, ISO DOB, and match confidence.
 * 3. Data lineage audit pills displaying verified sovereign source attestations.
 * 4. 1-click "Copy Golden Record JSON" button for direct API integration into EU Digital Identity Wallets.
 * 5. Tab switcher between "Standardized Record" and "Enterprise JSON Schema Payload".
 * ================================================================================
 */

import React, { useState } from 'react';
import { EuWalletGoldenRecord } from '../types/index.ts';
import { logInfo } from '../utils/logger.ts';
import {
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  Download,
  Fingerprint,
  Layers,
  Database,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface GoldenRecordCardProps {
  goldenRecord: EuWalletGoldenRecord;
  scenarioId: string;
}

/**
 * Renders the official eIDAS 2.0 Golden Record card in Column 3.
 *
 * @param props - Golden record payload and scenario metadata.
 * @returns JSX Element for the Golden Record Card.
 */
export const GoldenRecordCard: React.FC<GoldenRecordCardProps> = ({
  goldenRecord,
  scenarioId,
}) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'json'>('structured');
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(goldenRecord, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    logInfo('GoldenRecordCard', 'handleCopyJson', 'Golden Record JSON copied to clipboard', {
      scenarioId,
      status: goldenRecord.status,
      standardizedName: `${goldenRecord.golden_record.standardized_first_name} ${goldenRecord.golden_record.standardized_last_name}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eidas_golden_record_${goldenRecord.golden_record.standardized_last_name.toLowerCase() || 'profile'}.json`;
    link.click();
    URL.revokeObjectURL(url);

    logInfo('GoldenRecordCard', 'handleDownloadJson', 'Golden Record JSON exported to file', {
      scenarioId,
      status: goldenRecord.status,
    });
  };

  const isVerified = goldenRecord.status === 'VERIFIED_GOLDEN_RECORD';
  const isBlocked = goldenRecord.status === 'BLOCKED_INSUBSTANTIAL_DOCUMENTATION';

  return (
    <div className="rounded-xl border border-sky-500/40 bg-gradient-to-br from-[#0b162c] via-[#091122] to-[#070d1a] shadow-xl overflow-hidden ring-1 ring-sky-500/20">
      {/* 🔒 PROMINENT TITLE HEADER AS MANDATED */}
      <div className="px-4 py-3 bg-[#0d1c3a]/90 border-b border-sky-500/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-sky-950 border border-sky-500/40 text-sky-300">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xs lg:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>🔒 OUTPUT: EU WALLET GOLDEN RECORD</span>
            </h3>
            <p className="text-[10px] text-sky-300/80 font-mono">
              Fiona Primary Product Deliverable · eIDAS Compliance v{goldenRecord.eidas_compliance_version}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
              isVerified
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : isBlocked
                ? 'bg-red-950/80 text-red-300 border-red-500/50'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : isBlocked ? (
              <Lock className="w-3 h-3 text-red-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            )}
            <span>{goldenRecord.status}</span>
          </span>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="px-4 py-1.5 bg-[#081020] border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'structured'
                ? 'bg-sky-950/90 text-sky-300 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Standardized View</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'json'
                ? 'bg-sky-950/90 text-sky-300 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>JSON Schema Payload</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
            title="Copy Golden Record JSON"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="Download Golden Record JSON file"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5">
        {activeTab === 'structured' ? (
          <div className="space-y-3">
            {/* Standardized Name Attributes Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Standardized First Name
                </span>
                <span className="font-mono font-bold text-sky-300 text-sm mt-0.5 block truncate">
                  {goldenRecord.golden_record.standardized_first_name}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Standardized Last Name
                </span>
                <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">
                  {goldenRecord.golden_record.standardized_last_name}
                </span>
              </div>
            </div>

            {/* Native Script & Temporal Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Native Script Full Name
                  </span>
                  <Fingerprint className="w-3 h-3 text-sky-400" />
                </div>
                <span className="font-sans font-semibold text-slate-100 text-xs mt-0.5 block truncate">
                  {goldenRecord.golden_record.native_script_full_name}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    ISO Date of Birth
                  </span>
                  <Calendar className="w-3 h-3 text-sky-400" />
                </div>
                <span className="font-mono font-semibold text-emerald-400 text-xs mt-0.5 block">
                  {goldenRecord.golden_record.iso_date_of_birth}
                </span>
              </div>
            </div>

            {/* Cross-Border Match Confidence Progress */}
            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Cross-Border Match Confidence</span>
                </span>
                <span
                  className={`font-mono font-bold ${
                    goldenRecord.golden_record.cross_border_match_confidence >= 90
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {goldenRecord.golden_record.cross_border_match_confidence}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    goldenRecord.golden_record.cross_border_match_confidence >= 90
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'bg-red-400 shadow-[0_0_8px_#f87171]'
                  }`}
                  style={{ width: `${goldenRecord.golden_record.cross_border_match_confidence}%` }}
                ></div>
              </div>
            </div>

            {/* Data Lineage Audit Trail Badges */}
            <div className="pt-0.5">
              <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400 mb-1.5">
                <Database className="w-3 h-3 text-sky-400" />
                <span>Data Lineage Audit ({goldenRecord.data_lineage_audit.length} Attestations)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {goldenRecord.data_lineage_audit.length > 0 ? (
                  goldenRecord.data_lineage_audit.map((source, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/70 border border-sky-500/30 text-sky-300 flex items-center gap-1"
                    >
                      <Layers className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                      <span>{source}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-red-400 font-mono italic">
                    Lineage suspended due to insubstantial documentation.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* JSON Schema Payload View */
          <div className="relative">
            <pre className="rounded-lg bg-[#040810] border border-slate-800 p-3 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed shadow-inner max-h-[220px]">
              <code>{jsonString}</code>
            </pre>
            <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Schema standard: eIDAS 2.0 / Regulation (EU) 2024/1183</span>
              <span className="text-emerald-400">Ready for EUDI Wallet Ingestion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
