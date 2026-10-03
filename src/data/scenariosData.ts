/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/data/scenariosData.ts
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Central static identity benchmark dataset powering Fiona's 3 primary scenarios:
 *
 * 1. Scenario 1 (Ukrainian Passport - Cyrillic & Date Format):
 *    - Cyrillic 'Олександр Шевченко' mapped to Latin 'Oleksandr Shevchenko'.
 *    - Regional date format '12.04.1988' harmonized to ISO 8601 '1988-04-12'.
 *    - 98% Match Confidence -> AUTO-MERGE (Green status badge).
 *    - Registries: REG_UA_TAX (Direct Match 100%), REG_SE_MIGRATION (98%), REG_EU_VISA (96%).
 *
 * 2. Scenario 2 (Korean National ID - Name Order Inversion):
 *    - Korean Hangul and East Asian surname-first tokenization 'KIM Min Su'.
 *    - Inversion resolution against Swedish work permit dossier 'Jeong, Minsu Kim'.
 *    - 94% Match Confidence -> AUTO-MERGE (Green status badge).
 *    - Registries: REG_UA_TAX (N/A Non-Resident), REG_SE_MIGRATION (95%), REG_EU_VISA (93%).
 *
 * 3. Scenario 3 (Name Twin Disambiguation - Human-in-the-Loop Safeguard):
 *    - High-frequency Swedish name 'Anna Maria Andersson' born 1990-01-15.
 *    - Spatial discrepancy: Document birthplace Stockholm vs Tax Registry Gothenburg.
 *    - 45% Match Confidence -> FLAGGED FOR HUMAN CLERICAL REVIEW (Red status badge).
 *    - Registries: REG_UA_TAX (N/A), REG_SE_MIGRATION (Conflict 48%), REG_EU_VISA (Conflict 42%).
 * ================================================================================
 */

import { ScenarioConfig, ScenarioId, PresetScenarioId } from '../types/index.ts';
import { logInfo, logWarn } from '../utils/logger.ts';

/**
 * Benchmark identity scenarios adhering strictly to eIDAS 2.0 specifications.
 */
export const SCENARIOS_DATA: Record<PresetScenarioId, ScenarioConfig> = {
  scenario_1: {
    id: 'scenario_1',
    tabLabel: 'Scenario 1: Ukrainian Passport (Cyrillic & Date Format)',
    title: 'Ukrainian Passport (Cyrillic & Date Format Normalization)',
    description:
      'Automated cross-border verification of Cyrillic script and Ukrainian regional date formatting under eIDAS 2.0 High Assurance.',
    badge: {
      label: 'AUTO-MERGE',
      score: 98,
      status: 'APPROVED',
      color: 'green',
      threshold: 90,
      eidasLoa: 'HIGH',
    },
    document: {
      type: 'Biometric International Passport',
      issuingCountry: 'Ukraine (UKR)',
      documentNumber: 'FB884920',
      rawName: 'Олександр Шевченко',
      normalizedName: 'Oleksandr Shevchenko',
      dobRaw: '12.04.1988',
      dobIso: '1988-04-12',
      placeOfBirth: 'Kyiv, Ukraine',
      sex: 'M',
      expiryDate: '2032-04-12',
      mrzLine1: 'P<UKRSHEVCHENKO<<OLEKSANDR<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'FB884920<4UKR8804128M3204124<<<<<<<<<<<<<<02',
      scanConfidence: 99.4,
      opticalCheck: 'ICAO 9303 Compliant Security Hologram Verified',
    },
    registries: {
      REG_UA_TAX: {
        id: 'REG_UA_TAX',
        name: 'State Tax Service of Ukraine (ДПС)',
        status: 'MATCHED',
        statusLabel: 'Verified Direct Match',
        matchConfidence: 100,
        recordId: 'UA-TIN-3224508911',
        registeredName: 'Шевченко Олександр Миколайович',
        registeredDob: '1988-04-12',
        statusColor: 'green',
        details: 'Taxpayer PIN verified; legal name matches Cyrillic source biometric chip.',
      },
      REG_SE_MIGRATION: {
        id: 'REG_SE_MIGRATION',
        name: 'Swedish Migration Agency (Migrationsverket)',
        status: 'MATCHED',
        statusLabel: 'Verified Residence Application',
        matchConfidence: 98,
        recordId: 'SE-MIG-2022-894102',
        registeredName: 'Oleksandr Shevchenko',
        registeredDob: '1988-04-12',
        statusColor: 'green',
        details: 'Temporary Protection Directive registration active; photo biometric vector match 0.992.',
      },
      REG_EU_VISA: {
        id: 'REG_EU_VISA',
        name: 'European Visa Information System (EU VIS)',
        status: 'MATCHED',
        statusLabel: 'Biometric Record Aligned',
        matchConfidence: 96,
        recordId: 'VIS-BXL-90812948-C',
        registeredName: 'SHEVCHENKO, OLEKSANDR',
        registeredDob: '1988-04-12',
        statusColor: 'green',
        details: 'Schengen entry biometric log confirms passport number FB884920 and facial landmarks.',
      },
    },
    reconciliation: {
      confidenceScore: 98,
      verdict: 'AUTO-MERGE',
      verdictSummary: 'Deterministic Identity Resolution Succeeded',
      color: 'green',
      scriptTransliterationStatus: 'ISO 9:1995 Exact Transliteration Match',
      dateNormalizationStatus: 'DD.MM.YYYY parsed to ISO 8601 (1988-04-12)',
      vectorSimilarity: 0.984,
      reconciliationRulesApplied: [
        'ICAO Doc 9303 Cyrillic Romanization (Table B-3)',
        'ISO 8601 Extended Temporal Format Standard',
        'Cross-border Tax Identification PIN Corroboration',
        'eIDAS 2.0 LoA High Multi-Source Consensus (3/3 registries)',
      ],
    },
    goldenRecord: {
      status: 'VERIFIED_GOLDEN_RECORD',
      eidas_compliance_version: '2.0',
      golden_record: {
        standardized_first_name: 'OLEKSANDR',
        standardized_last_name: 'SHEVCHENKO',
        native_script_full_name: 'Олександр Шевченко',
        iso_date_of_birth: '1988-04-12',
        cross_border_match_confidence: 98,
      },
      data_lineage_audit: [
        'Inbound_Immigration_Log',
        'State_Tax_Service_Ukraine_TIN',
        'Skatteverket_Registry',
        'EU_VIS_Biometric_Entry_Log',
      ],
    },
    reasoningLog: [
      '[STEP 01: INGESTION] Ingested document scan: Passport UKR FB884920.',
      '[STEP 02: SCRIPT ANALYSIS] Detected Cyrillic UTF-8 string "Олександр Шевченко".',
      '[STEP 03: TRANSLITERATION] Applied ISO 9 / ICAO Doc 9303 transliteration table: "Олександр" -> "Oleksandr", "Шевченко" -> "Shevchenko".',
      '[STEP 04: DATE HARMONIZATION] Detected regional date separator "." in "12.04.1988". Successfully normalized to ISO 8601 standard "1988-04-12".',
      '[STEP 05: REGISTRY QUERY] Dispatched parallel federated queries to REG_UA_TAX, REG_SE_MIGRATION, and REG_EU_VISA.',
      '[STEP 06: MULTI-SOURCE MATCH] REG_UA_TAX confirmed TIN 3224508911 (100%). REG_SE_MIGRATION confirmed Migrationsverket dossier 2022-894102 (98%). REG_EU_VISA verified entry record VIS-BXL-90812948-C (96%).',
      '[STEP 07: VECTOR PROXIMITY] Name embedding cosine similarity: 0.984. Biometric face vector distance: 0.04 (Well within 0.15 tolerance).',
      '[STEP 08: DECISION POLICY] Confidence score 98% exceeds threshold 90%. System executes automatic profile consolidation (AUTO-MERGE).',
    ],
  },

  scenario_2: {
    id: 'scenario_2',
    tabLabel: 'Scenario 2: Korean National ID (Name Order Inversion)',
    title: 'Korean National ID (Name Order & Inversion Resolution)',
    description:
      'Resolution of East Asian patronymic surname-first ordering against Western inverted migration dossiers.',
    badge: {
      label: 'AUTO-MERGE',
      score: 98,
      status: 'APPROVED',
      color: 'green',
      threshold: 90,
      eidasLoa: 'HIGH',
    },
    document: {
      type: 'Republic of Korea Resident Registration Card',
      issuingCountry: 'Republic of Korea (KOR)',
      documentNumber: 'KR941123-1082914',
      rawName: 'KIM Min-Seo (김민서)',
      normalizedName: 'Min-Seo Kim',
      dobRaw: '1994.11.23',
      dobIso: '1994-11-23',
      placeOfBirth: 'Seoul, South Korea',
      sex: 'M',
      expiryDate: '2034-11-23',
      mrzLine1: 'IDKORKIM<<MIN<SEO<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: '9411231M3411234KOR<<<<<<<<<<<<<<8',
      scanConfidence: 98.7,
      opticalCheck: 'Korean Ministry of the Interior Security Watermark Verified',
    },
    registries: {
      REG_UA_TAX: {
        id: 'REG_UA_TAX',
        name: 'State Tax Service of Ukraine (ДПС)',
        status: 'NOT_APPLICABLE',
        statusLabel: 'No Record (Non-Resident)',
        matchConfidence: 0,
        recordId: 'N/A',
        registeredName: 'No prior tax filing',
        registeredDob: 'N/A',
        statusColor: 'neutral',
        details: 'Jurisdiction non-resident; no historical income or temporary tax registration found.',
      },
      REG_SE_MIGRATION: {
        id: 'REG_SE_MIGRATION',
        name: 'Swedish Migration Agency (Migrationsverket)',
        status: 'MATCHED',
        statusLabel: 'Work Permit Record Located',
        matchConfidence: 98,
        recordId: 'SE-MIG-2023-441098',
        registeredName: 'Jeong, Min-Seo Kim',
        registeredDob: '1994-11-23',
        statusColor: 'green',
        details: 'ICT Specialist work permit dossier; surname registered as dual maternal/family name "Jeong, Min-Seo Kim".',
      },
      REG_EU_VISA: {
        id: 'REG_EU_VISA',
        name: 'European Visa Information System (EU VIS)',
        status: 'MATCHED',
        statusLabel: 'D-Visa Biometrics Aligned',
        matchConfidence: 96,
        recordId: 'VIS-ARN-88201944-K',
        registeredName: 'KIM, MIN-SEO',
        registeredDob: '1994-11-23',
        statusColor: 'green',
        details: 'Stockholm Arlanda border authority registration confirms match with passport photo and iris token.',
      },
    },
    reconciliation: {
      confidenceScore: 98,
      verdict: 'AUTO-MERGE',
      verdictSummary: 'Name Order Inversion Resolved With High Assurance',
      color: 'green',
      scriptTransliterationStatus: 'Revised Romanization of Korean (RR) Validated',
      dateNormalizationStatus: 'Period notation YYYY.MM.DD normalized to ISO 8601 (1994-11-23)',
      vectorSimilarity: 0.982,
      reconciliationRulesApplied: [
        'East Asian Name Token Permutation Matrix (Surname-First / Given-First)',
        'Korean Family Census Bureau Token Alignment (Jeong / Kim matrilineal affix)',
        'ISO 8601 Extended Temporal Format Standard',
        'Consensus validation across SE_MIGRATION and EU_VIS',
      ],
    },
    goldenRecord: {
      status: 'VERIFIED_GOLDEN_RECORD',
      eidas_compliance_version: '2.0',
      golden_record: {
        standardized_first_name: 'MIN-SEO',
        standardized_last_name: 'KIM',
        native_script_full_name: '김민서',
        iso_date_of_birth: '1994-11-23',
        cross_border_match_confidence: 98,
      },
      data_lineage_audit: ['Inbound_Immigration_Log', 'Skatteverket_Registry'],
    },
    reasoningLog: [
      '[STEP 01: INGESTION] Ingested document scan: Korea Resident Card KR941123-1082914.',
      '[STEP 02: TOKENIZATION] Extracted raw name tokens: ["KIM", "Min-Seo"]. Detected Korean Hangul characters "김민서".',
      '[STEP 03: SYNTACTIC INVERSION] Generated candidate token permutations: ["Min-Seo Kim", "Kim, Min-Seo"].',
      '[STEP 04: MATERNAL PREFIX DETECTION] Cross-referenced Swedish migration entry "Jeong, Min-Seo Kim". Detected compound familial legal structure in migration file.',
      '[STEP 05: REGISTRY QUERY] Queried Swedish Migration Agency (REG_SE_MIGRATION) and EU Visa Information System (REG_EU_VISA).',
      '[STEP 06: TEMPORAL MATCH] Date of birth "1994.11.23" parsed and matches exactly "1994-11-23" across Swedish and EU databases.',
      '[STEP 07: BIOMETRIC & JACCARD DISTANCE] Token Jaccard similarity after inversion: 0.96. Sub-word byte-pair cosine similarity: 0.982.',
      '[STEP 08: DECISION POLICY] Final aggregate score 98% exceeds confidence threshold 90%. System executes automated master link (AUTO-MERGE).',
    ],
  },

  scenario_3: {
    id: 'scenario_3',
    tabLabel: 'Scenario 3: Name Twin Disambiguation (Human-in-the-Loop Safeguard)',
    title: 'Name Twin Disambiguation (High Collision Safeguard)',
    description:
      'Human-in-the-loop protection resolving a high-collision name twin sharing identical birth dates but opposing birthplaces.',
    badge: {
      label: 'FLAGGED FOR HUMAN CLERICAL REVIEW',
      score: 45,
      status: 'FLAGGED',
      color: 'red',
      threshold: 90,
      eidasLoa: 'SUBSTANTIAL_ONLY',
    },
    document: {
      type: 'Swedish National ID Card (Nationellt identitetskort)',
      issuingCountry: 'Sweden (SWE)',
      documentNumber: 'SE900115-4019',
      rawName: 'Anna Maria Andersson',
      normalizedName: 'Anna Maria Andersson',
      dobRaw: '1990-01-15',
      dobIso: '1990-01-15',
      placeOfBirth: 'Stockholm, Sweden',
      sex: 'F',
      expiryDate: '2029-01-15',
      mrzLine1: 'IDSE9001154019<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: '9001154F2901158SWE<<<<<<<<<<<<<<4',
      scanConfidence: 99.8,
      opticalCheck: 'Swedish Police Authority Microprint & Chip Authenticated',
    },
    registries: {
      REG_UA_TAX: {
        id: 'REG_UA_TAX',
        name: 'State Tax Service of Ukraine (ДПС)',
        status: 'NOT_APPLICABLE',
        statusLabel: 'No Record',
        matchConfidence: 0,
        recordId: 'N/A',
        registeredName: 'No jurisdiction entry',
        registeredDob: 'N/A',
        statusColor: 'neutral',
        details: 'No activity recorded in non-EU eastern cross-registry.',
      },
      REG_SE_MIGRATION: {
        id: 'REG_SE_MIGRATION',
        name: 'Swedish Tax Agency Civil Register (Skatteverket / Folkbokföring)',
        status: 'CONFLICT',
        statusLabel: 'Homonym Collision Detected',
        matchConfidence: 48,
        recordId: 'SE-SKATT-19900115-9921',
        registeredName: 'Anna Maria Andersson',
        registeredDob: '1990-01-15',
        statusColor: 'red',
        details: 'Registered birthplace: "Gothenburg" (Göteborg), Sweden. Contradicts document birthplace "Stockholm".',
      },
      REG_EU_VISA: {
        id: 'REG_EU_VISA',
        name: 'European Visa Information System (EU VIS)',
        status: 'CONFLICT',
        statusLabel: 'Discrepancy In Biometrics',
        matchConfidence: 42,
        recordId: 'VIS-CPH-77401928-S',
        registeredName: 'ANDERSSON, ANNA MARIA',
        registeredDob: '1990-01-15',
        statusColor: 'red',
        details: 'Biometric face landmark distance: 0.48 (Exceeds acceptable threshold of 0.15). Suspected distinct individual.',
      },
    },
    reconciliation: {
      confidenceScore: 45,
      verdict: 'FLAGGED FOR HUMAN CLERICAL REVIEW',
      verdictSummary: 'Spatial & Biometric Contradiction - Human Intercession Mandated',
      color: 'red',
      scriptTransliterationStatus: 'Latin Direct Verification (No Script Discrepancy)',
      dateNormalizationStatus: 'ISO 8601 Date Matched Exactly (1990-01-15)',
      vectorSimilarity: 0.45,
      reconciliationRulesApplied: [
        'Swedish Skatteverket Population Register Pinpointing',
        'Geographic Spatial Consistency Verification (Stockholm vs Gothenburg)',
        'Biometric Distance Exclusion Test (> 0.15 Euclidean threshold)',
        'eIDAS 2.0 Article 22 Prohibition on Unsupervised Automated Rejection',
      ],
    },
    goldenRecord: {
      status: 'FLAGGED_PENDING_CLERICAL_REVIEW',
      eidas_compliance_version: '2.0',
      golden_record: {
        standardized_first_name: 'ANNA MARIA',
        standardized_last_name: 'ANDERSSON',
        native_script_full_name: 'Anna Maria Andersson',
        iso_date_of_birth: '1990-01-15',
        cross_border_match_confidence: 45,
      },
      data_lineage_audit: [
        'Inbound_Immigration_Log',
        'Skatteverket_Folkbokföring_Registry',
        'EU_VIS_Biometric_Entry_Log',
      ],
    },
    reasoningLog: [
      '[STEP 01: INGESTION] Ingested document scan: Swedish National ID SE900115-4019.',
      '[STEP 02: PHONETIC COLLISION CHECK] Candidate name "Anna Maria Andersson" is ranked in top 0.05% frequency collision pool in Sweden.',
      '[STEP 03: TEMPORAL CORRELATION] Date of birth "1990-01-15" matches multiple records in Swedish population registry (Folkbokföringsregistret).',
      '[STEP 04: SPATIAL VALIDATION CONFLICT] Document claims place of birth "Stockholm, Sweden", whereas civil registry entry SE-SKATT-19900115-9921 records birthplace as "Gothenburg, Sweden" (Distance delta: 470 km).',
      '[STEP 05: BIOMETRIC COMPARISON] Facial landmark comparison against VIS-CPH-77401928-S yields Euclidean distance of 0.48 (Permissible threshold is <= 0.15).',
      '[STEP 06: MULTI-ENTITY RISK] Probability of homonymic entity confusion: 91.2%. High risk of fraudulent identity consolidation.',
      '[STEP 07: DECISION POLICY] Confidence score is 45% (Well below the 90% automated threshold).',
      '[STEP 08: SAFEGUARD ACTIVATION] Automated merge immediately halted. Profile escalated to Human Clerical Review queue with audit tag "HOMONYM_DISAMBIGUATION_REQUIRED".',
    ],
  },
};

/**
 * Retrieves a scenario configuration object by its unique ID.
 * Logs an INFO event with retrieved parameters.
 *
 * @param scenarioId - The target ScenarioId ('scenario_1', 'scenario_2', or 'scenario_3').
 * @returns The associated ScenarioConfig object.
 */
export function getScenario(scenarioId: ScenarioId): ScenarioConfig {
  logInfo('ScenariosData', 'getScenario', `Fetching configuration for ${scenarioId}`, {
    scenarioId,
  });

  const scenario = (SCENARIOS_DATA as Record<string, ScenarioConfig>)[scenarioId];
  if (!scenario) {
    logWarn('ScenariosData', 'getScenario', `Unknown scenarioId requested: ${scenarioId}`, {
      scenarioId,
    });
    return SCENARIOS_DATA.scenario_1;
  }

  return scenario;
}
