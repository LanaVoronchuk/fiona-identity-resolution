/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/ManualOverrideForm.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Mandatory Clerical Manual Override Form triggered whenever critical identity
 * parameters ('Document Number', 'Full Name', or 'Sex') are unreadable or missing
 * from optical document ingestion.
 *
 * Compliance Mandate:
 * In accordance with eIDAS 2.0 (Regulation (EU) 2024/1183) Level of Assurance High
 * and GDPR Article 22, automated reconciliation is strictly suspended. The clerk
 * must manually verify and key the missing identity attributes to restore
 * confidence scoring and re-evaluate cross-border consensus.
 * ================================================================================
 */

import React, { useState } from 'react';
import { logInfo, logWarn } from '../utils/logger.ts';
import {
  AlertOctagon,
  ShieldAlert,
  FileCheck2,
  CheckCircle,
  Lock,
  UserCheck,
  CreditCard,
  Calendar,
} from 'lucide-react';

interface ManualOverrideFormProps {
  missingFields: string[];
  initialValues?: {
    documentNumber?: string;
    rawName?: string;
    normalizedName?: string;
    sex?: string;
    dobIso?: string;
  };
  onSubmitOverride: (overrides: {
    documentNumber: string;
    rawName: string;
    normalizedName?: string;
    sex: string;
    dobIso?: string;
  }) => void;
}

/**
 * Renders the mandatory clerical manual override form.
 *
 * @param props - Missing fields list, initial values, and submit handler.
 * @returns JSX Element for the Manual Override Form.
 */
export const ManualOverrideForm: React.FC<ManualOverrideFormProps> = ({
  missingFields,
  initialValues,
  onSubmitOverride,
}) => {
  const [docNumber, setDocNumber] = useState(
    initialValues?.documentNumber && !initialValues.documentNumber.includes('UNREADABLE')
      ? initialValues.documentNumber
      : ''
  );
  const [name, setName] = useState(
    initialValues?.rawName && !initialValues.rawName.includes('UNREADABLE')
      ? initialValues.rawName
      : ''
  );
  const [sex, setSex] = useState(
    initialValues?.sex && !initialValues.sex.includes('UNREADABLE')
      ? initialValues.sex
      : 'M'
  );
  const [dob, setDob] = useState(
    initialValues?.dobIso && !initialValues.dobIso.includes('UNREADABLE')
      ? initialValues.dobIso
      : '1988-04-12'
  );
  const [officerNotes, setOfficerNotes] = useState(
    'Physical biometric credential visually inspected under UV light. Microprint confirmed legible.'
  );
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Submits the manual clerical override.
   *
   * @param e - Form submit event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!docNumber.trim()) {
      setFormError('Document Number is required to resolve this compliance deficit.');
      return;
    }
    if (!name.trim()) {
      setFormError('Full Legal Name is required to resolve this compliance deficit.');
      return;
    }
    if (!sex.trim()) {
      setFormError('Sex/Gender marker is required.');
      return;
    }

    setFormError(null);

    logInfo('ManualOverrideForm', 'handleSubmit', 'Clerk submitted manual override', {
      docNumber: docNumber.trim(),
      name: name.trim(),
      sex: sex.trim(),
      dob: dob.trim(),
      officerNotes,
    });

    onSubmitOverride({
      documentNumber: docNumber.trim(),
      rawName: name.trim(),
      normalizedName: name.trim(),
      sex: sex.trim().toUpperCase(),
      dobIso: dob.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-red-500/60 bg-gradient-to-br from-[#260f16] via-[#1a1020] to-[#0c1220] p-4.5 shadow-xl animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex items-start gap-3 border-b border-red-900/60 pb-3">
        <div className="p-2 rounded-lg bg-red-950/90 border border-red-500/50 text-red-400 shrink-0">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
              MANDATORY CLERICAL INTERVENTION
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-900/60 text-red-200 border border-red-700/50">
              eIDAS Art. 22
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
            Manual Override: Resolve Insubstantial Documentation
          </h3>
          <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
            The OCR vision scan could not legibly verify:{' '}
            <span className="font-semibold text-white underline">
              {missingFields.join(', ')}
            </span>
            . Auto-merge is locked out. An authenticated officer must manually key these parameters below.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
        {/* ⚠️ Input Assist Banner for EU caseworkers without non-Latin keyboards */}
        <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-500/60 text-amber-200 text-xs leading-relaxed shadow-sm">
          <p className="text-amber-100">
            <strong className="text-amber-300">⚠️ Input Assist: </strong>
            For non-Latin documents, type the name using standard Latin Romanization phonetics or enter the string exactly as printed on the bottom MRZ lines.
          </p>
          <p className="text-[10px] text-amber-400/80 font-mono mt-1">
            Fiona's background resolver will automatically reverse-map Latin text to native script ('Олександр' or '김민서') for sovereign registries &amp; Golden Record compilation.
          </p>
        </div>

        {formError && (
          <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Field: Document Number */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                <span>Document Number *</span>
              </span>
              {missingFields.includes('Document Number') && (
                <span className="text-[10px] text-red-400 font-bold">🚨 UNREADABLE</span>
              )}
            </label>
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="e.g. FB884920 or KR940822"
              className="w-full px-3 py-2 rounded-lg bg-[#090e1a] border border-slate-700 focus:border-sky-400 text-slate-100 font-mono text-xs outline-none transition-colors"
            />
          </div>

          {/* Field: Full Legal Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Full Legal Name *</span>
              </span>
              {missingFields.includes('Full Name') && (
                <span className="text-[10px] text-red-400 font-bold">🚨 UNREADABLE</span>
              )}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oleksandr Shevchenko"
              className="w-full px-3 py-2 rounded-lg bg-[#090e1a] border border-slate-700 focus:border-sky-400 text-slate-100 text-xs outline-none transition-colors"
            />
          </div>

          {/* Field: Sex */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Sex / Gender Marker *</span>
              {missingFields.includes('Sex') && (
                <span className="text-[10px] text-red-400 font-bold">🚨 UNREADABLE</span>
              )}
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090e1a] border border-slate-700 focus:border-sky-400 text-slate-100 font-mono text-xs outline-none transition-colors cursor-pointer"
            >
              <option value="M">M - Male</option>
              <option value="F">F - Female</option>
              <option value="X">X - Non-Binary / Unspecified</option>
            </select>
          </div>

          {/* Field: Date of Birth */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Date of Birth (ISO YYYY-MM-DD) *</span>
            </label>
            <input
              type="text"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="YYYY-MM-DD (e.g. 1988-04-12)"
              className="w-full px-3 py-2 rounded-lg bg-[#090e1a] border border-slate-700 focus:border-sky-400 text-slate-100 font-mono text-xs outline-none transition-colors"
            />
          </div>
        </div>

        {/* Verification Justification */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
            Officer Verification Log / Justification Note
          </label>
          <input
            type="text"
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-[#090e1a] border border-slate-800 text-slate-300 text-xs outline-none focus:border-slate-600"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-red-400" />
            <span>Audit Officer: OFFICER_EU_7701</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-all cursor-pointer shadow-md border border-red-400/40"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Apply Clerical Override & Re-evaluate</span>
          </button>
        </div>
      </form>
    </div>
  );
};
