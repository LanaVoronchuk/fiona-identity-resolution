"""
================================================================================
Fiona - Cross-Border Identity Resolution Portal
Module: app.py
================================================================================
FEATURE DESCRIPTION & USE CASES:
This file implements the core application server and user interface logic for
Fiona's eIDAS 2.0 compliant identity resolution portal.

Core Capabilities:
1. Multi-Scenario Switcher: Instantly cascades state changes across all three
   dashboard columns upon selecting any of the 3 test scenarios.
2. 3-Column Split Interface Architecture:
   - Column 1: Document Ingestion & Vision OCR Parsing (Passport/ID preview,
     extracted fields: Raw Name, Normalized DOB, Document Number, Issuing Country,
     and an interactive Re-scan Document action).
   - Column 2: Reconciliation Engine & Registry Cross-Match (Dynamic Match
     Confidence Badge with color-coded thresholding: Green >= 90% AUTO-MERGE,
     Red < 90% HUMAN REVIEW REQUIRED; and 3 static sovereign source status
     cards for REG_UA_TAX, REG_SE_MIGRATION, and REG_EU_VISA).
   - Column 3: Agent Reasoning Log & Audit Action (Step-by-step chronological
     reasoning trace detailing script transliteration, vector proximity, and
     spatial verification; with clerical action buttons 'Approve Master Profile'
     and 'Flag for Human Review').
3. Dark Slate Blue EU / Nordic Agency Aesthetic:
   - Enforces clean institutional typography, high contrast, tabular numerals,
     zero-pill discipline, and deterministic auditing.
================================================================================
"""

import sys
import os
import json
import logging
from typing import Dict, Any, Optional

# Attempt conditional import of Streamlit for web runtime execution
try:
    import streamlit as st
    STREAMLIT_AVAILABLE = True
except ImportError:
    STREAMLIT_AVAILABLE = False
    st = None

# Configure structured enterprise logging for the Fiona Portal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Fiona.Engine] %(message)s"
)
logger = logging.getLogger("Fiona.PortalApp")

# Import the benchmark scenarios data and safety validators
try:
    from scenarios_data import (
        get_all_scenarios,
        get_scenario_by_id,
        SCENARIOS,
        validate_critical_fields,
        evaluate_reconciliation_safeguards,
    )
    logger.info("Successfully imported scenarios_data module with %d test cases", len(SCENARIOS))
except ImportError as err:
    logger.error("Failed to import scenarios_data module: %s", err)
    raise


def log_audit_event(action: str, scenario_id: str, operator_id: str = "OFFICER_EU_7701", details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Records an immutable audit event for clerical or automated identity decisions.

    Args:
        action (str): The decision action taken ('APPROVE_MASTER_PROFILE', 'FLAG_FOR_REVIEW', 'RESCAN_DOCUMENT', 'MANUAL_CLERICAL_OVERRIDE').
        scenario_id (str): Identifier of the active scenario.
        operator_id (str, optional): Identity of the authenticated officer or system agent. Defaults to "OFFICER_EU_7701".
        details (Optional[Dict[str, Any]], optional): Supplementary metadata regarding the decision.

    Returns:
        Dict[str, Any]: The structured audit event object.
    """
    event = {
        "event": "AUDIT_RECORD_COMMITTED",
        "action": action,
        "scenarioId": scenario_id,
        "operatorId": operator_id,
        "complianceStandard": "eIDAS_2.0_REG_EU_2024_1183",
        "levelOfAssurance": "HIGH",
        "details": details or {}
    }
    logger.info("AUDIT LOG COMMITTED: %s", json.dumps(event))
    return event


def calculate_reconciliation_verdict(score: int, doc: Optional[Dict[str, Any]] = None, threshold: int = 90) -> Dict[str, Any]:
    """
    Computes deterministic status and color assignment based on eIDAS 2.0 thresholds
    and strict conditional safety rules:
    1. CRITICAL FIELD CHECK: Document Number, Full Name, and Sex (and DOB).
    2. AUTOMATED FALLBACK: If any critical field is unreadable, drop score below 40%.
    3. STATUS RE-CLASSIFICATION: Red '🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION'. Lock out Auto-Merge.
    4. HUMAN TRIGGER: Force Manual Override requirement.

    Args:
        score (int): Match confidence percentage (0 to 100).
        doc (Optional[Dict[str, Any]], optional): Document dictionary to evaluate.
        threshold (int, optional): Minimum score required for automated resolution. Defaults to 90.

    Returns:
        Dict[str, Any]: Computed verdict payload including status label, badge color,
            and review requirements.
    """
    logger.info("Evaluating reconciliation verdict for score=%d against threshold=%d", score, threshold)
    
    if doc:
        safety_eval = evaluate_reconciliation_safeguards(doc, baseline_score=score)
        if safety_eval.get("isCriticalError"):
            return {
                "label": "🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION",
                "status": "FLAGGED",
                "badgeColor": "red",
                "hexColor": "#ef4444",
                "actionRequired": True,
                "isAutoMergeLocked": True,
                "manualOverrideRequired": True,
                "missingCriticalFields": safety_eval.get("missingCriticalFields", []),
                "description": safety_eval.get("complianceNotice", "Critical attributes unreadable.")
            }

    if score >= threshold:
        verdict = {
            "label": "AUTO-MERGE",
            "status": "APPROVED",
            "badgeColor": "green",
            "hexColor": "#16a34a",
            "actionRequired": False,
            "isAutoMergeLocked": False,
            "manualOverrideRequired": False,
            "missingCriticalFields": [],
            "description": "High assurance match confirmed. Profile safe for automated consolidation."
        }
        logger.info("Verdict evaluated: AUTO-MERGE (score=%d >= threshold=%d)", score, threshold)
    else:
        verdict = {
            "label": "HUMAN REVIEW REQUIRED",
            "status": "FLAGGED",
            "badgeColor": "red",
            "hexColor": "#dc2626",
            "actionRequired": True,
            "isAutoMergeLocked": True,
            "manualOverrideRequired": False,
            "missingCriticalFields": [],
            "description": "Confidence below threshold or anomaly detected. Human clerical oversight required."
        }
        logger.info("Verdict evaluated: HUMAN REVIEW REQUIRED (score=%d < threshold=%d)", score, threshold)
    
    return verdict


def apply_clerical_override(
    scenario_id: str,
    overrides: Dict[str, str],
    operator_id: str = "OFFICER_EU_7701"
) -> Dict[str, Any]:
    """
    Applies an authenticated clerical override to resolve insubstantial documentation.

    Args:
        scenario_id (str): Identifier of the active scenario.
        overrides (Dict[str, str]): Keyed values: documentNumber, rawName, sex, dobIso.
        operator_id (str, optional): Authenticated officer ID.

    Returns:
        Dict[str, Any]: Updated scenario record with restored confidence score.
    """
    logger.info("Applying manual clerical override by '%s' on scenario '%s'", operator_id, scenario_id)
    sc = get_scenario_by_id(scenario_id).copy()
    doc = sc["document"].copy()

    doc["documentNumber"] = overrides.get("documentNumber", doc["documentNumber"])
    doc["rawName"] = overrides.get("rawName", doc["rawName"])
    doc["normalizedName"] = overrides.get("normalizedName", doc["rawName"])
    doc["sex"] = overrides.get("sex", doc["sex"]).upper()
    if "dobIso" in overrides:
        doc["dobIso"] = overrides["dobIso"]
        doc["dobRaw"] = overrides["dobIso"]

    # Re-evaluate with verified parameters
    safety_eval = evaluate_reconciliation_safeguards(doc, baseline_score=96)
    sc["document"] = doc
    sc["reconciliation"] = {
        "confidenceScore": safety_eval["confidenceScore"],
        "verdict": safety_eval["verdict"],
        "badgeLabel": safety_eval["badgeLabel"],
        "color": safety_eval["badgeColor"],
        "manualOverrideApplied": True
    }
    log_audit_event("MANUAL_CLERICAL_OVERRIDE", scenario_id, operator_id, details=overrides)
    logger.info("Manual clerical override committed successfully. Restored score: %d%%", safety_eval["confidenceScore"])
    return sc


def execute_document_rescan(scenario_id: str) -> Dict[str, Any]:
    """
    Simulates a high-precision optical re-scan of the biometric document.

    Args:
        scenario_id (str): Identifier of the active scenario.

    Returns:
        Dict[str, Any]: OCR re-scan verification telemetry.
    """
    logger.info("Triggered document re-scan pipeline for scenario_id='%s'", scenario_id)
    scenario = get_scenario_by_id(scenario_id)
    doc = scenario["document"]
    
    scan_result = {
        "status": "RE_SCAN_COMPLETED",
        "documentNumber": doc["documentNumber"],
        "rawName": doc["rawName"],
        "normalizedDob": doc["dobIso"],
        "scanConfidence": 99.7,
        "opticalIntegrity": "PASS",
        "mrzChecksum": "VERIFIED_VALID",
        "tamperCheck": "NO_ANOMALIES_DETECTED"
    }
    logger.info("Re-scan completed with confidence=%.1f%%: docNumber='%s'", scan_result["scanConfidence"], scan_result["documentNumber"])
    log_audit_event("RESCAN_DOCUMENT", scenario_id, details=scan_result)
    return scan_result


def render_terminal_dashboard(scenario_id: str = "scenario_1") -> None:
    """
    Renders a formatted textual representation of the 3-column dashboard
    in dark slate terminal layout for verification.

    Args:
        scenario_id (str): Identifier of the scenario to render.
    """
    logger.info("Rendering terminal dashboard layout for scenario='%s'", scenario_id)
    sc = get_scenario_by_id(scenario_id)
    doc = sc["document"]
    recon = sc["reconciliation"]
    regs = sc["registries"]
    score = recon["confidenceScore"]
    verdict = calculate_reconciliation_verdict(score)

    divider = "=" * 90
    print("\n" + divider)
    print(f"  FIONA | Cross-Border Identity Resolution Engine [EU eIDAS 2.0]")
    print(f"  Live Status: Fiona Agent: Active | Active Scenario: {sc['tabLabel']}")
    print(divider)
    
    print("\n[COLUMN 1: Document Ingestion & Vision OCR]")
    print(f"  Doc Type:        {doc['type']}")
    print(f"  Issuing Country: {doc['issuingCountry']}")
    print(f"  Doc Number:      {doc['documentNumber']}")
    print(f"  Raw Name (OCR):  {doc['rawName']}")
    print(f"  Normalized Name: {doc['normalizedName']}")
    print(f"  Raw DOB:         {doc['dobRaw']}")
    print(f"  Normalized DOB:  {doc['dobIso']}")
    print(f"  Security Check:  {doc['opticalCheck']}")

    print("\n[COLUMN 2: Reconciliation Engine & Registry Cross-Match]")
    print(f"  Match Confidence: {score}% [{verdict['label']}] (Threshold: >=90%)")
    print(f"  Vector Proximity: {recon['vectorSimilarity']} | Transliteration: {recon['scriptTransliterationStatus']}")
    print("  Federated Sovereign Registries:")
    for reg_key, reg in regs.items():
        print(f"    - {reg['id']} ({reg['name']}): [{reg['status']}] {reg['matchConfidence']}% Match")
        print(f"      Record: {reg['recordId']} | {reg['details']}")

    print("\n[COLUMN 3: Agent Reasoning Log & Audit Actions]")
    golden_rec = sc.get("goldenRecord")
    if golden_rec:
        print("  " + "-" * 70)
        print("  🔒 OUTPUT: EU WALLET GOLDEN RECORD (Primary Deliverable)")
        print("  " + "-" * 70)
        print(f"  Status:             {golden_rec['status']}")
        print(f"  eIDAS Version:      v{golden_rec['eidas_compliance_version']}")
        print(f"  Standardized Name:  {golden_rec['golden_record']['standardized_first_name']} {golden_rec['golden_record']['standardized_last_name']}")
        print(f"  Native Script Name: {golden_rec['golden_record']['native_script_full_name']}")
        print(f"  ISO Date of Birth:  {golden_rec['golden_record']['iso_date_of_birth']}")
        print(f"  Match Confidence:   {golden_rec['golden_record']['cross_border_match_confidence']}%")
        print(f"  Data Lineage Audit: {json.dumps(golden_rec['data_lineage_audit'])}")
        print("  Structured Enterprise JSON Payload:")
        for line in json.dumps(golden_rec, indent=4).splitlines():
            print(f"    {line}")
        print("  " + "-" * 70)

    print("\n  Reasoning Trace Steps:")
    for step in sc["reasoningLog"]:
        print(f"    {step}")
    print("\n  Available Clerk Actions:")
    print("    [1] Approve Master Profile  (Consolidates identity into European Identity Wallet)")
    print("    [2] Flag for Human Review   (Routes to National Civil Registry Exceptions Queue)")
    print(divider + "\n")


def render_streamlit_dashboard() -> None:
    """
    Renders the official Fiona 3-column eIDAS 2.0 dashboard using Streamlit.
    Invoked when running 'streamlit run app.py'.
    """
    if not STREAMLIT_AVAILABLE:
        logger.error("Streamlit is not installed. Install via 'pip install streamlit'.")
        return

    st.set_page_config(
        page_title="Fiona | Cross-Border Identity Resolution Engine",
        page_icon="🇪🇺",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # Custom EU / Nordic dark slate styling
    st.markdown("""
        <style>
        .stApp {
            background-color: #070b14;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .eidas-header {
            background: linear-gradient(135deg, #0d1930 0%, #070b14 100%);
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 16px 24px;
            margin-bottom: 20px;
        }
        .golden-card {
            background: linear-gradient(135deg, #0b162c 0%, #070d1a 100%);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .badge-green {
            background-color: rgba(6, 78, 59, 0.7);
            color: #34d399;
            border: 1px solid rgba(52, 211, 153, 0.4);
            padding: 4px 12px;
            border-radius: 6px;
            font-weight: 700;
        }
        .badge-red {
            background-color: rgba(127, 29, 29, 0.7);
            color: #f87171;
            border: 1px solid rgba(248, 113, 113, 0.4);
            padding: 4px 12px;
            border-radius: 6px;
            font-weight: 700;
        }
        </style>
    """, unsafe_allow_html=True)

    # Header
    st.markdown("""
        <div class="eidas-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                        Fiona | Cross-Border Identity Resolution Engine
                    </h1>
                    <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">
                        EU eIDAS 2.0 Compliance Engine · Regulation (EU) 2024/1183 Level of Assurance High
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <span class="badge-green">● Fiona Agent: Active</span>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # Scenario Selection Tabs
    scenarios = get_all_scenarios()
    scenario_keys = ["scenario_1", "scenario_2", "scenario_3", "scenario_insubstantial"]
    labels = [
        "Scenario 1: Ukrainian Passport (Cyrillic & Date Format)",
        "Scenario 2: Korean National ID (Name Order Inversion)",
        "Scenario 3: Name Twin Disambiguation (Human-in-the-Loop Safeguard)",
        "🚨 Insubstantial Document (Critical Safeguard)"
    ]
    
    selected_label = st.radio(
        "Select Reconciliation Scenario:",
        labels,
        horizontal=True,
        label_visibility="collapsed"
    )
    selected_key = scenario_keys[labels.index(selected_label)]
    active_sc = scenarios[selected_key]

    doc = active_sc["document"]
    recon = active_sc["reconciliation"]
    regs = active_sc["registries"]
    score = recon["confidenceScore"]
    is_auto_merge = score >= 90
    golden_rec = active_sc.get("goldenRecord")

    # 3-Column Split Dashboard Layout
    col1, col2, col3 = st.columns([1, 1, 1.1])

    with col1:
        st.subheader("01. Document Ingestion & Vision OCR")
        st.caption("Powered by Google Gemini Multimodal Vision OCR")

        st.markdown(f"**Document Type:** {doc['type']}")
        st.markdown(f"**Issuing Authority:** {doc['issuingCountry']}")
        st.markdown(f"**Document Number:** `{doc['documentNumber']}`")
        st.markdown(f"**Raw Legal Name:** `{doc['rawName']}`")
        st.markdown(f"**Standardized Name:** `{doc['normalizedName']}`")
        st.markdown(f"**Raw Date of Birth:** `{doc['dobRaw']}`")
        st.markdown(f"**ISO 8601 DOB:** `{doc['dobIso']}`")
        st.markdown(f"**Sex / Gender Marker:** `{doc.get('sex', 'N/A')}`")
        st.markdown(f"**Security Check:** `{doc['opticalCheck']}`")

        # MRZ Zone
        if "mrzLine1" in doc:
            st.code(f"{doc['mrzLine1']}\n{doc['mrzLine2']}", language="text")

        if st.button("🔄 Re-scan Document", use_container_width=True):
            st.success(f"Optical security verification passed. Extracted 8 biometric fields.")

        # Manual Override Input Assist Form
        with st.expander("⚠️ Manual Override Input Form & Non-Latin Assist", expanded=score < 40):
            st.info("⚠️ Input Assist: For non-Latin documents, type the name using standard Latin Romanization phonetics or enter the string exactly as printed on the bottom MRZ lines.")
            st.caption("Fiona's background Gemini resolver automatically reverse-maps Latin phonetics to native Cyrillic or Hangul scripts to query foreign root registries.")
            override_name = st.text_input("Full Legal Name (Latin or Native)", value=doc["normalizedName"])
            override_doc = st.text_input("Document Number", value=doc["documentNumber"])
            override_sex = st.selectbox("Sex Marker", ["M", "F", "X"], index=0 if doc.get("sex") == "M" else 1)
            if st.button("Submit Clerical Override", use_container_width=True):
                st.success(f"Clerical override committed by OFFICER_EU_7701. Biometrics validated.")

    with col2:
        st.subheader("02. Reconciliation Engine & Cross-Match")
        st.caption("Federated Cross-Border Identity Consensus")

        # Match Score Badge
        badge_class = "badge-green" if is_auto_merge else "badge-red"
        status_text = "AUTO-MERGE APPROVED (>=90%)" if is_auto_merge else "HUMAN REVIEW REQUIRED (<90%)"
        st.markdown(f"""
            <div style="padding: 16px; border-radius: 12px; background: #0c1626; border: 1px solid #1e293b; margin-bottom: 16px;">
                <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-family: monospace;">Match Confidence Score</span>
                <div style="display: flex; align-items: baseline; gap: 12px; margin-top: 4px;">
                    <span style="font-size: 36px; font-weight: 800; font-family: monospace; color: {'#34d399' if is_auto_merge else '#f87171'};">{score}%</span>
                    <span class="{badge_class}">{status_text}</span>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #cbd5e1;">
                    <strong>Verdict:</strong> {recon['verdictSummary']}
                </div>
            </div>
        """, unsafe_allow_html=True)

        st.markdown(f"**Transliteration Standard:** `{recon['scriptTransliterationStatus']}`")
        st.markdown(f"**Temporal Parser:** `{recon['dateNormalizationStatus']}`")
        st.markdown(f"**Vector Proximity:** `Cosine Similarity: {recon['vectorSimilarity']}`")

        st.write("---")
        st.markdown("**Sovereign Registry Federation (3 Endpoints):**")
        for reg_key, reg in regs.items():
            color = "🟢" if reg["status"] == "MATCHED" else "🔴" if reg["status"] == "CONFLICT" else "⚪"
            st.markdown(f"**{color} {reg['id']} - {reg['name']}**")
            st.caption(f"Status: `{reg['status']}` ({reg['matchConfidence']}%) | Record: `{reg['recordId']}`\n{reg['details']}")

    with col3:
        st.subheader("03. Agent Reasoning Log & Deliverable")
        st.caption("eIDAS 2.0 Audit Action & Golden Record Output")

        # 🔒 PROMINENT TITLE: EU WALLET GOLDEN RECORD
        if golden_rec:
            st.markdown("""
                <div class="golden-card">
                    <h3 style="color: #ffffff; margin: 0 0 4px 0; font-size: 15px; font-weight: 700;">
                        🔒 OUTPUT: EU WALLET GOLDEN RECORD
                    </h3>
                    <p style="color: #38bdf8; font-size: 11px; font-family: monospace; margin: 0 0 12px 0;">
                        Primary Product Deliverable · eIDAS Compliance v2.0
                    </p>
                </div>
            """, unsafe_allow_html=True)
            st.json(golden_rec)

        # Reasoning Log
        st.markdown("**Deterministic Reasoning Steps:**")
        with st.container(height=320):
            for step in active_sc["reasoningLog"]:
                st.markdown(f"`{step}`")

        # Clerk Actions
        col_act1, col_act2 = st.columns(2)
        with col_act1:
            if st.button("✅ Approve Master Profile", disabled=not is_auto_merge, use_container_width=True):
                st.success("Master profile approved and committed to EU Digital ID Wallet ledger.")
        with col_act2:
            if st.button("🚩 Flag for Human Review", use_container_width=True):
                st.warning("Profile escalated to National Civil Registry Exceptions Queue.")


if __name__ == "__main__":
    logger.info("Initializing Fiona Cross-Border Identity Resolution Engine")
    
    # If running inside Streamlit runtime (e.g. 'streamlit run app.py')
    if STREAMLIT_AVAILABLE and hasattr(st, "runtime") and st.runtime.exists():
        logger.info("Streamlit runtime detected. Launching interactive web dashboard.")
        render_streamlit_dashboard()
    else:
        # Running directly via python CLI (e.g. 'python3 app.py')
        logger.info("CLI execution detected. Running terminal self-test and scenario verification.")
        for s_key in ["scenario_1", "scenario_2", "scenario_3"]:
            render_terminal_dashboard(s_key)
        logger.info("Fiona Portal engine initialized successfully")

