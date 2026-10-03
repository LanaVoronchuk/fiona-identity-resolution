/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/App.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Main Application Orchestrator for Fiona - Cross-Border Identity Resolution Portal.
 * Implements the full eIDAS 2.0 compliant Nordic/EU dark slate blue dashboard:
 *
 * 1. Top Header:
 *    - Title: "Fiona | Cross-Border Identity Resolution Engine"
 *    - Subtitle: "EU eIDAS 2.0 Compliance Engine"
 *    - Status: "Fiona Agent: Active"
 *
 * 2. Scenario Navigation Bar:
 *    - Scenario 1: Ukrainian Passport (Cyrillic & Date Format) [98% AUTO-MERGE]
 *    - Scenario 2: Korean National ID (Name Order Inversion) [94% AUTO-MERGE]
 *    - Scenario 3: Name Twin Disambiguation (Human Safeguard) [45% REVIEW FLAGGED]
 *    - Live Uploaded Ingestion Tab with dynamic Gemini 3.8 Flash Vision telemetry
 *
 * 3. 3-Column Split Layout:
 *    - Column 1: Document Ingestion & Vision OCR (Interactive PNG/JPEG uploader,
 *                Gemini 3.8 Flash OCR extraction, parsed OCR fields, Re-scan button)
 *    - Column 2: Reconciliation Engine & Registry Match (Dynamic score badge >=90%
 *                green / <90% red, REG_UA_TAX, REG_SE_MIGRATION, REG_EU_VISA cards)
 *    - Column 3: Agent Reasoning Log & Audit Action (Transliteration, vector similarity,
 *                spatial/date normalization logs, 'Approve Master Profile' & 'Flag for Review')
 *
 * Real-Time Standardization Feedback Loop:
 * Ingestion of any uploaded PNG or JPEG automatically triggers Gemini 3.8 Flash,
 * parses name and date strings, and feeds structured data into Column 2 and Column 3.
 * ================================================================================
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ScenarioBar } from './components/ScenarioBar.tsx';
import { DocumentColumn } from './components/DocumentColumn.tsx';
import { ReconciliationColumn } from './components/ReconciliationColumn.tsx';
import { ReasoningColumn } from './components/ReasoningColumn.tsx';
import { AuditModal } from './components/AuditModal.tsx';
import { SCENARIOS_DATA } from './data/scenariosData.ts';
import { ScenarioId, AuditRecord, ScenarioConfig } from './types/index.ts';
import { logInfo, logWarn } from './utils/logger.ts';
import { applyManualClericalOverride } from './utils/reconciliationLoop.ts';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast notification payload structure.
 */
interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

/**
 * Root component orchestrating the 3-column Fiona Identity Portal.
 *
 * @returns JSX Element for the main dashboard application.
 */
export default function App(): React.JSX.Element {
  // Current active scenario state ('scenario_1' | 'scenario_2' | 'scenario_3' | 'custom_upload')
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('scenario_1');
  
  // Custom uploaded scenario state populated by Gemini 3.8 Flash OCR
  const [customScenario, setCustomScenario] = useState<ScenarioConfig | null>(null);

  // Audit Ledger history
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>([
    {
      id: 'init-audit-001',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'SCENARIO_SWITCH',
      scenarioId: 'scenario_1',
      operatorId: 'SYSTEM_AGENT_FIONA',
      confidenceScore: 98,
      verdict: 'AUTO-MERGE',
      details: 'System bootstrapped with eIDAS 2.0 High Assurance root certificates.',
    },
  ]);

  // Modal inspection state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Active notification toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Retrieve current active scenario configuration
  const activeScenario: ScenarioConfig =
    activeScenarioId === 'custom_upload' && customScenario
      ? customScenario
      : SCENARIOS_DATA[activeScenarioId as Exclude<ScenarioId, 'custom_upload'>] || SCENARIOS_DATA.scenario_1;

  /**
   * Logs application startup and configuration state.
   */
  useEffect(() => {
    logInfo('App', 'mount', 'Fiona Identity Portal initialized with multimodal vision pipeline', {
      initialScenario: activeScenarioId,
      availableScenarios: Object.keys(SCENARIOS_DATA),
      eidasVersion: '2.0_2024_1183',
    });
  }, []);

  /**
   * Dismisses active notification toast.
   */
  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * Cascades scenario switch across all 3 columns instantly.
   *
   * @param scenarioId - The target scenario identifier.
   */
  const handleSelectScenario = useCallback(
    (scenarioId: ScenarioId) => {
      logInfo('App', 'handleSelectScenario', `Cascading state update to ${scenarioId}`, {
        previous: activeScenarioId,
        next: scenarioId,
      });

      setActiveScenarioId(scenarioId);

      const targetScenario =
        scenarioId === 'custom_upload' && customScenario
          ? customScenario
          : SCENARIOS_DATA[scenarioId as Exclude<ScenarioId, 'custom_upload'>];

      if (targetScenario) {
        const auditEntry: AuditRecord = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'SCENARIO_SWITCH',
          scenarioId,
          operatorId: 'OFFICER_EU_7701',
          confidenceScore: targetScenario.reconciliation.confidenceScore,
          verdict: targetScenario.reconciliation.verdict,
          details: `Loaded scenario benchmark: ${targetScenario.title}`,
        };

        setAuditTrail((prev) => [auditEntry, ...prev]);

        setToast({
          id: `toast-${Date.now()}`,
          type: 'info',
          title: 'Scenario Loaded',
          message: `Switched to ${targetScenario.title} (${targetScenario.reconciliation.confidenceScore}% Match Score)`,
        });
      }
    },
    [activeScenarioId, customScenario]
  );

  /**
   * Handles real-time standardization package generated by Gemini 3.8 Flash Vision OCR.
   * Feeds the structured data straight into Column 2 and Column 3.
   *
   * @param dynamicPkg - Newly constructed scenario config containing extracted OCR attributes.
   */
  const handleDynamicPackageGenerated = useCallback((dynamicPkg: ScenarioConfig) => {
    logInfo('App', 'handleDynamicPackageGenerated', 'Ingesting dynamic standardization package into dashboard', {
      subject: dynamicPkg.document.normalizedName,
      confidence: dynamicPkg.reconciliation.confidenceScore,
      verdict: dynamicPkg.reconciliation.verdict,
    });

    setCustomScenario(dynamicPkg);
    setActiveScenarioId('custom_upload');

    const auditEntry: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'RESCAN_DOCUMENT',
      scenarioId: 'custom_upload',
      operatorId: 'GEMINI_3.8_FLASH_VISION',
      confidenceScore: dynamicPkg.reconciliation.confidenceScore,
      verdict: dynamicPkg.reconciliation.verdict,
      details: `Gemini 3.8 Flash OCR extracted legal name '${dynamicPkg.document.rawName}', normalized DOB '${dynamicPkg.document.dobIso}', Document '${dynamicPkg.document.documentNumber}'.`,
    };

    setAuditTrail((prev) => [auditEntry, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      type: dynamicPkg.reconciliation.confidenceScore >= 90 ? 'success' : 'warning',
      title: 'Vision OCR Standardized',
      message: `Parsed '${dynamicPkg.document.rawName}' -> '${dynamicPkg.document.normalizedName}', DOB '${dynamicPkg.document.dobIso}'. Reconciliation Score: ${dynamicPkg.reconciliation.confidenceScore}%.`,
    });
  }, []);

  /**
   * Handles document re-scan completion callback.
   */
  const handleRescanCompleted = useCallback(() => {
    logInfo('App', 'handleRescanCompleted', 'Document re-scan verified and state refreshed', {
      scenarioId: activeScenarioId,
      documentNumber: activeScenario.document.documentNumber,
    });

    const auditEntry: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'RESCAN_DOCUMENT',
      scenarioId: activeScenarioId,
      operatorId: 'OFFICER_EU_7701',
      confidenceScore: activeScenario.reconciliation.confidenceScore,
      verdict: activeScenario.reconciliation.verdict,
      details: `Physical biometric re-scan executed for document ${activeScenario.document.documentNumber}. MRZ & Hologram pass.`,
    };

    setAuditTrail((prev) => [auditEntry, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Optical Re-scan Complete',
      message: `Extracted 8 biometric fields from ${activeScenario.document.type} with ${activeScenario.document.scanConfidence}% confidence.`,
    });
  }, [activeScenarioId, activeScenario]);

  /**
   * Commits clerical approval to master consolidated European Identity Wallet.
   */
  const handleApproveMasterProfile = useCallback(() => {
    logInfo('App', 'handleApproveMasterProfile', 'Master identity consolidation approved by officer', {
      scenarioId: activeScenarioId,
      subjectName: activeScenario.document.normalizedName,
      confidenceScore: activeScenario.reconciliation.confidenceScore,
    });

    const auditEntry: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'APPROVE_MASTER_PROFILE',
      scenarioId: activeScenarioId,
      operatorId: 'OFFICER_EU_7701',
      confidenceScore: activeScenario.reconciliation.confidenceScore,
      verdict: 'APPROVED_BY_OFFICER',
      details: `Officer confirmed master record creation for '${activeScenario.document.normalizedName}'. Synced to European Digital Identity Wallet.`,
    };

    setAuditTrail((prev) => [auditEntry, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Master Profile Approved',
      message: `Consolidated record for ${activeScenario.document.normalizedName} successfully registered in European Identity Wallet.`,
    });
  }, [activeScenarioId, activeScenario]);

  /**
   * Commits clerical escalation to human exceptions queue.
   */
  const handleFlagForHumanReview = useCallback(() => {
    logWarn('App', 'handleFlagForHumanReview', 'Identity profile escalated to human clerical review', {
      scenarioId: activeScenarioId,
      subjectName: activeScenario.document.rawName,
      confidenceScore: activeScenario.reconciliation.confidenceScore,
    });

    const auditEntry: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'FLAG_FOR_REVIEW',
      scenarioId: activeScenarioId,
      operatorId: 'OFFICER_EU_7701',
      confidenceScore: activeScenario.reconciliation.confidenceScore,
      verdict: 'ESCALATED_TO_CLERK',
      details: `Profile flagged for deep clerical investigation due to registry conflict or low consensus score (${activeScenario.reconciliation.confidenceScore}%).`,
    };

    setAuditTrail((prev) => [auditEntry, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      type: 'warning',
      title: 'Flagged for Human Review',
      message: `Dossier ${activeScenario.document.documentNumber} placed in Priority Civil Exceptions Queue for officer adjudication.`,
    });
  }, [activeScenarioId, activeScenario]);

  /**
   * Applies manual clerical override when critical fields are unreadable or missing.
   */
  const handleApplyManualOverride = useCallback(
    (overrides: {
      documentNumber: string;
      rawName: string;
      normalizedName?: string;
      sex: string;
      dobIso?: string;
    }) => {
      logInfo('App', 'handleApplyManualOverride', 'Officer submitted manual clerical override', overrides);

      const updated = applyManualClericalOverride(activeScenario, overrides, 'OFFICER_EU_7701');
      setCustomScenario(updated);
      setActiveScenarioId('custom_upload');

      const auditEntry: AuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'MANUAL_CLERICAL_OVERRIDE',
        scenarioId: 'custom_upload',
        operatorId: 'OFFICER_EU_7701',
        confidenceScore: updated.reconciliation.confidenceScore,
        verdict: updated.reconciliation.verdict,
        details: `Manual clerical override confirmed by officer. Verified Document Number '${overrides.documentNumber}', Legal Name '${overrides.rawName}', Sex '${overrides.sex}'. Auto-Merge unlocked.`,
      };

      setAuditTrail((prev) => [auditEntry, ...prev]);

      setToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: 'Manual Override Applied',
        message: `Biometric attributes verified by officer. Auto-Merge track unlocked with ${updated.reconciliation.confidenceScore}% confidence.`,
      });
    },
    [activeScenario]
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* 1. Institutional Top Navigation Bar */}
      <Header
        agentStatus="Active"
        activeScenarioTitle={activeScenario.title}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
      />

      {/* 2. Top Navigation Scenario Bar (3 Clickable Tabs + Custom Upload Tab) */}
      <ScenarioBar
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        customScenario={customScenario}
      />

      {/* Floating Status Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl max-w-md ${
              toast.type === 'success'
                ? 'bg-[#0b241c] border-emerald-500/50 text-emerald-100'
                : toast.type === 'warning'
                ? 'bg-[#261313] border-red-500/50 text-red-100'
                : 'bg-[#101b33] border-sky-500/50 text-sky-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold text-white">{toast.title}</div>
              <div className="mt-0.5 text-slate-300 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Column Split Dashboard Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch min-h-[calc(100vh-170px)]">
          {/* Column 1: Document Ingestion & Vision OCR */}
          <div className="h-full">
            <DocumentColumn
              document={activeScenario.document}
              scenarioId={activeScenarioId}
              isCriticalError={activeScenario.reconciliation.isCriticalError}
              missingFields={activeScenario.reconciliation.missingCriticalFields}
              onDynamicPackageGenerated={handleDynamicPackageGenerated}
              onRescanCompleted={handleRescanCompleted}
              onApplyOverride={handleApplyManualOverride}
            />
          </div>

          {/* Column 2: Reconciliation Engine & Registry Match */}
          <div className="h-full">
            <ReconciliationColumn
              reconciliation={activeScenario.reconciliation}
              registries={activeScenario.registries}
              scenarioId={activeScenarioId}
              onApplyOverride={handleApplyManualOverride}
              documentFields={{
                documentNumber: activeScenario.document.documentNumber,
                rawName: activeScenario.document.rawName,
                normalizedName: activeScenario.document.normalizedName,
                sex: activeScenario.document.sex,
                dobIso: activeScenario.document.dobIso,
              }}
            />
          </div>

          {/* Column 3: Agent Reasoning Log & Audit Action */}
          <div className="h-full">
            <ReasoningColumn
              reasoningLog={activeScenario.reasoningLog}
              scenarioId={activeScenarioId}
              confidenceScore={activeScenario.reconciliation.confidenceScore}
              goldenRecord={activeScenario.goldenRecord}
              isAutoMergeLocked={activeScenario.reconciliation.isAutoMergeLocked}
              isCriticalError={activeScenario.reconciliation.isCriticalError}
              onApproveProfile={handleApproveMasterProfile}
              onFlagReview={handleFlagForHumanReview}
            />
          </div>
        </div>
      </main>

      {/* European Identity Ledger Audit Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditTrail={auditTrail}
        onClearTrail={() => setAuditTrail([])}
      />
    </div>
  );
}
