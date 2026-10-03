"""
================================================================================
Fiona - Cross-Border Identity Resolution Portal
Module: scenarios_data.py
================================================================================
FEATURE DESCRIPTION & USE CASES:
This module defines the static dictionary configurations and data schemas for
Fiona's three primary cross-border identity resolution scenarios:

1. Scenario 1 (Ukrainian Biometric Passport):
   - Handles Cyrillic-to-Latin transliteration under ICAO Doc 9303 and ISO 9:1995.
   - Converts regional date format '12.04.1988' (DD.MM.YYYY) to standard ISO 8601 '1988-04-12'.
   - Cross-checks with State Tax Service of Ukraine, Swedish Migration Agency, and EU VIS.
   - Outcome: 98% confidence score triggers automated resolution (AUTO-MERGE).

2. Scenario 2 (Korean National ID Card):
   - Resolves East Asian patronymic surname-first ordering ('KIM Min Su') against Western
     surname-last inverted records ('Jeong, Minsu Kim').
   - Normalizes maternal/paternal lineage tags and hyphenated phonetic Romanization.
   - Outcome: 94% confidence score triggers automated resolution (AUTO-MERGE).

3. Scenario 3 (Name Twin Disambiguation - Human-in-the-Loop Safeguard):
   - Evaluates a high-collision Scandinavian homonym ('Anna Maria Andersson') sharing
     an identical date of birth ('1990-01-15').
   - Detects spatial/geographic conflict: Stockholm municipality vs. Gothenburg municipality.
   - Enforces EU eIDAS 2.0 and GDPR Article 22 safeguards.
   - Outcome: 45% confidence score halts automated processing and routes to human clerical review.

Each scenario provides raw OCR outputs, normalized attributes, mock sovereign registry
records (REG_UA_TAX, REG_SE_MIGRATION, REG_EU_VISA), and audit reasoning logs.
================================================================================
"""

import logging
from typing import Dict, Any, List

# Configure enterprise logger for Fiona identity services
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s")
logger = logging.getLogger("Fiona.ScenariosData")


def get_all_scenarios() -> Dict[str, Dict[str, Any]]:
    """
    Retrieves the complete catalog of identity resolution benchmark scenarios.

    Returns:
        Dict[str, Dict[str, Any]]: A dictionary keyed by scenario ID containing
            document ingestion records, OCR fields, cross-registry validation states,
            confidence scores, and step-by-step reasoning logs.
    """
    logger.info("Accessing get_all_scenarios(): Retrieving 3 canonical eIDAS 2.0 benchmark cases")
    return SCENARIOS


def get_scenario_by_id(scenario_id: str) -> Dict[str, Any]:
    """
    Retrieves a single scenario by its identifier with safety validation.

    Args:
        scenario_id (str): The unique key for the scenario (e.g., 'scenario_1').

    Returns:
        Dict[str, Any]: Detailed scenario configuration payload.

    Raises:
        KeyError: If the provided scenario_id is not in the registered dataset.
    """
    logger.info("Accessing get_scenario_by_id(): Lookup requested for scenario_id='%s'", scenario_id)
    if scenario_id not in SCENARIOS:
        logger.error("Scenario lookup failed: '%s' not found in dataset", scenario_id)
        raise KeyError(f"Scenario '{scenario_id}' not found. Available keys: {list(SCENARIOS.keys())}")
    
    selected = SCENARIOS[scenario_id]
    logger.info(
        "Scenario retrieved successfully: id='%s', name='%s', score=%d%%, verdict='%s'",
        scenario_id,
        selected.get("title", ""),
        selected.get("reconciliation", {}).get("confidenceScore", 0),
        selected.get("reconciliation", {}).get("verdict", "")
    )
    return selected


SCENARIOS: Dict[str, Dict[str, Any]] = {
    "scenario_1": {
        "id": "scenario_1",
        "tabLabel": "Scenario 1: Ukrainian Passport (Cyrillic & Date Format)",
        "title": "Ukrainian Passport (Cyrillic & Date Format Normalization)",
        "description": "Cross-border refugee and residency reconciliation under eIDAS 2.0 high-assurance standard.",
        "badge": {
            "label": "AUTO-MERGE",
            "score": 98,
            "status": "APPROVED",
            "color": "green",
            "threshold": 90,
            "eidasLoa": "HIGH"
        },
        "document": {
            "type": "Biometric International Passport",
            "issuingCountry": "Ukraine (UKR)",
            "documentNumber": "FB884920",
            "rawName": "Олександр Шевченко",
            "normalizedName": "Oleksandr Shevchenko",
            "dobRaw": "12.04.1988",
            "dobIso": "1988-04-12",
            "placeOfBirth": "Kyiv, Ukraine",
            "sex": "M",
            "expiryDate": "2032-04-12",
            "mrzLine1": "P<UKRSHEVCHENKO<<OLEKSANDR<<<<<<<<<<<<<<<<<<",
            "mrzLine2": "FB884920<4UKR8804128M3204124<<<<<<<<<<<<<<02",
            "scanConfidence": 99.4,
            "opticalCheck": "ICAO 9303 Compliant Security Hologram Verified"
        },
        "registries": {
            "REG_UA_TAX": {
                "id": "REG_UA_TAX",
                "name": "State Tax Service of Ukraine (ДПС)",
                "status": "MATCHED",
                "statusLabel": "Verified Direct Match",
                "matchConfidence": 100,
                "recordId": "UA-TIN-3224508911",
                "registeredName": "Шевченко Олександр Миколайович",
                "registeredDob": "1988-04-12",
                "statusColor": "green",
                "details": "Taxpayer PIN verified; legal name matches Cyrillic source biometric chip."
            },
            "REG_SE_MIGRATION": {
                "id": "REG_SE_MIGRATION",
                "name": "Swedish Migration Agency (Migrationsverket)",
                "status": "MATCHED",
                "statusLabel": "Verified Residence Application",
                "matchConfidence": 98,
                "recordId": "SE-MIG-2022-894102",
                "registeredName": "Oleksandr Shevchenko",
                "registeredDob": "1988-04-12",
                "statusColor": "green",
                "details": "Temporary Protection Directive registration active; photo biometric vector match 0.992."
            },
            "REG_EU_VISA": {
                "id": "REG_EU_VISA",
                "name": "European Visa Information System (EU VIS)",
                "status": "MATCHED",
                "statusLabel": "Biometric Record Aligned",
                "matchConfidence": 96,
                "recordId": "VIS-BXL-90812948-C",
                "registeredName": "SHEVCHENKO, OLEKSANDR",
                "registeredDob": "1988-04-12",
                "statusColor": "green",
                "details": "Schengen entry biometric log confirms passport number FB884920 and facial landmarks."
            }
        },
        "reconciliation": {
            "confidenceScore": 98,
            "verdict": "AUTO-MERGE",
            "verdictSummary": "Deterministic Identity Resolution Succeeded",
            "color": "green",
            "scriptTransliterationStatus": "ISO 9:1995 Exact Transliteration Match",
            "dateNormalizationStatus": "DD.MM.YYYY parsed to ISO 8601 (1988-04-12)",
            "vectorSimilarity": 0.984,
            "reconciliationRulesApplied": [
                "ICAO Doc 9303 Cyrillic Romanization (Table B-3)",
                "ISO 8601 Extended Temporal Format Standard",
                "Cross-border Tax Identification PIN Corroboration",
                "eIDAS 2.0 LoA High Multi-Source Consensus (3/3 registries)"
            ]
        },
        "goldenRecord": {
            "status": "VERIFIED_GOLDEN_RECORD",
            "eidas_compliance_version": "2.0",
            "golden_record": {
                "standardized_first_name": "OLEKSANDR",
                "standardized_last_name": "SHEVCHENKO",
                "native_script_full_name": "Олександр Шевченко",
                "iso_date_of_birth": "1988-04-12",
                "cross_border_match_confidence": 98
            },
            "data_lineage_audit": [
                "Inbound_Immigration_Log",
                "State_Tax_Service_Ukraine_TIN",
                "Skatteverket_Registry",
                "EU_VIS_Biometric_Entry_Log"
            ]
        },
        "reasoningLog": [
            "[STEP 01: INGESTION] Ingested document scan: Passport UKR FB884920.",
            "[STEP 02: SCRIPT ANALYSIS] Detected Cyrillic UTF-8 string 'Олександр Шевченко'.",
            "[STEP 03: TRANSLITERATION] Applied ISO 9 / ICAO Doc 9303 transliteration table: 'Олександр' -> 'Oleksandr', 'Шевченко' -> 'Shevchenko'.",
            "[STEP 04: DATE HARMONIZATION] Detected regional date separator '.' in '12.04.1988'. Successfully normalized to ISO 8601 standard '1988-04-12'.",
            "[STEP 05: REGISTRY QUERY] Dispatched parallel federated queries to REG_UA_TAX, REG_SE_MIGRATION, and REG_EU_VISA.",
            "[STEP 06: MULTI-SOURCE MATCH] REG_UA_TAX confirmed TIN 3224508911 (100%). REG_SE_MIGRATION confirmed Migrationsverket dossier 2022-894102 (98%). REG_EU_VISA verified entry record VIS-BXL-90812948-C (96%).",
            "[STEP 07: VECTOR PROXIMITY] Name embedding cosine similarity: 0.984. Biometric face vector distance: 0.04 (Well within 0.15 tolerance).",
            "[STEP 08: DECISION POLICY] Confidence score 98% exceeds threshold 90%. System executes automatic profile consolidation (AUTO-MERGE)."
        ]
    },

    "scenario_2": {
        "id": "scenario_2",
        "tabLabel": "Scenario 2: Korean National ID (Name Order Inversion)",
        "title": "Korean National ID (Name Order & Inversion Resolution)",
        "description": "Resolution of East Asian patronymic surname-first ordering against Western inverted records.",
        "badge": {
            "label": "AUTO-MERGE",
            "score": 98,
            "status": "APPROVED",
            "color": "green",
            "threshold": 90,
            "eidasLoa": "HIGH"
        },
        "document": {
            "type": "Republic of Korea Resident Registration Card",
            "issuingCountry": "Republic of Korea (KOR)",
            "documentNumber": "KR941123-1082914",
            "rawName": "KIM Min-Seo (김민서)",
            "normalizedName": "Min-Seo Kim",
            "dobRaw": "1994.11.23",
            "dobIso": "1994-11-23",
            "placeOfBirth": "Seoul, South Korea",
            "sex": "M",
            "expiryDate": "2034-11-23",
            "mrzLine1": "IDKORKIM<<MIN<SEO<<<<<<<<<<<<<<<<<<<<<<<<<<",
            "mrzLine2": "9411231M3411234KOR<<<<<<<<<<<<<<8",
            "scanConfidence": 98.7,
            "opticalCheck": "Korean Ministry of the Interior Security Watermark Verified"
        },
        "registries": {
            "REG_UA_TAX": {
                "id": "REG_UA_TAX",
                "name": "State Tax Service of Ukraine (ДПС)",
                "status": "NOT_APPLICABLE",
                "statusLabel": "No Record (Non-Resident)",
                "matchConfidence": 0,
                "recordId": "N/A",
                "registeredName": "No prior tax filing",
                "registeredDob": "N/A",
                "statusColor": "neutral",
                "details": "Jurisdiction non-resident; no historical income or temporary tax registration found."
            },
            "REG_SE_MIGRATION": {
                "id": "REG_SE_MIGRATION",
                "name": "Swedish Migration Agency (Migrationsverket)",
                "status": "MATCHED",
                "statusLabel": "Work Permit Record Located",
                "matchConfidence": 98,
                "recordId": "SE-MIG-2023-441098",
                "registeredName": "Jeong, Min-Seo Kim",
                "registeredDob": "1994-11-23",
                "statusColor": "green",
                "details": "ICT Specialist work permit dossier; surname registered as dual maternal/family name 'Jeong, Min-Seo Kim'."
            },
            "REG_EU_VISA": {
                "id": "REG_EU_VISA",
                "name": "European Visa Information System (EU VIS)",
                "status": "MATCHED",
                "statusLabel": "D-Visa Biometrics Aligned",
                "matchConfidence": 96,
                "recordId": "VIS-ARN-88201944-K",
                "registeredName": "KIM, MIN-SEO",
                "registeredDob": "1994-11-23",
                "statusColor": "green",
                "details": "Stockholm Arlanda border authority registration confirms match with passport photo and iris token."
            }
        },
        "reconciliation": {
            "confidenceScore": 98,
            "verdict": "AUTO-MERGE",
            "verdictSummary": "Name Order Inversion Resolved With High Assurance",
            "color": "green",
            "scriptTransliterationStatus": "Revised Romanization of Korean (RR) Validated",
            "dateNormalizationStatus": "Period notation YYYY.MM.DD normalized to ISO 8601 (1994-11-23)",
            "vectorSimilarity": 0.982,
            "reconciliationRulesApplied": [
                "East Asian Name Token Permutation Matrix (Surname-First / Given-First)",
                "Korean Family Census Bureau Token Alignment (Jeong / Kim matrilineal affix)",
                "ISO 8601 Extended Temporal Format Standard",
                "Consensus validation across SE_MIGRATION and EU_VIS"
            ]
        },
        "goldenRecord": {
            "status": "VERIFIED_GOLDEN_RECORD",
            "eidas_compliance_version": "2.0",
            "golden_record": {
                "standardized_first_name": "MIN-SEO",
                "standardized_last_name": "KIM",
                "native_script_full_name": "김민서",
                "iso_date_of_birth": "1994-11-23",
                "cross_border_match_confidence": 98
            },
            "data_lineage_audit": ["Inbound_Immigration_Log", "Skatteverket_Registry"]
        },
        "reasoningLog": [
            "[STEP 01: INGESTION] Ingested document scan: Korea Resident Card KR941123-1082914.",
            "[STEP 02: TOKENIZATION] Extracted raw name tokens: ['KIM', 'Min-Seo']. Detected Korean Hangul characters '김민서'.",
            "[STEP 03: SYNTACTIC INVERSION] Generated candidate token permutations: ['Min-Seo Kim', 'Kim, Min-Seo'].",
            "[STEP 04: MATERNAL PREFIX DETECTION] Cross-referenced Swedish migration entry 'Jeong, Min-Seo Kim'. Detected compound familial legal structure in migration file.",
            "[STEP 05: REGISTRY QUERY] Queried Swedish Migration Agency (REG_SE_MIGRATION) and EU Visa Information System (REG_EU_VISA).",
            "[STEP 06: TEMPORAL MATCH] Date of birth '1994.11.23' parsed and matches exactly '1994-11-23' across Swedish and EU databases.",
            "[STEP 07: BIOMETRIC & JACCARD DISTANCE] Token Jaccard similarity after inversion: 0.96. Sub-word byte-pair cosine similarity: 0.982.",
            "[STEP 08: DECISION POLICY] Final aggregate score 98% exceeds confidence threshold 90%. System executes automated master link (AUTO-MERGE)."
        ]
    },

    "scenario_3": {
        "id": "scenario_3",
        "tabLabel": "Scenario 3: Name Twin Disambiguation (Human-in-the-Loop Safeguard)",
        "title": "Name Twin Disambiguation (High Collision Safeguard)",
        "description": "Clerical safeguard detecting homonymic collisions sharing identical birth dates but contradictory birthplaces.",
        "badge": {
            "label": "FLAGGED FOR HUMAN CLERICAL REVIEW",
            "score": 45,
            "status": "FLAGGED",
            "color": "red",
            "threshold": 90,
            "eidasLoa": "SUBSTANTIAL_ONLY"
        },
        "document": {
            "type": "Swedish National ID Card (Nationellt identitetskort)",
            "issuingCountry": "Sweden (SWE)",
            "documentNumber": "SE900115-4019",
            "rawName": "Anna Maria Andersson",
            "normalizedName": "Anna Maria Andersson",
            "dobRaw": "1990-01-15",
            "dobIso": "1990-01-15",
            "placeOfBirth": "Stockholm, Sweden",
            "sex": "F",
            "expiryDate": "2029-01-15",
            "mrzLine1": "IDSE9001154019<<<<<<<<<<<<<<<<<<<<<<<<<<<",
            "mrzLine2": "9001154F2901158SWE<<<<<<<<<<<<<<4",
            "scanConfidence": 99.8,
            "opticalCheck": "Swedish Police Authority Microprint & Chip Authenticated"
        },
        "registries": {
            "REG_UA_TAX": {
                "id": "REG_UA_TAX",
                "name": "State Tax Service of Ukraine (ДПС)",
                "status": "NOT_APPLICABLE",
                "statusLabel": "No Record",
                "matchConfidence": 0,
                "recordId": "N/A",
                "registeredName": "No jurisdiction entry",
                "registeredDob": "N/A",
                "statusColor": "neutral",
                "details": "No activity recorded in non-EU eastern cross-registry."
            },
            "REG_SE_MIGRATION": {
                "id": "REG_SE_MIGRATION",
                "name": "Swedish Tax Agency Civil Register (Skatteverket / Folkbokföring)",
                "status": "CONFLICT",
                "statusLabel": "Homonym Collision Detected",
                "matchConfidence": 48,
                "recordId": "SE-SKATT-19900115-9921",
                "registeredName": "Anna Maria Andersson",
                "registeredDob": "1990-01-15",
                "statusColor": "red",
                "details": "Registered birthplace: 'Gothenburg' (Göteborg), Sweden. Contradicts document birthplace 'Stockholm'."
            },
            "REG_EU_VISA": {
                "id": "REG_EU_VISA",
                "name": "European Visa Information System (EU VIS)",
                "status": "CONFLICT",
                "statusLabel": "Discrepancy In Biometrics",
                "matchConfidence": 42,
                "recordId": "VIS-CPH-77401928-S",
                "registeredName": "ANDERSSON, ANNA MARIA",
                "registeredDob": "1990-01-15",
                "statusColor": "red",
                "details": "Biometric face landmark distance: 0.48 (Exceeds acceptable threshold of 0.15). Suspected distinct individual."
            }
        },
        "reconciliation": {
            "confidenceScore": 45,
            "verdict": "FLAGGED FOR HUMAN CLERICAL REVIEW",
            "verdictSummary": "Spatial & Biometric Contradiction - Human Intercession Mandated",
            "color": "red",
            "scriptTransliterationStatus": "Latin Direct Verification (No Script Discrepancy)",
            "dateNormalizationStatus": "ISO 8601 Date Matched Exactly (1990-01-15)",
            "vectorSimilarity": 0.450,
            "reconciliationRulesApplied": [
                "Swedish Skatteverket Population Register Pinpointing",
                "Geographic Spatial Consistency Verification (Stockholm vs Gothenburg)",
                "Biometric Distance Exclusion Test (> 0.15 Euclidean threshold)",
                "eIDAS 2.0 Article 22 Prohibition on Unsupervised Automated Rejection"
            ]
        },
        "goldenRecord": {
            "status": "FLAGGED_PENDING_CLERICAL_REVIEW",
            "eidas_compliance_version": "2.0",
            "golden_record": {
                "standardized_first_name": "ANNA MARIA",
                "standardized_last_name": "ANDERSSON",
                "native_script_full_name": "Anna Maria Andersson",
                "iso_date_of_birth": "1990-01-15",
                "cross_border_match_confidence": 45
            },
            "data_lineage_audit": [
                "Inbound_Immigration_Log",
                "Skatteverket_Folkbokföring_Registry",
                "EU_VIS_Biometric_Entry_Log"
            ]
        },
        "reasoningLog": [
            "[STEP 01: INGESTION] Ingested document scan: Swedish National ID SE900115-4019.",
            "[STEP 02: PHONETIC COLLISION CHECK] Candidate name 'Anna Maria Andersson' is ranked in top 0.05% frequency collision pool in Sweden.",
            "[STEP 03: TEMPORAL CORRELATION] Date of birth '1990-01-15' matches multiple records in Swedish population registry (Folkbokföringsregistret).",
            "[STEP 04: SPATIAL VALIDATION CONFLICT] Document claims place of birth 'Stockholm, Sweden', whereas civil registry entry SE-SKATT-19900115-9921 records birthplace as 'Gothenburg, Sweden' (Distance delta: 470 km).",
            "[STEP 05: BIOMETRIC COMPARISON] Facial landmark comparison against VIS-CPH-77401928-S yields Euclidean distance of 0.48 (Permissible threshold is <= 0.15).",
            "[STEP 06: MULTI-ENTITY RISK] Probability of homonymic entity confusion: 91.2%. High risk of fraudulent identity consolidation.",
            "[STEP 07: DECISION POLICY] Confidence score is 45% (Well below the 90% automated threshold).",
            "[STEP 08: SAFEGUARD ACTIVATION] Automated merge immediately halted. Profile escalated to Human Clerical Review queue with audit tag 'HOMONYM_DISAMBIGUATION_REQUIRED'."
        ]
    },
    "scenario_insubstantial": {
        "id": "scenario_insubstantial",
        "tabLabel": "🚨 Insubstantial Document (Critical Security Deficit)",
        "title": "Damaged / Obscured Identity Credential (Critical Safeguard)",
        "description": "Critical attributes (Document Number, Legal Name, Sex, DOB) unreadable. Automated merge locked out under eIDAS 2.0 regulations.",
        "badge": {
            "label": "🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION",
            "score": 24,
            "status": "FLAGGED",
            "color": "red",
            "threshold": 90,
            "eidasLoa": "SUBSTANTIAL_ONLY"
        },
        "document": {
            "type": "Damaged Identity Credential",
            "issuingCountry": "Ukraine (UKR)",
            "documentNumber": "UNREADABLE [SCRATCHED OUT]",
            "rawName": "UNREADABLE [SMUDGED INK]",
            "normalizedName": "UNREADABLE",
            "dobRaw": "UNREADABLE",
            "dobIso": "UNREADABLE",
            "placeOfBirth": "Kyiv, Ukraine",
            "sex": "UNREADABLE",
            "expiryDate": "2032-04-12",
            "mrzLine1": "P<UKR<<<<<<<<<<<<<<UNREADABLE<<<<<<<<<<<<<<<",
            "mrzLine2": "ILLEGIBLE<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<",
            "scanConfidence": 24.0,
            "opticalCheck": "🚨 CRITICAL DEFICIT: Optical scan obscured. Document Number, Full Name, DOB, and Sex unreadable."
        },
        "registries": {
            "REG_UA_TAX": {
                "id": "REG_UA_TAX",
                "name": "State Tax Service of Ukraine (ДПС)",
                "status": "BLOCKED_PENDING_CLERICAL_OVERRIDE",
                "statusLabel": "Query Blocked (Insubstantial Biometrics)",
                "matchConfidence": 0,
                "recordId": "LOCKED",
                "registeredName": "BLOCKED: Missing Key Biometrics",
                "registeredDob": "N/A",
                "statusColor": "red",
                "details": "Federated query halted. Missing required root parameters (Document Number, Full Name, or Sex)."
            },
            "REG_SE_MIGRATION": {
                "id": "REG_SE_MIGRATION",
                "name": "Swedish Migration Agency (Migrationsverket)",
                "status": "BLOCKED_PENDING_CLERICAL_OVERRIDE",
                "statusLabel": "Query Blocked (Insubstantial Biometrics)",
                "matchConfidence": 0,
                "recordId": "LOCKED",
                "registeredName": "BLOCKED: Missing Key Biometrics",
                "registeredDob": "N/A",
                "statusColor": "red",
                "details": "eIDAS 2.0 high-assurance verification suspended. Automated correlation prohibited."
            },
            "REG_EU_VISA": {
                "id": "REG_EU_VISA",
                "name": "European Visa Information System (EU VIS)",
                "status": "BLOCKED_PENDING_CLERICAL_OVERRIDE",
                "statusLabel": "Query Blocked (Insubstantial Biometrics)",
                "matchConfidence": 0,
                "recordId": "LOCKED",
                "registeredName": "BLOCKED: Missing Key Biometrics",
                "registeredDob": "N/A",
                "statusColor": "red",
                "details": "Biometric landmark cross-check suspended pending manual clerical verification."
            }
        },
        "reconciliation": {
            "confidenceScore": 24,
            "verdict": "CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION",
            "verdictSummary": "Security Violation: Critical attributes [Document Number, Full Name, Sex] unreadable or missing. Automated resolution blocked under eIDAS 2.0 regulations. Manual clerical override mandated.",
            "color": "red",
            "scriptTransliterationStatus": "HALTED · Critical biometric attributes unreadable",
            "dateNormalizationStatus": "SUSPENDED · Awaiting clerical override",
            "vectorSimilarity": 0.0,
            "reconciliationRulesApplied": [
                "🚨 eIDAS 2.0 LoA High Security Guardrail: Critical Biometric Check FAILED",
                "Mandatory Root Missing: Document Number, Full Name, Sex",
                "Confidence Floor Enforcement: Score forced below 40% (24%)",
                "Auto-Merge Lockout: Automated consolidation strictly blocked",
                "GDPR Article 22 & Commission Regulation (EU) 2015/1502 Active"
            ]
        },
        "goldenRecord": {
            "status": "BLOCKED_INSUBSTANTIAL_DOCUMENTATION",
            "eidas_compliance_version": "2.0",
            "golden_record": {
                "standardized_first_name": "UNREADABLE",
                "standardized_last_name": "UNREADABLE",
                "native_script_full_name": "UNREADABLE",
                "iso_date_of_birth": "UNREADABLE",
                "cross_border_match_confidence": 24
            },
            "data_lineage_audit": []
        },
        "reasoningLog": [
            "[STEP 01: INGESTION] Ingested document scan: Damaged Identity Credential issued by Ukraine (UKR).",
            "[CRITICAL SECURITY ALERT] Missing required biometric fields: [Document Number, Full Name, Sex, Date of Birth].",
            "[eIDAS 2.0 LoA HIGH VIOLATION] Commission Regulation (EU) 2015/1502 mandates deterministic verification of Document Number, Full Legal Name, and Sex.",
            "[AUTOMATED FALLBACK] Match confidence score immediately degraded to 24% (< 40% security threshold).",
            "[STATUS RE-CLASSIFIED] Verdict set to 'CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION'.",
            "[AUTO-MERGE LOCKED OUT] Master profile automated consolidation track is strictly locked.",
            "[FEDERATED REGISTRIES BLOCKED] Queries to REG_UA_TAX, REG_SE_MIGRATION, and REG_EU_VISA suspended pending legible attributes.",
            "[HUMAN TRIGGER MANDATED] UI routed to Manual Override form. Adjudicating clerk must manually type missing parameters before reconciliation can proceed."
        ]
    }
}


def is_field_readable(value: Any) -> bool:
    """
    Evaluates whether an identity attribute was parsed with high optical clarity.

    Args:
        value (Any): String value extracted from optical character recognition.

    Returns:
        bool: True if readable and non-empty, False if unreadable or missing.
    """
    if not value:
        return False
    clean = str(value).strip().upper()
    if not clean:
        return False
    unreadable_markers = [
        "UNREADABLE", "MISSING", "CORRUPT", "SMUDGED", "ILLEGIBLE",
        "OBSCURED", "N/A", "UNKNOWN", "NOT SPECIFIED", "NONE", "DAMAGED"
    ]
    for marker in unreadable_markers:
        if marker in clean:
            return False
    return True


def validate_critical_fields(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Strict security check verifying high-clarity parsing of critical identity fields:
    - Document Number
    - Full Legal Name
    - Sex
    - Date of Birth

    Args:
        doc (Dict[str, Any]): Ingested document fields dictionary.

    Returns:
        Dict[str, Any]: Validation assessment containing is_valid, missing_fields, and violations.
    """
    logger.info("Executing validate_critical_fields on document: '%s'", doc.get("documentNumber", "UNKNOWN"))
    missing_fields: List[str] = []

    # Check Document Number
    doc_num = doc.get("documentNumber", "")
    if not is_field_readable(doc_num):
        missing_fields.append("Document Number")

    # Check Full Name
    raw_name = doc.get("rawName", "")
    norm_name = doc.get("normalizedName", "")
    if not is_field_readable(raw_name) and not is_field_readable(norm_name):
        missing_fields.append("Full Name")

    # Check Sex
    sex = doc.get("sex", "")
    if not is_field_readable(sex) or sex.strip().upper() not in ["M", "F", "X", "MALE", "FEMALE"]:
        missing_fields.append("Sex")

    # Check Date of Birth
    dob_raw = doc.get("dobRaw", "")
    dob_iso = doc.get("dobIso", "")
    if not is_field_readable(dob_raw) and not is_field_readable(dob_iso):
        missing_fields.append("Date of Birth")

    is_valid = len(missing_fields) == 0
    if not is_valid:
        logger.warning(
            "CRITICAL COMPLIANCE FAILURE: Missing or unreadable fields detected: %s",
            ", ".join(missing_fields)
        )
    else:
        logger.info("Critical field check PASSED: Document Number, Full Name, Sex, and DOB verified legible.")

    return {
        "isValid": is_valid,
        "missingFields": missing_fields,
        "isCriticalDeficit": not is_valid
    }


def evaluate_reconciliation_safeguards(doc: Dict[str, Any], baseline_score: int = 96) -> Dict[str, Any]:
    """
    Applies strict conditional safety rules to identity reconciliation:
    1. CRITICAL FIELD CHECK: Verify 'Document Number', 'Full Name', 'Sex', and 'DOB'.
    2. AUTOMATED FALLBACK: If any critical field is unreadable, drop score below 40%.
    3. STATUS RE-CLASSIFICATION: Force status to '🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION'
       and completely lock out 'Auto-Merge'.
    4. HUMAN TRIGGER: Mandate manual clerical override before reconciliation can occur.

    Args:
        doc (Dict[str, Any]): Ingested document attributes.
        baseline_score (int): Standard algorithmic score prior to safety enforcement.

    Returns:
        Dict[str, Any]: Safeguarded reconciliation result with enforced security boundaries.
    """
    logger.info("Evaluating identity reconciliation safeguards for baseline_score=%d%%", baseline_score)
    crit_check = validate_critical_fields(doc)

    if not crit_check["isValid"]:
        missing = crit_check["missingFields"]
        # Rule 2: Automated Fallback - score strictly below 40%
        enforced_score = min(24, baseline_score)
        # Rule 3: Status Re-classification
        verdict = "CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION"
        badge_label = "🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION"
        auto_merge_locked = True
        # Rule 4: Human Trigger
        manual_override_required = True

        logger.warning(
            "SAFEGUARD TRIGGERED: Score dropped to %d%% (< 40%%). Auto-Merge locked. Verdict: '%s'. Missing: %s",
            enforced_score, verdict, missing
        )

        return {
            "confidenceScore": enforced_score,
            "verdict": verdict,
            "badgeLabel": badge_label,
            "badgeColor": "red",
            "isAutoMergeLocked": auto_merge_locked,
            "manualOverrideRequired": manual_override_required,
            "missingCriticalFields": missing,
            "isCriticalError": True,
            "complianceNotice": (
                f"Automated resolution blocked under eIDAS 2.0 regulations. "
                f"Missing critical attributes: [{', '.join(missing)}]. Manual clerical override mandated."
            )
        }

    # Normal algorithmic flow if critical fields are fully verified
    is_auto = baseline_score >= 90
    return {
        "confidenceScore": baseline_score,
        "verdict": "AUTO-MERGE" if is_auto else "FLAGGED FOR HUMAN CLERICAL REVIEW",
        "badgeLabel": "AUTO-MERGE" if is_auto else "HUMAN REVIEW REQUIRED",
        "badgeColor": "green" if is_auto else "red",
        "isAutoMergeLocked": not is_auto,
        "manualOverrideRequired": False,
        "missingCriticalFields": [],
        "isCriticalError": False,
        "complianceNotice": "Deterministic Cross-Border Identity Resolution Succeeded" if is_auto else "Spatial / Biometric Contradiction Detected"
    }


if __name__ == "__main__":
    logger.info("Executing self-test for scenarios_data.py with strict security guardrails")
    scenarios = get_all_scenarios()
    for s_id, s_data in scenarios.items():
        doc_obj = s_data["document"]
        recon_obj = s_data["reconciliation"]
        evaluated = evaluate_reconciliation_safeguards(doc_obj, recon_obj["confidenceScore"])
        logger.info(
            "Scenario '%s' -> Score=%d%%, Verdict='%s', AutoMergeLocked=%s, Missing=%s",
            s_id, evaluated["confidenceScore"], evaluated["verdict"],
            evaluated["isAutoMergeLocked"], evaluated["missingCriticalFields"]
        )

    # Test corrupted document specifically
    damaged_doc = {
        "documentNumber": "UNREADABLE",
        "rawName": "UNREADABLE",
        "sex": "UNREADABLE",
        "dobRaw": "1990-01-01"
    }
    test_result = evaluate_reconciliation_safeguards(damaged_doc, 98)
    assert test_result["confidenceScore"] < 40, "Confidence score must be strictly below 40%"
    assert test_result["isAutoMergeLocked"] is True, "Auto-merge must be locked"
    assert "CRITICAL ERROR" in test_result["verdict"], "Verdict must be CRITICAL ERROR"
    assert test_result["manualOverrideRequired"] is True, "Manual override must be required"
    print("All scenarios and strict security guardrail self-tests PASSED successfully.")
