// Utility functions for cryptographic log verification and formatting

export function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  // Combine with deterministic pseudo SHA-256 hex string for display
  return `sha256_${positiveHash}${Math.abs(hash * 31).toString(16).padStart(8, '0')}`;
}

export function simulateAes256Encrypt(text: string, secretKey: string = 'vortex_master_key_2026'): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += charCode.toString(16).padStart(2, '0');
  }
  return `AES256::${result.toUpperCase()}`;
}

export function formatAsCefLog(log: {
  id: string;
  timestamp: string;
  severity: string;
  component: string;
  message: string;
  host: string;
}): string {
  const sevNum = log.severity === 'Critical' ? 10 : log.severity === 'High' ? 8 : log.severity === 'Medium' ? 5 : 2;
  return `CEF:0|VortexSentinel|MalwareShield|2.6.0|${log.component}|${log.message}|${sevNum}|rt=${log.timestamp} dhost=${log.host} logId=${log.id}`;
}

export function formatAsSyslog(log: {
  id: string;
  timestamp: string;
  severity: string;
  component: string;
  message: string;
  host: string;
}): string {
  const prio = log.severity === 'Critical' ? '<131>' : '<134>';
  return `${prio}1 ${log.timestamp} ${log.host} VortexSentinel - ${log.id} [${log.component}] ${log.message}`;
}
