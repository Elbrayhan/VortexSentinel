import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { ControlDashboard } from './components/ControlDashboard';
import { RealtimeScannerView } from './components/RealtimeScannerView';
import { SystemOptimizerView } from './components/SystemOptimizerView';
import { NetworkKillSwitchView } from './components/NetworkKillSwitchView';
import { IpFirewallView } from './components/IpFirewallView';
import { EncryptedLogsView } from './components/EncryptedLogsView';
import { SiemIntegrationView } from './components/SiemIntegrationView';
import { NotificationsView } from './components/NotificationsView';
import { AdminRbacView } from './components/AdminRbacView';

import { 
  INITIAL_THREATS, 
  INITIAL_ENDPOINTS, 
  INITIAL_SCHEDULES, 
  INITIAL_OPTIMIZATIONS, 
  INITIAL_FIREWALL_RULES, 
  INITIAL_ENCRYPTED_LOGS, 
  INITIAL_SIEM_CONFIG, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ROLES, 
  INITIAL_USERS 
} from './data/mockSecurityData';

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
} from './types';

import { generateSimpleHash, simulateAes256Encrypt } from './utils/cryptoUtils';
import { Sparkles, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // State
  const [threats, setThreats] = useState<ThreatItem[]>(INITIAL_THREATS);
  const [endpoints, setEndpoints] = useState<EndpointDevice[]>(INITIAL_ENDPOINTS);
  const [schedules, setSchedules] = useState<ScanSchedule[]>(INITIAL_SCHEDULES);
  const [optimizations, setOptimizations] = useState<OptimizationCategory[]>(INITIAL_OPTIMIZATIONS);
  const [firewallRules, setFirewallRules] = useState<IpFirewallRule[]>(INITIAL_FIREWALL_RULES);
  const [logs, setLogs] = useState<EncryptedLogEntry[]>(INITIAL_ENCRYPTED_LOGS);
  const [siemConfig, setSiemConfig] = useState<SiemConfig>(INITIAL_SIEM_CONFIG);
  const [notifications, setNotifications] = useState<NotificationSetting>(INITIAL_NOTIFICATIONS);
  const [roles, setRoles] = useState<AdminRole[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);
  const [selectedAiThreat, setSelectedAiThreat] = useState<ThreatItem | null>(null);

  // Active Role Name
  const currentUser = users[0];
  const activeRoleName = currentUser?.roleName || 'Super Administrador';

  // Handler: Toggle Endpoint Network Signal (Remote Kill Switch)
  const handleToggleEndpointIsolation = async (hostId: string) => {
    const target = endpoints.find(e => e.id === hostId);
    if (!target) return;

    const willBeIsolated = target.networkSignalActive;

    try {
      await fetch('/api/security/toggle-kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId,
          hostname: target.hostname,
          isolated: willBeIsolated
        })
      });

      // Update state
      setEndpoints(prev => prev.map(ep => {
        if (ep.id === hostId) {
          return {
            ...ep,
            networkSignalActive: !willBeIsolated,
            status: willBeIsolated ? 'Isolated_Network' : 'Online'
          };
        }
        return ep;
      }));

      // Add encrypted log entry
      const newLog: EncryptedLogEntry = {
        id: `LOG-KS-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        severity: 'Critical',
        component: 'NetworkKillSwitch',
        message: `Señal de red ${willBeIsolated ? 'aislada' : 'restablecida'} a distancia para ${target.hostname}`,
        user: currentUser.email,
        host: target.hostname,
        hashChecksum: generateSimpleHash(`LOG-KS-${Date.now()}::${target.hostname}`),
        encryptedDataHex: simulateAes256Encrypt(`Network kill switch toggled for host ${target.hostname}`)
      };

      setLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.error('Error toggling network kill switch:', err);
    }
  };

  // Handler: Simulate Ransomware Attack on device
  const handleSimulateAttack = async (hostId: string) => {
    const target = endpoints.find(e => e.id === hostId);
    if (!target) return;

    // Isolate target host
    handleToggleEndpointIsolation(hostId);

    // Create new threat item
    const newThreat: ThreatItem = {
      id: `THR-${Math.floor(8000 + Math.random() * 1000)}`,
      name: 'Ransomware.LockBit.v4.SimulatedPayload',
      category: 'Ransomware',
      severity: 'Critical',
      status: 'Quarantined',
      detectedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fileHash: 'f4a81c2298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      filePath: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\lockbit_payload.exe',
      affectedHost: target.hostname,
      ipAddress: target.ipAddress,
      actionTaken: 'Corte de Señal de Red Activado a Distancia & Proceso Interceptado',
      description: 'Detección de comportamiento agresivo de cifrado de volúmenes. Aislamiento preventivo ejecutado.'
    };

    setThreats(prev => [newThreat, ...prev]);
    setUnreadAlertCount(prev => prev + 1);

    // Automatically dispatch email alert
    try {
      await fetch('/api/security/send-email-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: notifications.adminEmail,
          threatName: newThreat.name,
          severity: 'CRITICAL',
          host: target.hostname,
          actionTaken: newThreat.actionTaken,
          details: 'Incidente crítico interceptado por la matriz de protección VortexSentinel.'
        })
      });
    } catch (err) {
      console.error('Error sending alert email:', err);
    }
  };

  // Optimization Handlers
  const handleRunOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, status: 'Optimized', freedMB: opt.freedMB + 520 };
      }
      return opt;
    }));
  };

  const handleRunAllOptimizations = () => {
    setOptimizations(prev => prev.map(opt => ({
      ...opt,
      status: 'Optimized',
      freedMB: opt.freedMB + 800
    })));
  };

  // Firewall Rule Handlers
  const handleAddFirewallRule = (rule: IpFirewallRule) => {
    setFirewallRules(prev => [rule, ...prev]);
  };

  const handleToggleFirewallRuleStatus = (id: string) => {
    setFirewallRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteFirewallRule = (id: string) => {
    setFirewallRules(prev => prev.filter(r => r.id !== id));
  };

  // Schedule Handlers
  const handleAddSchedule = (sch: ScanSchedule) => {
    setSchedules(prev => [sch, ...prev]);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleScheduleStatus = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s));
  };

  // Role Permissions Handler
  const handleUpdateRolePermissions = (roleId: string, permissions: string[]) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
  };

  // User Handlers
  const handleAddUser = (user: UserAccount) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const isolatedCount = endpoints.filter(e => !e.networkSignalActive || e.status === 'Isolated_Network').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      
      {/* Header Bar */}
      <Header
        endpoints={endpoints}
        unreadAlertCount={unreadAlertCount}
        activeRoleName={activeRoleName}
        onOpenMobileMenu={() => setIsOpenMobile(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
        onOpenKillSwitchView={() => setActiveTab('killswitch')}
        currentUserEmail={currentUser.email}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
          unreadAlertCount={unreadAlertCount}
          isolatedCount={isolatedCount}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <ControlDashboard
              threats={threats}
              endpoints={endpoints}
              firewallRules={firewallRules}
              onOpenAiAnalyze={(t) => setSelectedAiThreat(t)}
              onToggleEndpointIsolation={handleToggleEndpointIsolation}
              onNavigateToScan={() => setActiveTab('scanner')}
              onNavigateToOptimizer={() => setActiveTab('optimizer')}
              onNavigateToKillSwitch={() => setActiveTab('killswitch')}
            />
          )}

          {activeTab === 'scanner' && (
            <RealtimeScannerView
              schedules={schedules}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onToggleScheduleStatus={handleToggleScheduleStatus}
              onThreatDetectedFromScan={(t) => setThreats(prev => [t, ...prev])}
            />
          )}

          {activeTab === 'optimizer' && (
            <SystemOptimizerView
              optimizations={optimizations}
              onRunOptimization={handleRunOptimization}
              onRunAllOptimizations={handleRunAllOptimizations}
            />
          )}

          {activeTab === 'killswitch' && (
            <NetworkKillSwitchView
              endpoints={endpoints}
              onToggleIsolation={handleToggleEndpointIsolation}
              onSimulateAttack={handleSimulateAttack}
            />
          )}

          {activeTab === 'firewall' && (
            <IpFirewallView
              rules={firewallRules}
              onAddRule={handleAddFirewallRule}
              onToggleRuleStatus={handleToggleFirewallRuleStatus}
              onDeleteRule={handleDeleteFirewallRule}
            />
          )}

          {activeTab === 'logs' && (
            <EncryptedLogsView logs={logs} />
          )}

          {activeTab === 'siem' && (
            <SiemIntegrationView
              config={siemConfig}
              onUpdateConfig={(c) => setSiemConfig(c)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              settings={notifications}
              onUpdateSettings={(s) => setNotifications(s)}
            />
          )}

          {activeTab === 'rbac' && (
            <AdminRbacView
              roles={roles}
              users={users}
              onUpdateRolePermissions={handleUpdateRolePermissions}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>

      </div>

      {/* AI Analysis Quick Modal from Dashboard */}
      {selectedAiThreat && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Análisis de Amenaza - {selectedAiThreat.name}</h3>
              </div>
              <button onClick={() => setSelectedAiThreat(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
                <div>Hash SHA256: <span className="text-cyan-400">{selectedAiThreat.fileHash}</span></div>
                <div>Ruta: <span className="text-slate-300">{selectedAiThreat.filePath}</span></div>
                <div>Host: <span className="text-slate-300">{selectedAiThreat.affectedHost} ({selectedAiThreat.ipAddress})</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/60 text-slate-300 leading-relaxed">
                {selectedAiThreat.description}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAiThreat(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
