export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type ThreatStatus = 'Active' | 'Quarantined' | 'Blocked' | 'Resolved';

export type ThreatCategory = 
  | 'Ransomware'
  | 'Trojan'
  | 'Spyware'
  | 'Rootkit'
  | 'Adware'
  | 'Exploit'
  | 'Phishing IP'
  | 'Zero-Day Script';

export interface ThreatItem {
  id: string;
  name: string;
  category: ThreatCategory;
  severity: SeverityLevel;
  status: ThreatStatus;
  detectedAt: string;
  fileHash: string;
  filePath: string;
  affectedHost: string;
  ipAddress?: string;
  actionTaken: string;
  description: string;
}

export type EndpointStatus = 'Online' | 'Offline' | 'Quarantined' | 'Isolated_Network';

export interface EndpointDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  os: string;
  status: EndpointStatus;
  cpuUsagePct: number;
  ramUsagePct: number;
  networkSignalActive: boolean;
  threatsDetectedCount: number;
  lastScanTime: string;
  agentVersion: string;
  location: string;
}

export type ScanType = 'Quick' | 'Deep' | 'Memory' | 'Network' | 'Custom';

export interface ScanSchedule {
  id: string;
  name: string;
  type: ScanType;
  frequency: 'Daily' | 'Weekly' | 'Custom Cron';
  cronExpr?: string;
  scheduledTime: string;
  nextRun: string;
  lastRun?: string;
  status: 'Active' | 'Paused';
  cpuPriorityLimitPct: number;
  autoQuarantine: boolean;
  targetPaths: string[];
}

export interface OptimizationCategory {
  id: string;
  name: string;
  description: string;
  freedMB: number;
  itemCount: number;
  status: 'Optimized' | 'Pending' | 'Optimizing';
  impactPct: number;
}

export interface IpFirewallRule {
  id: string;
  ipOrCidr: string;
  direction: 'Inbound' | 'Outbound' | 'Both';
  action: 'Block' | 'Allow' | 'Log Only';
  category: 'Malicious' | 'Botnet' | 'Brute Force' | 'Custom';
  originCountry: string;
  hitCount: number;
  createdAt: string;
  active: boolean;
  notes: string;
}

export interface EncryptedLogEntry {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  component: string;
  message: string;
  user: string;
  host: string;
  hashChecksum: string;
  encryptedDataHex: string;
  isTampered?: boolean;
}

export interface SiemConfig {
  enabled: boolean;
  protocol: 'Syslog (RFC 5424)' | 'CEF (Common Event Format)' | 'JSON Stream' | 'Webhook';
  endpointUrl: string;
  apiKey: string;
  batchIntervalSec: number;
  lastSyncedAt: string;
  totalForwarded: number;
  syncStatus: 'Connected' | 'Error' | 'Idle';
}

export interface NotificationSetting {
  emailAlertsEnabled: boolean;
  adminEmail: string;
  smtpHost: string;
  smtpPort: number;
  minSeverity: SeverityLevel;
  realTimeInApp: boolean;
  soundAlerts: boolean;
  webhookUrl: string;
}

export interface AdminRole {
  id: string;
  roleName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemDefault: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: 'Active' | 'Disabled';
  lastLogin: string;
  mfaEnabled: boolean;
  apiKey: string;
}

export interface AiThreatAnalysisResult {
  riskScore: number; // 0 to 100
  verdict: 'Limpio (Clean)' | 'Malicioso (Malicious)' | 'Sospechoso (Suspicious)' | 'Desconocido (Unknown)';
  threatName: string;
  category: ThreatCategory;
  technicalDetails: string;
  indicatorsOfCompromise: string[];
  recommendedActions: string[];
  analysisTimestamp: string;
}
