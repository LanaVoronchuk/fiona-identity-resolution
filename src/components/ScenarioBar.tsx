/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/components/ScenarioBar.tsx
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Top Navigation Scenario Bar providing instant cascading scenario switching:
 * 1. Scenario 1: Ukrainian Passport (Cyrillic & Date Format) [98% AUTO-MERGE]
 * 2. Scenario 2: Korean National ID (Name Order Inversion) [94% AUTO-MERGE]
 * 3. Scenario 3: Name Twin Disambiguation (Human Safeguard) [45% REVIEW FLAGGED]
 * 4. Uploaded Ingestion Tab (Live Gemini 3.8 Flash Vision Extraction)
 *
 * Each tab click instantaneously propagates identity document fields,
 * OCR metrics, registry statuses, match confidence, and step-by-step reasoning
 * across the 3-column dashboard layout.
 * ================================================================================
 */

import React from 'react';
import { ScenarioConfig, ScenarioId } from '../types/index.ts';
import { logInfo } from '../utils/logger.ts';
import { FileText, UserCheck, AlertTriangle, Sparkles } from 'lucide-react';

interface ScenarioBarProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  customScenario?: ScenarioConfig | null;
}

interface ScenarioTabItem {
  id: ScenarioId;
  label: string;
  badgeLabel: string;
  badgeType: 'green' | 'red';
  icon: React.ElementType;
}

const DEFAULT_SCENARIO_TABS: ScenarioTabItem[] = [
  {
    id: 'scenario_1',
    label: 'Scenario 1: Ukrainian Passport (Cyrillic & Date Format)',
    badgeLabel: '98% Auto-Merge',
    badgeType: 'green',
    icon: FileText,
  },
  {
    id: 'scenario_2',
    label: 'Scenario 2: Korean National ID (Name Order Inversion)',
    badgeLabel: '94% Auto-Merge',
    badgeType: 'green',
    icon: UserCheck,
  },
  {
    id: 'scenario_3',
    label: 'Scenario 3: Name Twin Disambiguation (Human-in-the-Loop Safeguard)',
    badgeLabel: '45% Review Flag',
    badgeType: 'red',
    icon: AlertTriangle,
  },
];

/**
 * Renders the top scenario switcher bar.
 *
 * @param props - Contains the active scenario ID, selection callback, and optional uploaded scenario.
 * @returns JSX Element for the scenario tabs.
 */
export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  activeScenarioId,
  onSelectScenario,
  customScenario,
}) => {
  const handleTabClick = (id: ScenarioId) => {
    logInfo('ScenarioBar', 'handleTabClick', `User switched scenario to ${id}`, {
      from: activeScenarioId,
      to: id,
    });
    onSelectScenario(id);
  };

  const tabs: ScenarioTabItem[] = [...DEFAULT_SCENARIO_TABS];

  if (customScenario) {
    const isAuto = customScenario.reconciliation.confidenceScore >= 90;
    tabs.push({
      id: 'custom_upload',
      label: `Uploaded: ${customScenario.document.normalizedName}`,
      badgeLabel: `${customScenario.reconciliation.confidenceScore}% ${isAuto ? 'Auto-Merge' : 'Review Flag'}`,
      badgeType: isAuto ? 'green' : 'red',
      icon: Sparkles,
    });
  }

  return (
    <div className="bg-[#0b1222] border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Navigation Tabs Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
          {tabs.map((tab) => {
            const isActive = activeScenarioId === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#182647] border-sky-500/50 text-white shadow-sm ring-1 ring-sky-500/20'
                    : 'bg-[#0f172a]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#131d36]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? tab.badgeType === 'green'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                />
                <span className="truncate max-w-[280px] lg:max-w-none">{tab.label}</span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded tracking-tight ${
                    tab.badgeType === 'green'
                      ? isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-emerald-950/40 text-emerald-400/80'
                      : isActive
                      ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                      : 'bg-red-950/40 text-red-400/80'
                  }`}
                >
                  {tab.badgeLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
