# Fiona | Cross-Border Identity Resolution Portal
### EU Digital Identity Wallet (eIDAS 2.0) Compliance & Consensus Engine

[![eIDAS 2.0 Compliant](https://img.shields.io/badge/eIDAS_2.0-Regulation_(EU)_2024%2F1183-0284c7?style=flat-square&logo=europeanunion)](https://eur-lex.europa.eu/eli/reg/2024/1183/oj)
[![Level of Assurance](https://img.shields.io/badge/LoA-High_(Commission_Reg_2015%2F1502)-059669?style=flat-square)](https://eur-lex.europa.eu/eli/reg_impl/2015/1502/oj)
[![GDPR Art. 22](https://img.shields.io/badge/GDPR_Art._22-Human--in--the--Loop-dc2626?style=flat-square)](https://gdpr-info.eu/art-22-gdpr/)
[![Google Gemini 3.8 Flash](https://img.shields.io/badge/Google_Gemini-3.8_Flash_Vision_%26_Reasoning-4338ca?style=flat-square&logo=google)](https://ai.google.dev/)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x_Enterprise-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B_Streamlit-3776ab?style=flat-square&logo=python)](https://streamlit.io/)

---

## 1. Executive Summary & Core Mission

### The One-Billion-Kronor Data Contamination Crisis
Every year, European financial institutions, Nordic neobanks, cross-border FinTechs, and government agencies lose over **1,000,000,000 SEK (one billion Swedish kronor)** to identity contamination, onboarding fraud, and compliance penalties:

1. **Non-Latin Script Transliteration Gaps**: Inbound immigrants and remote workers holding Ukrainian Cyrillic (`Олександр Шевченко`), Arabic, or East Asian identification face inconsistent Latin transliterations across national tax, migration, and border registries.
2. **Name Token Permutations & Patronymic Inversions**: East Asian surname-first structures (e.g., `KIM Min Su`) are routinely corrupted when mapped against Western given-name/family-name databases (e.g., `Jeong, Minsu Kim`), causing false rejections or duplicate customer dossiers.
3. **Temporal Incoherence**: Incompatible regional date formats (`DD.MM.YYYY` vs `YYYY.MM.DD` vs `MM/DD/YYYY`) corrupt Know-Your-Customer (KYC) identity indexing.
4. **Catastrophic Name Twin Collisions**: Over-reliance on unweighted fuzzy matching leads to erroneous automated merges of distinct individuals who share popular names and birth dates (e.g. `Anna Maria Andersson` born `1990-01-15` in Stockholm vs Gothenburg).
5. **eIDAS 2.0 Legal Deadlines**: Under **Regulation (EU) 2024/1183 (eIDAS 2.0)**, all EU Member States and designated relying parties must accept accredited **European Digital Identity (EUDI) Wallets** with **Level of Assurance (LoA) High**. Manual or error-prone consolidation legally invalidates compliance.

### Fiona's Mission
**Fiona** is an automated, explainable cross-border identity resolution portal engineered to reconcile fragmented, multilingual citizen and migrant records across European Union registries. Fiona's core product deliverable is the clean, verified, ready-to-integrate **"eIDAS 2.0 EU Wallet Golden Record"** dataset.

---

## 2. Technical Architecture: Dual Google AI Stack

Fiona harnesses **TWO distinct Google AI technologies** orchestrated into an end-to-end deterministic reconciliation pipeline:

```
+---------------------------------------------------------------------------------------------------+
|                            FIONA CROSS-BORDER RECONCILIATION PIPELINE                             |
+---------------------------------------------------------------------------------------------------+
                                                  |
           [1] PHYSICAL CREDENTIAL / BIOMETRIC SCAN INGESTION (PNG / JPEG)
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  GOOGLE AI TECHNOLOGY 1: Google Gemini Multimodal Vision OCR Engine (gemini-3.8-flash)             |
+---------------------------------------------------------------------------------------------------+
|  - Native zero-shot visual character extraction directly from blurry, glare-heavy, skewed images |
|  - Simultaneous parsing of multi-script identity fields: Cyrillic, Hangul, Scandinavian Latin    |
|  - ICAO Doc 9303 Machine Readable Zone (MRZ 9303) checksum decoding                              |
|  - Microprint, security hologram, and UV watermark physical integrity verification                |
|  - Strict Conditional Safety Guardrail: If Document Number, Full Name, Sex, or DOB are unreadable|
|    => Degrades confidence score < 40%, locks Auto-Merge, and triggers Manual Override form.       |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  GOOGLE AI TECHNOLOGY 2: Google Gemini Phonetic Alignment & Reasoning Engine                      |
+---------------------------------------------------------------------------------------------------+
|  - Stateless zero-shot transliteration and phonetic normalization without static lookup tables    |
|  - East Asian surname-first token permutation resolver (NFD Unicode decomposition matrix)         |
|  - Sub-word byte-pair and cosine vector embedding similarity analysis                             |
|  - Non-Latin Keyboard Input Assist: Reverse-maps Latin phonetics to native scripts               |
|    (e.g., 'Oleksandr' -> 'Олександр' or 'Kim Min-Seo' -> '김민서') for sovereign registry queries |
|  - Generates verifiable step-by-step explainable reasoning logs conforming to GDPR Article 22    |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  SOVEREIGN REGISTRY FEDERATION CORROBORATION (REG_UA_TAX, REG_SE_MIGRATION, REG_EU_VISA)         |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  🔒 OFFICIAL DELIVERABLE: eIDAS 2.0 EU WALLET GOLDEN RECORD (Canonical Enterprise JSON)          |
+---------------------------------------------------------------------------------------------------+
```

### Technology 1: Google Gemini Multimodal Vision OCR
- **Model**: `models/gemini-3.8-flash` via `@google/genai` TypeScript SDK and Python API.
- **Role**: Directly inspects identity document images (passports, national ID cards, residence permits). Extracts legal name, MRZ strings, document number, birth dates, issuing authority, and sex markers.
- **Robustness**: Handles imperfect real-world conditions (photocopy noise, security hologram glare, angled captures, low contrast, physical wear).
- **Compliance Guardrail**: Enforces **Commission Implementing Regulation (EU) 2015/1502**. If critical attributes (`documentNumber`, `rawName`, `sex`, `dobIso`) are illegible or missing, Gemini explicitly tags them as `UNREADABLE`, drops the match score below 40%, locks out automated merging, and requires human clerical intervention.

### Technology 2: Google Gemini Phonetic Alignment & Reasoning Engine
- **Model**: `models/gemini-3.8-flash` zero-shot reasoning configuration (`temperature: 0.1`).
- **Role**: Reconciles non-trivial cross-border discrepancies without hardcoded transliteration tables:
  * **Cyrillic Transliteration**: Implements ISO 9:1995 / ICAO Doc 9303 Table B-3 standards.
  * **Patronymic / Name Order Inversion**: Detects compound maternal prefixes and surname-first conventions (e.g. `Jeong, Min-Seo Kim` vs `KIM Min-Seo`).
  * **Non-Latin Keyboard Input Assist**: EU immigration caseworkers often lack Cyrillic or Korean keyboard hardware. When Latin text or MRZ strings are keyed into the Manual Override Form, Gemini uses its internal linguistic dictionary to deduce the exact native script (`'Олександр Шевченко'` or `'김민서'`) to query sovereign databases.
  * **Explainable AI (XAI)**: Generates an unalterable chronological audit trace justifying every decision step.

---

## 3. Detailed Data Schemas

### 3.1 Primary Deliverable: eIDAS 2.0 Golden Record Schema
Fiona outputs a standardized, ready-to-integrate Golden Record JSON payload for ingestion into European Digital Identity (EUDI) Wallets:

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
  "data_lineage_audit": [
    "Inbound_Immigration_Log",
    "Skatteverket_Registry"
  ]
}
```

#### Field Specifications:
| Attribute | Type | Permitted Values | Legal / Compliance Definition |
| :--- | :--- | :--- | :--- |
| `status` | `string` | `VERIFIED_GOLDEN_RECORD`<br>`FLAGGED_PENDING_CLERICAL_REVIEW`<br>`BLOCKED_INSUBSTANTIAL_DOCUMENTATION` | Current eIDAS Level of Assurance verification state. |
| `eidas_compliance_version` | `string` | `"2.0"` | Regulation (EU) 2024/1183 technical architecture specification. |
| `standardized_first_name` | `string` | Uppercase Latin (e.g. `"MIN-SEO"`) | ICAO Doc 9303 standardized given name representation. |
| `standardized_last_name` | `string` | Uppercase Latin (e.g. `"KIM"`) | ICAO Doc 9303 standardized surname/family name representation. |
| `native_script_full_name` | `string` | UTF-8 native script (e.g. `"김민서"`, `"Олександр Шевченко"`) | Sovereign root legal name in native national script. |
| `iso_date_of_birth` | `string` | `YYYY-MM-DD` (e.g. `"1994-11-23"`) | ISO 8601 standardized birth date representation. |
| `cross_border_match_confidence` | `integer` | `0` to `100` | Aggregate consensus match score across all federated sources. |
| `data_lineage_audit` | `array[string]` | Sovereign endpoints list | Cryptographic audit trail of verified sovereign attestations. |

---

### 3.2 Explainable AI (XAI) Reasoning Log Schema
To satisfy **GDPR Article 22** (prohibition against opaque automated decision-making), each reconciliation produces an unalterable reasoning log:

```text
[STEP 01: INGESTION] Ingested document scan: Korea Resident Card KR941123-1082914.
[STEP 02: TOKENIZATION] Extracted raw name tokens: ['KIM', 'Min-Seo']. Detected Korean Hangul characters '김민서'.
[STEP 03: SYNTACTIC INVERSION] Generated candidate token permutations: ['Min-Seo Kim', 'Kim, Min-Seo'].
[STEP 04: MATERNAL PREFIX DETECTION] Cross-referenced Swedish migration entry 'Jeong, Min-Seo Kim'. Detected compound familial legal structure in migration file.
[STEP 05: REGISTRY QUERY] Queried Swedish Migration Agency (REG_SE_MIGRATION) and EU Visa Information System (REG_EU_VISA).
[STEP 06: TEMPORAL MATCH] Date of birth '1994.11.23' parsed and matches exactly '1994-11-23' across Swedish and EU databases.
[STEP 07: BIOMETRIC & JACCARD DISTANCE] Token Jaccard similarity after inversion: 0.96. Sub-word byte-pair cosine similarity: 0.982.
[STEP 08: DECISION POLICY] Final aggregate score 98% exceeds confidence threshold 90%. System executes automated master link (AUTO-MERGE).
```

---

### 3.3 Federated Sovereign Registry Pipeline
Fiona queries three sovereign national and continental identity databases:

| Endpoint Key | Authority Name | Verification Function |
| :--- | :--- | :--- |
| `REG_UA_TAX` | State Tax Service of Ukraine (*Державна податкова служба*) | Validates Individual Tax Number (TIN/РНОКПП) and Cyrillic birth registry records. |
| `REG_SE_MIGRATION` | Swedish Migration Agency (*Migrationsverket* / *Skatteverket*) | Corroborates work permits, residence dossiers, and Scandinavian civil registration index. |
| `REG_EU_VISA` | European Union Visa Information System (EU VIS) | Confirms Schengen border crossings, D-Visa biometric facial landmark vectors, and travel documents. |

---

## 4. Benchmark Scenarios & Security Safeguards

| Scenario | Challenge | Gemini AI Mechanism | Score | Verdict |
| :--- | :--- | :--- | :---: | :--- |
| **Scenario 1** | Ukrainian Passport: Cyrillic `Олександр Шевченко` + `12.04.1988` | ISO 9:1995 Cyrillic transliteration & ISO 8601 temporal normalization | **98%** | **AUTO-MERGE** (Green) |
| **Scenario 2** | Korean National ID: `KIM Min-Seo (김민서)` vs `Jeong, Min-Seo Kim` | Patronymic surname inversion & matrilineal compound affix resolution | **98%** | **AUTO-MERGE** (Green) |
| **Scenario 3** | High-Collision Name Twin: `Anna Maria Andersson` born `1990-01-15` | Birthplace discrepancy detection (Stockholm vs Gothenburg) & face distance delta | **45%** | **HUMAN REVIEW** (Red) |
| **Insubstantial Document** | Damaged Credential: Document Number, Legal Name, or Sex obscured | Critical field safety guardrail drops score < 40%, blocks auto-merge | **24%** | **CRITICAL ERROR** (Red) |

---

## 5. Setup & Local Installation

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm (for full-stack TypeScript platform)
- Google Gemini API Key (`GEMINI_API_KEY`)

---

### Option A: Running the Python / Streamlit App Locally

1. **Clone the repository and navigate to root**:
   ```bash
   git clone https://github.com/your-org/fiona-identity-resolution.git
   cd fiona-identity-resolution
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Streamlit dependencies**:
   ```bash
   pip install streamlit
   ```

4. **Set your Google Gemini API key** (Optional for UI testing; built-in intelligent eIDAS fallbacks are provided):
   ```bash
   export GEMINI_API_KEY="your-google-gemini-api-key"
   ```

5. **Launch the Streamlit interactive dashboard**:
   ```bash
   streamlit run app.py
   ```
   The interactive 3-column dashboard will open at `http://localhost:8501`.

6. **Run the CLI automated verification suite**:
   ```bash
   python3 app.py
   python3 scenarios_data.py
   ```

---

### Option B: Running the Full-Stack Enterprise React / Node Platform

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env to set your GEMINI_API_KEY
   ```

3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

4. **Verify TypeScript compilation and linting**:
   ```bash
   npm run lint   # Runs tsc --noEmit
   npm run build  # Builds production bundle
   ```

---

## 6. Security, Compliance & Secret Hygiene

- **Zero Hardcoded Secrets**: All API keys are injected at runtime via environment variables (`process.env.GEMINI_API_KEY` / `os.environ["GEMINI_API_KEY"]`). No secrets, private credentials, or keys exist in version control.
- **GDPR Article 22 Compliance**: Automated consolidation is strictly halted whenever confidence scores drop below the 90% threshold, or when critical fields are degraded.
- **Cryptographic Audit Ledger**: All clerical actions (`APPROVE_MASTER_PROFILE`, `FLAG_FOR_REVIEW`, `MANUAL_CLERICAL_OVERRIDE`) are logged with authenticated operator signatures (`OFFICER_EU_7701`).
- **Sanitized Logging**: All base64 image binary payloads and raw image buffers are stripped prior to logging to ensure no biometric data leaks into server logs.

---

## 7. Project Structure

```
├── README.md                  # Comprehensive Hackathon & Architecture Documentation
├── Design.md                  # Detailed eIDAS 2.0 System Design Specification
├── metadata.json              # AI Studio Applet Configuration & Capabilities
├── package.json               # Node.js dependencies and build scripts
├── server.ts                  # Express API Server (Gemini 3.8 Flash Vision OCR & Resolver)
├── app.py                     # Python / Streamlit 3-Column Dashboard & Verification Suite
├── scenarios_data.py          # Benchmark Scenarios Repository & Safety Validators
├── index.html                 # Institutional HTML5 entry point with metadata sync
├── vite.config.ts             # Vite frontend compilation configuration
├── tsconfig.json              # Strict TypeScript compiler options
└── src/
    ├── App.tsx                # Main Dashboard Orchestrator
    ├── types/                 # eIDAS 2.0 Golden Record & System TypeScript Interfaces
    ├── components/
    │   ├── Header.tsx                 # Institutional Header with live agent status
    │   ├── ScenarioBar.tsx            # Scenario Navigation Selector Tabs
    │   ├── DocumentColumn.tsx         # Column 1: Document Ingestion, OCR & Manual Assist
    │   ├── ReconciliationColumn.tsx   # Column 2: Consensus Badge & Sovereign Registry Cards
    │   ├── ReasoningColumn.tsx        # Column 3: 🔒 EU Wallet Golden Record & XAI Log
    │   ├── GoldenRecordCard.tsx       # Primary Product Deliverable Card & JSON Export
    │   ├── ManualOverrideForm.tsx     # Non-Latin Keyboard Input Assist & Clerical Form
    │   └── AuditModal.tsx             # Immutable European Identity Ledger Inspector
    ├── data/
    │   └── scenariosData.ts   # TypeScript Benchmark Test Cases & Golden Records
    └── utils/
        ├── logger.ts                  # Sanitized Structured Logging Bus
        └── reconciliationLoop.ts      # Deterministic Normalization & Reverse-Mapping Loop
```

---

## 8. License & Acknowledgments

Engineered for the **Google AI Hackathon** in strict compliance with the European Parliament and Council **Regulation (EU) 2024/1183 (eIDAS 2.0)** and **ICAO Document 9303**.
All biometric credentials utilized in test suites are synthetically generated mock datasets designed exclusively for benchmark verification.
