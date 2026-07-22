import { 
  ThreatItem, 
  EndpointDevice, 
  ScanSchedule, 
  OptimizationCategory, 
  IpFirewallRule, 
  EncryptedLogEntry, 
  SiemConfig, 
  NotificationSetting, 
  AdminRole, 
  UserAccount 
} from '../types';
import { generateSimpleHash, simulateAes256Encrypt } from '../utils/cryptoUtils';

export const INITIAL_THREATS: ThreatItem[] = [
  {
    id: 'THR-8902',
    name: 'WannaCry.v3.Variant.Ransomware',
    category: 'Ransomware',
    severity: 'Critical',
    status: 'Quarantined',
    detectedAt: '2026-07-22 08:42:10',
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    filePath: 'C:\\Users\\Admin\\Downloads\\invoice_doc_pdf.exe',
    affectedHost: 'DESKTOP-FINANCE-01',
    ipAddress: '192.168.1.104',
    actionTaken: 'Proceso terminado & Fichero aislado en Vault cifrado',
    description: 'Intento de cifrado masivo de volúmenes SMB mediante exploit EternalBlue.'
  },
  {
    id: 'THR-8901',
    name: 'CobaltStrike.Beacon.Injector',
    category: 'Trojan',
    severity: 'Critical',
    status: 'Blocked',
    detectedAt: '2026-07-22 07:15:33',
    fileHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284ddd200126d9069b',
    filePath: 'C:\\Windows\\Temp\\rundll32_host.dll',
    affectedHost: 'WS-EXECUTIVE-03',
    ipAddress: '185.220.101.44',
    actionTaken: 'Bloqueo de señal de red & Inyección de DLL interceptada',
    description: 'Inyección de código malicioso en memoria del proceso rundll32.exe.'
  },
  {
    id: 'THR-8898',
    name: 'Spyware.Keylogger.AgentTesla',
    category: 'Spyware',
    severity: 'High',
    status: 'Quarantined',
    detectedAt: '2026-07-21 22:11:05',
    fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    filePath: '/usr/local/bin/sys_analytics_daemon',
    affectedHost: 'SRV-ANALYTICS-DEV',
    ipAddress: '10.0.4.18',
    actionTaken: 'Proceso detenido & Eliminado de la secuencia de inicio',
    description: 'Exfiltración de credenciales del portapapeles y pulsaciones de teclado.'
  },
  {
    id: 'THR-8895',
    name: 'PowerShell.ZeroDay.ObfuscatedPayload',
    category: 'Zero-Day Script',
    severity: 'High',
    status: 'Resolved',
    detectedAt: '2026-07-21 18:04:19',
    fileHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    filePath: 'C:\\Scripts\\ps_update_policy.ps1',
    affectedHost: 'DESKTOP-HR-02',
    ipAddress: '192.168.1.112',
    actionTaken: 'Análisis IA completado & Regla AMSI creada',
    description: 'Script PowerShell ofuscado con codificación Base64 ejecutando reflejo de ensamblado.'
  },
  {
    id: 'THR-8890',
    name: 'BruteForce.SSH.Scanner.IpBlock',
    category: 'Phishing IP',
    severity: 'Medium',
    status: 'Blocked',
    detectedAt: '2026-07-21 14:30:00',
    fileHash: 'N/A (Acceso de Red)',
    filePath: 'Puertos TCP 22 & 443',
    affectedHost: 'GATEWAY-FIREWALL-MAIN',
    ipAddress: '194.26.29.112',
    actionTaken: 'Dirección IP bloqueada en cortafuegos externo por 72 horas',
    description: 'Más de 450 intentos fallidos de autenticación SSH en menos de 60 segundos.'
  }
];

export const INITIAL_ENDPOINTS: EndpointDevice[] = [
  {
    id: 'EP-01',
    hostname: 'DESKTOP-FINANCE-01',
    ipAddress: '192.168.1.104',
    macAddress: '00:1A:2B:3C:4D:5E',
    os: 'Windows 11 Enterprise (23H2)',
    status: 'Online',
    cpuUsagePct: 2.1,
    ramUsagePct: 38.5,
    networkSignalActive: true,
    threatsDetectedCount: 1,
    lastScanTime: '2026-07-22 08:45',
    agentVersion: '2.6.4-LTS',
    location: 'Sede Madrid - Planta 3'
  },
  {
    id: 'EP-02',
    hostname: 'WS-EXECUTIVE-03',
    ipAddress: '192.168.1.108',
    macAddress: '00:1A:2B:99:88:77',
    os: 'Windows 11 Pro',
    status: 'Isolated_Network',
    cpuUsagePct: 1.4,
    ramUsagePct: 42.0,
    networkSignalActive: false, // Disconnected via kill switch!
    threatsDetectedCount: 1,
    lastScanTime: '2026-07-22 07:20',
    agentVersion: '2.6.4-LTS',
    location: 'Sede Barcelona - Despacho 12'
  },
  {
    id: 'EP-03',
    hostname: 'DEV-MACBOOK-PRO-07',
    ipAddress: '192.168.2.45',
    macAddress: 'A4:83:E7:11:22:33',
    os: 'macOS Sequoia 15.1',
    status: 'Online',
    cpuUsagePct: 0.8,
    ramUsagePct: 29.1,
    networkSignalActive: true,
    threatsDetectedCount: 0,
    lastScanTime: '2026-07-22 06:00',
    agentVersion: '2.6.4-LTS',
    location: 'Trabajo Remoto - VPN ES'
  },
  {
    id: 'EP-04',
    hostname: 'SRV-ANALYTICS-DEV',
    ipAddress: '10.0.4.18',
    macAddress: '52:54:00:12:34:56',
    os: 'Ubuntu Linux 24.04 LTS',
    status: 'Online',
    cpuUsagePct: 3.5,
    ramUsagePct: 51.2,
    networkSignalActive: true,
    threatsDetectedCount: 1,
    lastScanTime: '2026-07-21 22:15',
    agentVersion: '2.6.4-LTS',
    location: 'Data Center - Rack B-04'
  },
  {
    id: 'EP-05',
    hostname: 'DESKTOP-HR-02',
    ipAddress: '192.168.1.112',
    macAddress: '70:85:C2:AB:CD:EF',
    os: 'Windows 10 Enterprise',
    status: 'Online',
    cpuUsagePct: 1.1,
    ramUsagePct: 34.0,
    networkSignalActive: true,
    threatsDetectedCount: 0,
    lastScanTime: '2026-07-21 18:10',
    agentVersion: '2.6.4-LTS',
    location: 'Sede Madrid - Planta 2'
  }
];

export const INITIAL_SCHEDULES: ScanSchedule[] = [
  {
    id: 'SCH-01',
    name: 'Escaneo Rápido Diario de Memoria y Bootloader',
    type: 'Quick',
    frequency: 'Daily',
    scheduledTime: '08:00 AM',
    nextRun: '2026-07-23 08:00',
    lastRun: '2026-07-22 08:00',
    status: 'Active',
    cpuPriorityLimitPct: 5, // Ensures zero lag (<5% CPU)
    autoQuarantine: true,
    targetPaths: ['C:\\Windows\\System32\\drivers', 'RAM', 'StartupRegistry']
  },
  {
    id: 'SCH-02',
    name: 'Análisis Profundo Semanal de Almacenamiento',
    type: 'Deep',
    frequency: 'Weekly',
    cronExpr: '0 2 * * 0',
    scheduledTime: 'Domingos 02:00 AM',
    nextRun: '2026-07-26 02:00',
    lastRun: '2026-07-19 02:00',
    status: 'Active',
    cpuPriorityLimitPct: 10,
    autoQuarantine: true,
    targetPaths: ['C:\\', 'D:\\DataVault', '/var/log']
  },
  {
    id: 'SCH-03',
    name: 'Auditoría de Puertos y Tráfico de Red Externo',
    type: 'Network',
    frequency: 'Daily',
    scheduledTime: 'Cada 4 Horas',
    nextRun: '2026-07-22 12:00',
    lastRun: '2026-07-22 08:00',
    status: 'Active',
    cpuPriorityLimitPct: 2,
    autoQuarantine: false,
    targetPaths: ['Sockets TCP/UDP', 'Tabla ARP', 'Reglas IPTables/WinFirewall']
  }
];

export const INITIAL_OPTIMIZATIONS: OptimizationCategory[] = [
  {
    id: 'OPT-01',
    name: 'Defragmentación Inteligente de RAM',
    description: 'Libera páginas de memoria no utilizadas por procesos en segundo plano pasivos.',
    freedMB: 1840,
    itemCount: 42,
    status: 'Optimized',
    impactPct: 18
  },
  {
    id: 'OPT-02',
    name: 'Ajuste de Prioridad de CPU sin Latencia',
    description: 'Prioriza aplicaciones activas del usuario frente a servicios de telemetría.',
    freedMB: 0,
    itemCount: 15,
    status: 'Optimized',
    impactPct: 12
  },
  {
    id: 'OPT-03',
    name: 'Limpieza de Archivos Temporales y Caché',
    description: 'Elimina volcados de memoria viejos, logs temporales y cachés de actualización.',
    freedMB: 6420,
    itemCount: 1250,
    status: 'Pending',
    impactPct: 25
  },
  {
    id: 'OPT-04',
    name: 'Optimización de Arranque de Sistema',
    description: 'Desactiva aplicaciones de inicio innecesarias reduciendo tiempo de booteo.',
    freedMB: 350,
    itemCount: 8,
    status: 'Pending',
    impactPct: 15
  }
];

export const INITIAL_FIREWALL_RULES: IpFirewallRule[] = [
  {
    id: 'IPR-101',
    ipOrCidr: '194.26.29.0/24',
    direction: 'Inbound',
    action: 'Block',
    category: 'Brute Force',
    originCountry: 'RU (Rusia)',
    hitCount: 4890,
    createdAt: '2026-07-21 14:35',
    active: true,
    notes: 'Subred bloqueada automáticamente tras ataques SSH reiterados.'
  },
  {
    id: 'IPR-102',
    ipOrCidr: '185.220.101.44',
    direction: 'Both',
    action: 'Block',
    category: 'Malicious',
    originCountry: 'NL (Países Bajos)',
    hitCount: 1204,
    createdAt: '2026-07-22 07:16',
    active: true,
    notes: 'Nodo de salida Tor detectado como centro C2 de CobaltStrike.'
  },
  {
    id: 'IPR-103',
    ipOrCidr: '45.142.120.0/22',
    direction: 'Inbound',
    action: 'Block',
    category: 'Botnet',
    originCountry: 'RO (Rumanía)',
    hitCount: 842,
    createdAt: '2026-07-20 11:20',
    active: true,
    notes: 'Escáner de vulnerabilidades de puertos Mirai variant.'
  },
  {
    id: 'IPR-104',
    ipOrCidr: '203.0.113.88',
    direction: 'Outbound',
    action: 'Block',
    category: 'Custom',
    originCountry: 'CN (China)',
    hitCount: 310,
    createdAt: '2026-07-19 09:12',
    active: true,
    notes: 'Destino de exfiltración no autorizado identificado en análisis de laboratorio.'
  }
];

export const INITIAL_ENCRYPTED_LOGS: EncryptedLogEntry[] = [
  {
    id: 'LOG-9001',
    timestamp: '2026-07-22 08:42:10',
    severity: 'Critical',
    component: 'AntiMalwareCore',
    message: 'Aislamiento de amenza WannaCry en DESKTOP-FINANCE-01 por hash match.',
    user: 'SYSTEM_WATCHDOG',
    host: 'DESKTOP-FINANCE-01',
    hashChecksum: generateSimpleHash('LOG-9001::AntiMalwareCore::WannaCry'),
    encryptedDataHex: simulateAes256Encrypt('Ransomware isolated in secure vault C:\\Users\\Admin\\Downloads\\invoice.exe')
  },
  {
    id: 'LOG-9000',
    timestamp: '2026-07-22 07:20:00',
    severity: 'Critical',
    component: 'NetworkKillSwitch',
    message: 'Bloqueo de señal de red activado a distancia para el equipo WS-EXECUTIVE-03.',
    user: 'admin_security@vortexsentinel.io',
    host: 'WS-EXECUTIVE-03',
    hashChecksum: generateSimpleHash('LOG-9000::NetworkKillSwitch::WS-EXECUTIVE-03'),
    encryptedDataHex: simulateAes256Encrypt('Network isolation trigger command executed remotely for host WS-EXECUTIVE-03')
  },
  {
    id: 'LOG-8999',
    timestamp: '2026-07-22 07:15:33',
    severity: 'High',
    component: 'IpFirewallEngine',
    message: 'Bloqueo proactivo de IP externa 185.220.101.44 (C2 Server match).',
    user: 'FIREWALL_AUTONOMOUS',
    host: 'GATEWAY-FIREWALL-MAIN',
    hashChecksum: generateSimpleHash('LOG-8999::IpFirewallEngine::185.220.101.44'),
    encryptedDataHex: simulateAes256Encrypt('IP rule injected to drop packets from 185.220.101.44')
  },
  {
    id: 'LOG-8998',
    timestamp: '2026-07-21 22:15:00',
    severity: 'Medium',
    component: 'SystemOptimizer',
    message: 'Optimización de segundo plano ejecutada: 1,840 MB de RAM liberados sin afectación de CPU.',
    user: 'CRON_SCHEDULER',
    host: 'SRV-ANALYTICS-DEV',
    hashChecksum: generateSimpleHash('LOG-8998::SystemOptimizer::RAM_Defrag'),
    encryptedDataHex: simulateAes256Encrypt('System RAM defragmented successfully. CPU overhead 0.4%')
  },
  {
    id: 'LOG-8997',
    timestamp: '2026-07-21 18:04:19',
    severity: 'Info',
    component: 'AiInspector',
    message: 'Análisis de script PowerShell mediante Gemini AI completado. Clasificación: Sospechoso.',
    user: 'admin_security@vortexsentinel.io',
    host: 'DESKTOP-HR-02',
    hashChecksum: generateSimpleHash('LOG-8997::AiInspector::PowerShell'),
    encryptedDataHex: simulateAes256Encrypt('Gemini AI analyzed file ps_update_policy.ps1 with score 78/100')
  }
];

export const INITIAL_SIEM_CONFIG: SiemConfig = {
  enabled: true,
  protocol: 'CEF (Common Event Format)',
  endpointUrl: 'https://siem-collector.vortexsentinel.internal:514/events',
  apiKey: 'vtx_siem_sec_token_992184102931',
  batchIntervalSec: 30,
  lastSyncedAt: '2026-07-22 08:45:00',
  totalForwarded: 14290,
  syncStatus: 'Connected'
};

export const INITIAL_NOTIFICATIONS: NotificationSetting = {
  emailAlertsEnabled: true,
  adminEmail: 'security-admin@vortexsentinel.io',
  smtpHost: 'smtp.vortexsentinel.io',
  smtpPort: 587,
  minSeverity: 'High',
  realTimeInApp: true,
  soundAlerts: true,
  webhookUrl: 'https://hooks.vortexsentinel.io/alerts/sec-team'
};

export const INITIAL_ROLES: AdminRole[] = [
  {
    id: 'ROLE-SUPER',
    roleName: 'Super Administrador de Seguridad',
    description: 'Control total de la plataforma, kill-switch remoto, edición de cortafuegos y gestión de usuarios.',
    permissions: [
      'EXECUTE_REMOTE_KILL_SWITCH',
      'EDIT_IP_FIREWALL',
      'DECRYPT_EVENT_LOGS',
      'CONFIGURE_SIEM',
      'MANAGE_ROLES_USERS',
      'TRIGGER_SYSTEM_SCANS',
      'RUN_OPTIMIZER'
    ],
    userCount: 2,
    isSystemDefault: true
  },
  {
    id: 'ROLE-ANALYST',
    roleName: 'Analista SOC Tier 2',
    description: 'Análisis de amenazas, investigación con IA, ejecución de escaneos y aislamiento de archivos.',
    permissions: [
      'VIEW_ENCRYPTED_LOGS',
      'TRIGGER_SYSTEM_SCANS',
      'ANALYZE_WITH_AI',
      'QUARANTINE_THREATS',
      'RUN_OPTIMIZER'
    ],
    userCount: 4,
    isSystemDefault: true
  },
  {
    id: 'ROLE-AUDITOR',
    roleName: 'Auditor de Cumplimiento / SIEM',
    description: 'Acceso de solo lectura a logs cifrados, informes de auditoría y estados de SIEM.',
    permissions: [
      'VIEW_ENCRYPTED_LOGS',
      'EXPORT_SIEM_DATA',
      'VERIFY_LOG_INTEGRITY'
    ],
    userCount: 1,
    isSystemDefault: true
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    name: 'Carlos Mendoza',
    email: 'security-admin@vortexsentinel.io',
    roleId: 'ROLE-SUPER',
    roleName: 'Super Administrador de Seguridad',
    status: 'Active',
    lastLogin: '2026-07-22 08:30',
    mfaEnabled: true,
    apiKey: 'vtx_live_usr_key_9918231023'
  },
  {
    id: 'USR-02',
    name: 'Lucía Fernández',
    email: 'l.fernandez@vortexsentinel.io',
    roleId: 'ROLE-ANALYST',
    roleName: 'Analista SOC Tier 2',
    status: 'Active',
    lastLogin: '2026-07-22 07:10',
    mfaEnabled: true,
    apiKey: 'vtx_live_usr_key_4412983109'
  },
  {
    id: 'USR-03',
    name: 'Auditor Externo ISO27001',
    email: 'audit@cybersecurity-cert.org',
    roleId: 'ROLE-AUDITOR',
    roleName: 'Auditor de Cumplimiento / SIEM',
    status: 'Active',
    lastLogin: '2026-07-21 16:45',
    mfaEnabled: true,
    apiKey: 'vtx_live_usr_key_1102938472'
  }
];
