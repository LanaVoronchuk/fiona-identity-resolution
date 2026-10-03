/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/Header.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Top institutional header for Fiona, displaying European Union eIDAS 2.0
 * compliance credentials, active agent status, and session security parameters.
 * Adheres to Nordic agency aesthetic: dark slate blue, crisp contrast,
 * zero-pill metadata typography, and live telemetry indicators.
 * ================================================================================
 */

import React from 'react';
import { ShieldCheck, Activity, Globe2, FileKey2 } from 'lucide-react';
import { logInfo } from '../utils/logger.ts';

interface HeaderProps {
  agentStatus?: string;
  activeScenarioTitle?: string;
  onOpenAuditLog?: () => void;
}

/**
 * Renders the top brand header adhering to EU eIDAS 2.0 digital identity guidelines.
 *
 * @param props - Component properties including agent status and audit callback.
 * @returns JSX Element for the top navigation bar.
 */
export const Header: React.FC<HeaderProps> = ({
  agentStatus = 'Active',
  onOpenAuditLog,
}) => {
  React.useEffect(() => {
    logInfo('Header', 'render', 'Top Header mounted with eIDAS 2.0 compliance markers', {
      agentStatus,
      complianceStandard: 'Regulation (EU) 2024/1183',
    });
  }, [agentStatus]);

  return (
    <header className="border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-40 text-slate-100">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Zone: Wordmark & Agency Classification */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                <span>Fiona</span>
                <span className="text-slate-500 font-light">|</span>
                <span className="text-slate-200 font-medium text-sm lg:text-base">
                  Cross-Border Identity Resolution Engine
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="text-sky-400 font-medium">EU eIDAS 2.0 Compliance Engine</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Regulation (EU) 2024/1183</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">LoA High</span>
            </div>
          </div>
        </div>

        {/* Right Zone: System Telemetry & Operational State */}
        <div className="flex items-center gap-4 text-xs">
          {/* Live Agent Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0f172a] border border-slate-800/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium tracking-tight">
              Fiona Agent: <span className="text-emerald-400 font-semibold">{agentStatus}</span>
            </span>
          </div>

          {/* Cryptographic Trust Seal */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>QTSP Root Verified</span>
          </div>

          {/* Audit Logs Trigger */}
          {onOpenAuditLog && (
            <button
              onClick={onOpenAuditLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors cursor-pointer"
              title="View immutable audit log trail"
            >
              <FileKey2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium">Audit Trail</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
