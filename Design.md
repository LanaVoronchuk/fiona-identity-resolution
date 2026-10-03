# Fiona - Cross-Border Identity Resolution Portal
## Architecture, Data Specification & eIDAS 2.0 Framework Documentation

---

### 1. Executive Summary & Purpose

**Fiona** is an enterprise-grade cross-border identity resolution portal engineered to reconcile fragmented and multilingual citizen and migrant identity attributes across European Union and international registries. Built in strict alignment with **eIDAS 2.0 (Regulation (EU) 2024/1183)** and **ICAO 9303 standards**, Fiona operates as an automated deterministic reconciliation and clerk-assisted resolution engine. 

**Core Product Deliverable**: Fiona's primary deliverable is the clean, verified, ready-to-integrate **"eIDAS 2.0 EU Wallet Golden Record"** dataset. This canonical, cryptographically corroborated JSON record consolidates conflicting sovereign registries, resolves non-Latin script transliterations and surname inversions, validates ISO 8601 temporal formats, and packages the verified master identity directly for ingestion into the European Digital Identity (EUDI) Wallet.

---

### 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|               Fiona | Cross-Border Identity Resolution Engine                     |
+-----------------------------------------------------------------------------------+
|  Top Scenario Selector (State Cascades & Preset Dispatcher)                       |
+--------------------------+------------------------------+-------------------------+
| Column 1:                | Column 2:                    | Column 3:               |
| Document Ingestion &     | Reconciliation Engine &      | Agent Reasoning Log &   |
| Vision OCR Parsing       | Registry Cross-Match         | eIDAS 2.0 Audit Action  |
+--------------------------+------------------------------+-------------------------+
| - Document visualizer    | - Match Confidence Score (%) | - 🔒 OUTPUT: EU WALLET  |
| - Raw OCR extraction     | - Threshold Gating:          |   GOLDEN RECORD (CORE)  |
| - Transliteration view   |     >= 90%: AUTO-MERGE       | - Ready-to-integrate    |
| - Normalized ISO fields  |      < 90%: HUMAN REVIEW     |   Golden Record JSON    |
| - Interactive Re-scan    | - Static Registry Cards:     | - Step-by-step trace    |
| - Critical field checks  |     * REG_UA_TAX             | - Script transliterat.  |
|   (Doc#, Name, Sex, DOB) |     * REG_SE_MIGRATION       | - Vector similarity     |
|                          |     * REG_EU_VISA            | - Clerk Decision:       |
|                          | - Manual Override Form       |     * Approve Master    |
|                          |                              |     * Flag for Review   |
+--------------------------+------------------------------+-------------------------+
|                  Enterprise Logging & Audit Trail Bus                             |
+-----------------------------------------------------------------------------------+
```

---

### 3. Active Modules & Components

1. **`scenarios_data.py` / `src/data/scenariosData.ts`**:
   - Central repository of identity verification presets representing distinct international edge cases:
     * **Scenario 1**: Ukrainian International Passport. Cyrillic script normalization (`Олександр Шевченко` -> `Oleksandr Shevchenko`) + DD.MM.YYYY to ISO 8601 normalization. Output: 98% Match (AUTO-MERGE).
     * **Scenario 2**: Korean National Identification Card. East Asian surname-first patronymic inversion (`KIM Min Su` matched against Swedish migration entry `Jeong, Minsu Kim`). Output: 94% Match (AUTO-MERGE).
     * **Scenario 3**: High-Collision Name Twin Disambiguation. Homonymic collision (`Anna Maria Andersson`, born 1990-01-15, Stockholm vs Gothenburg birthplace conflict). Output: 45% Match (FLAGGED FOR HUMAN CLERICAL REVIEW).
   - Mock verification statuses for sovereign endpoints: `REG_UA_TAX`, `REG_SE_MIGRATION`, `REG_EU_VISA`.

2. **`app.py` / `src/App.tsx`**:
   - Nordic / EU Dark Slate Blue agency dashboard layout with high-contrast tabular figures, strict WCAG AA contrast, and zero-pill typographic discipline.
   - Header with operational state: `Fiona Agent: Active`, EU eIDAS 2.0 Compliance mark.
   - 3-Scenario selector tab bar providing instantaneous cascading updates across all columns.
   - Interactive Document Re-scan pipeline with live simulated OCR progress and field extraction.
   - Multi-source registry inspector with verified attribute badges and mismatch warnings.
   - Plain-text reasoning step timeline detailing transliteration standards, vector proximity, and geographical verification.
   - Audit action bar with real-time clerk overrides, modal confirmations, and immutable local session audit logs.

3. **`server.ts` (Gemini 3.8 Flash Vision OCR Endpoint)**:
   - Full-stack Express API route `POST /api/ocr-extract`.
   - Ingests uploaded PNG/JPEG biometric credentials, calls `@google/genai` model `gemini-3.8-flash`.
   - Returns structured JSON containing raw/normalized names, raw/ISO birth dates, document numbers, issuing countries, and security watermark checks.
   - Logs model requests, prompts, and sanitized JSON outputs as INFO, stripping raw image binary data.

4. **`src/utils/reconciliationLoop.ts` (Real-Time Standardization Loop)**:
   - Harmonizes raw OCR strings into eIDAS 2.0 standardization packages.
   - Evaluates match scores, thresholding ($\ge 90\%$ AUTO-MERGE vs $< 90\%$ HUMAN REVIEW), multi-registry corroboration (`REG_UA_TAX`, `REG_SE_MIGRATION`, `REG_EU_VISA`), and builds the step-by-step reasoning trace.

5. **`src/utils/logger.ts` / Logging Bus**:
   - Structured JSON and console logging for every function invocation, configuration change, OCR scan event, and reconciliation calculation.
   - Strips raw base64 and image binary buffers to preserve clean security logs.

---

### 4. Data Specification & Fields

#### 4.1 Document Ingestion & OCR Attributes
| Field Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `rawName` | String | Raw text parsed from physical ID/passport | `Олександр Шевченко` |
| `normalizedName` | String | Standardized Latin representation (ICAO/ISO 9) | `Oleksandr Shevchenko` |
| `dobRaw` | String | Extracted date of birth prior to ISO conversion | `12.04.1988` |
| `dobIso` | String | ISO 8601 standardized date of birth (`YYYY-MM-DD`) | `1988-04-12` |
| `docNumber` | String | National ID or passport alphanumeric code | `FB884920` |
| `issuingCountry` | String | ISO 3166-1 alpha-2 / alpha-3 issuing authority | `UKR (Ukraine)` |
| `docType` | String | Document category (Passport, National ID, Residence) | `Biometric Passport` |
| `expiryDate` | String | ISO format expiration date | `2032-06-18` |

#### 4.2 Cross-Registry Match Attributes
| Registry Key | Full Authority Name | Verification Role |
| :--- | :--- | :--- |
| `REG_UA_TAX` | State Tax Service of Ukraine Registry | Tax Identification Code & Legal Name cross-check |
| `REG_SE_MIGRATION` | Swedish Migration Agency (*Migrationsverket*) | Biometric residence record & national personal ID check |
| `REG_EU_VISA` | European Union Visa Information System (VIS) | Schengen border entry biometric & travel document log |

#### 4.3 Reconciliation Metrics & Strict Conditional Safety Guardrails
- **Match Score (`0` - `100%`)**: Weighted composite score factoring script similarity, phonetic/metaphone proximity, date coherence, and issuing authority cryptographic signatures.
- **Threshold Policy**:
  * **Confidence $\ge$ 90%**: Automated Resolution (`AUTO-MERGE`). Green status badge.
  * **Confidence $<$ 90%**: Human Verification Gate (`HUMAN REVIEW REQUIRED`). Crimson status badge.
- **Strict Conditional Safety Rules (Insubstantial Documentation Protocol)**:
  1. **CRITICAL FIELD CHECK**: Verification engine mandates high-clarity optical recognition of:
     - `Document Number`
     - `Full Legal Name`
     - `Sex` (Gender marker)
     - `Date of Birth`
  2. **AUTOMATED FALLBACK**: If ANY of these critical fields are unreadable, damaged, smudged, or missing from the optical scan, the engine **must NEVER issue a 90%+ confidence score**. The Match Confidence Score is instantly degraded strictly below 40% (e.g., 24%).
  3. **STATUS RE-CLASSIFICATION**: The status badge is forced to Red `🚨 CRITICAL ERROR: INSUBSTANTIAL DOCUMENTATION`, and the `AUTO-MERGE` track is completely locked out.
  4. **HUMAN TRIGGER & MANUAL OVERRIDE**: The UI automatically routes to the **Manual Clerical Override Form**, requiring an authenticated immigration or consular officer to physically inspect the credential and key the missing parameters before reconciliation or wallet consolidation can proceed.

#### 4.4 eIDAS 2.0 Golden Record Schema (Primary Product Deliverable)
Fiona's definitive product output is the canonical **"eIDAS 2.0 EU Wallet Golden Record"**, displayed under the prominent title `🔒 OUTPUT: EU WALLET GOLDEN RECORD`. This standardized enterprise JSON payload conforms to the following strict specification:

```json
{
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
}
```

##### Field Specifications:
| Attribute | Type | Description | Permitted Values |
| :--- | :--- | :--- | :--- |
| `status` | String | eIDAS assurance classification | `VERIFIED_GOLDEN_RECORD`, `FLAGGED_PENDING_CLERICAL_REVIEW`, `BLOCKED_INSUBSTANTIAL_DOCUMENTATION` |
| `eidas_compliance_version` | String | Regulatory framework standard | `"2.0"` (Regulation (EU) 2024/1183) |
| `standardized_first_name` | String | Fully Romanized standardized given name | Uppercase Latin string (e.g., `"MIN-SEO"`, `"OLEKSANDR"`) |
| `standardized_last_name` | String | Fully Romanized standardized family name | Uppercase Latin string (e.g., `"KIM"`, `"SHEVCHENKO"`) |
| `native_script_full_name` | String | Unaltered legal name in source script | Cyrillic, Hangul, Scandinavian Latin (e.g., `"김민서"`, `"Олександр Шевченко"`) |
| `iso_date_of_birth` | String | Standardized birth date | ISO 8601 `YYYY-MM-DD` |
| `cross_border_match_confidence` | Number | Deterministic consensus score | Integer percentage (`0` - `100`) |
| `data_lineage_audit` | Array[String] | Cryptographic chain of verified evidence | Array of sovereign registry identifiers |

This Golden Record dataset is ready for direct ingestion by Member State European Digital Identity (EUDI) Wallet mobile applications and qualified trust service providers (QTSPs).

---

### 5. eIDAS 2.0 Compliance & Human-in-the-Loop Safeguards

1. **Level of Assurance (LoA) High & Minimum Data Set**:
   - In accordance with **Commission Implementing Regulation (EU) 2015/1502** and **Regulation (EU) 2024/1183 (eIDAS 2.0)**, identity matching across sovereign borders requires deterministic verification against certified national root registries. Missing core attributes (Document Number, Full Name, Sex) legally invalidate LoA High accreditation.
2. **GDPR Article 22 Compliance (Automated Individual Decision-Making)**:
   - Where identity ambiguity exists (such as Scenario 3 with birth locality discordance) or documentation is insubstantial, automated merging is strictly prohibited. The system mandates human clerk review, enforcing an explicit decision trail.
3. **Clerical Override & Auditability**:
   - Every normalization step (e.g. Cyrillic ISO 9 transliteration, surname-given name inversion via NFD Unicode decomposition) produces an unalterable step-by-step reasoning log visible to immigration officers. Manual overrides are digitally signed with officer credentials (`OFFICER_EU_7701`).
4. **Non-Latin Keyboard Input Assist & Background Reverse-Transliteration Resolver**:
   - **Caseworker Input Assist Caption**: The Manual Override Input Form in Column 1 provides clear guidance for EU immigration workers lacking non-Latin hardware:
     > `"⚠️ Input Assist: For non-Latin documents, type the name using standard Latin Romanization phonetics or enter the string exactly as printed on the bottom MRZ lines."`
   - **Linguistic Reverse-Mapping Engine**: When a Latin override is supplied for non-Latin jurisdictions (e.g. Ukrainian Cyrillic or Korean Hangul), Fiona's Gemini 3.8 Flash linguistic resolver automatically reverse-maps the Romanized input to the deduced sovereign script (`'Олександр Шевченко'` or `'김민서'`) to query foreign national registries.
   - **Golden Record Integrity**: Even under manual Latin override entry, the resulting Golden Record JSON always preserves the full `native_script_full_name` attribute alongside `standardized_first_name` and `standardized_last_name`.

---

### 6. Logging Standards

All function executions output structured INFO log records with the following schema:
```json
{
  "timestamp": "2026-10-03T09:35:00.000Z",
  "level": "INFO",
  "module": "FionaReconciliationEngine",
  "function": "reconcileIdentity",
  "scenarioId": "scenario_1",
  "confidenceScore": 0.98,
  "action": "AUTO_MERGE_APPROVED",
  "details": {
    "sourceTransliteration": "ISO 9:1995",
    "registriesEvaluated": ["REG_UA_TAX", "REG_SE_MIGRATION", "REG_EU_VISA"]
  }
}
```
Raw binary streams (such as passport photos or biometric face encodings) are sanitized prior to logging.
