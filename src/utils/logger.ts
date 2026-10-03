/**
 * ================================================================================
 * Fiona - Cross-Border Identity Resolution Portal
 * Module: src/utils/logger.ts
 * ================================================================================
 * FEATURE DESCRIPTION & USE CASES:
 * Enterprise logging and telemetry system for the Fiona Identity Resolution Engine.
 * Logs all system events, function invocations, scenario cascades, document scans,
 * and external API calls as INFO entries formatted for compliance auditing.
 * Automatically sanitizes sensitive raw binary data and base64 strings to ensure
 * clean and GDPR-compliant log output.
 * ================================================================================
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  module: string;
  functionName: string;
  message: string;
  payload?: Record<string, unknown>;
}

// In-memory operational log ring buffer for audit and developer inspectability
const operationalLogBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER_SIZE = 250;
const logSubscribers: Array<(entry: LogEntry) => void> = [];

/**
 * Sanitizes an object by removing or truncating raw image bytes, base64 data,
 * and high-entropy biometric byte arrays.
 *
 * @param obj - The input data structure to sanitize.
 * @returns A clean object safe for persistent logging.
 */
export function sanitizeLogPayload(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') || obj.length > 500) {
      return `[TRUNCATED_BINARY_DATA: len=${obj.length}]`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogPayload(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('bytes') ||
        key.toLowerCase().includes('base64')
      ) {
        cleaned[key] = '[SANITIZED_RAW_IMAGE_DATA]';
      } else {
        cleaned[key] = sanitizeLogPayload(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Logs an informational event with module context, function name, and optional payload.
 *
 * @param module - The originating module name (e.g., 'DocumentIngestion', 'ReconciliationEngine').
 * @param functionName - The function being executed.
 * @param message - Descriptive human-readable log message.
 * @param payload - Optional structured parameters or outputs (will be sanitized).
 */
export function logInfo(
  module: string,
  functionName: string,
  message: string,
  payload?: Record<string, unknown>
): void {
  const sanitizedPayload = payload
    ? (sanitizeLogPayload(payload) as Record<string, unknown>)
    : undefined;

  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module,
    functionName,
    message,
    payload: sanitizedPayload,
  };

  operationalLogBuffer.push(entry);
  if (operationalLogBuffer.length > MAX_LOG_BUFFER_SIZE) {
    operationalLogBuffer.shift();
  }

  // Structured console log for container aggregators
  console.info(
    `%c[INFO]%c [${entry.timestamp}] [${module}::${functionName}] ${message}`,
    'color: #38bdf8; font-weight: bold;',
    'color: #94a3b8;',
    sanitizedPayload || ''
  );

  // Notify active UI subscribers
  logSubscribers.forEach((sub) => sub(entry));
}

/**
 * Logs a warning event when an anomaly or confidence deficit is encountered.
 *
 * @param module - The originating module name.
 * @param functionName - The function being executed.
 * @param message - Warning description.
 * @param payload - Supplementary context.
 */
export function logWarn(
  module: string,
  functionName: string,
  message: string,
  payload?: Record<string, unknown>
): void {
  const sanitizedPayload = payload
    ? (sanitizeLogPayload(payload) as Record<string, unknown>)
    : undefined;

  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level: 'WARN',
    module,
    functionName,
    message,
    payload: sanitizedPayload,
  };

  operationalLogBuffer.push(entry);
  console.warn(
    `%c[WARN]%c [${entry.timestamp}] [${module}::${functionName}] ${message}`,
    'color: #f59e0b; font-weight: bold;',
    'color: #94a3b8;',
    sanitizedPayload || ''
  );

  logSubscribers.forEach((sub) => sub(entry));
}

/**
 * Logs an error event when a process fails or validation check fails critically.
 *
 * @param module - The originating module name.
 * @param functionName - The function being executed.
 * @param message - Error description.
 * @param error - Error object or explanation.
 */
export function logError(
  module: string,
  functionName: string,
  message: string,
  error?: unknown
): void {
  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    module,
    functionName,
    message,
    payload: error ? { error: String(error) } : undefined,
  };

  operationalLogBuffer.push(entry);
  console.error(
    `%c[ERROR]%c [${entry.timestamp}] [${module}::${functionName}] ${message}`,
    'color: #ef4444; font-weight: bold;',
    'color: #94a3b8;',
    error || ''
  );

  logSubscribers.forEach((sub) => sub(entry));
}

/**
 * Subscribes a listener callback to live log emissions.
 *
 * @param callback - Function invoked on each log event.
 * @returns Unsubscribe clean-up function.
 */
export function subscribeToLogs(callback: (entry: LogEntry) => void): () => void {
  logSubscribers.push(callback);
  return () => {
    const idx = logSubscribers.indexOf(callback);
    if (idx !== -1) {
      logSubscribers.splice(idx, 1);
    }
  };
}

/**
 * Retrieves the current operational log history.
 *
 * @returns Array of recent log entries.
 */
export function getRecentLogs(): LogEntry[] {
  return [...operationalLogBuffer];
}
