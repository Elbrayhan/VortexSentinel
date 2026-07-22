import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Monitor, 
  WifiOff, 
  Activity, 
  Clock, 
  Sparkles, 
  Lock, 
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ThreatItem, EndpointDevice, IpFirewallRule } from '../types';

interface ControlDashboardProps {
  threats: ThreatItem[];
  endpoints: EndpointDevice[];
  firewallRules: IpFirewallRule[];
  onOpenAiAnalyze: (threat: ThreatItem) => void;
  onToggleEndpointIsolation: (hostId: string) => void;
  onNavigateToScan: () => void;
  onNavigateToOptimizer: () => void;
  onNavigateToKillSwitch: () => void;
}

const WEEKLY_THREAT_TREND = [
  { day: 'Lun', bloqueadas: 142, ransomware: 12, ceroDay: 4 },
  { day: 'Mar', bloqueadas: 189, ransomware: 18, ceroDay: 7 },
  { day: 'Mié', bloqueadas: 240, ransomware: 25, ceroDay: 11 },
  { day: 'Jue', bloqueadas: 175, ransomware: 14, ceroDay: 5 },
  { day: 'Vie', bloqueadas: 310, ransomware: 41, ceroDay: 19 },
  { day: 'Sáb', bloqueadas: 120, ransomware: 8, ceroDay: 2 },
  { day: 'Dom', bloqueadas: 306, ransomware: 38, ceroDay: 15 },
];

const CATEGORY_DISTRIBUTION = [
  { category: 'Ransomware', count: 48, color: '#ef4444' },
  { category: 'Trojan', count: 35, color: '#f97316' },
  { category: 'Zero-Day', count: 22, color: '#a855f7' },
  { category: 'Spyware', count: 18, color: '#3b82f6' },
  { category: 'Exploit/IP', count: 29, color: '#06b6d4' },
];

export const ControlDashboard: React.FC<ControlDashboardProps> = ({
  threats,
  endpoints,
  firewallRules,
  onOpenAiAnalyze,
  onToggleEndpointIsolation,
  onNavigateToScan,
  onNavigateToOptimizer,
  onNavigateToKillSwitch
}) => {
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('All');

  const totalThreatsBlocked = 1482;
  const quarantinedCount = threats.filter(t => t.status === 'Quarantined').length;
  const blockedIpsCount = firewallRules.filter(f => f.active).length;
  const isolatedEndpoints = endpoints.filter(e => !e.networkSignalActive || e.status === 'Isolated_Network');

  const filteredThreats = threats.filter(t => {
    if (selectedSeverityFilter === 'All') return true;
    return t.severity === selectedSeverityFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Panel de Control de Amenazas y Seguridad
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs border border-emerald-800 font-normal">
              Tiempo Real Activo
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Protección de escritorio en segundo plano optimizada sin reducción de rendimiento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToScan}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all"
          >
            <FileSearch className="w-4 h-4" />
            Iniciar Escaneo
          </button>

          <button
            onClick={onNavigateToOptimizer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Activity className="w-4 h-4" />
            Optimizar RAM / CPU
          </button>
        </div>
      </div>

      {/* Isolation Fleet Warning Banner if any host is isolated */}
      {isolatedEndpoints.length > 0 && (
        <div className="bg-amber-950/80 border border-amber-700/80 rounded-2xl p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-900/90 text-amber-300">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Corte de Señal de Red Activado a Distancia ({isolatedEndpoints.length} Equipo/s)
              </div>
              <div className="text-xs text-amber-300/80">
                Los equipos seleccionados están completamente aisldados de la red local e internet para evitar la propagación de malware.
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToKillSwitch}
            className="px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5"
          >
            Gestionar Aislamiento <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Detailed Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Threats Blocked */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Amenazas Bloqueadas</span>
            <div className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-900/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalThreatsBlocked}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>+142 bloqueadas hoy sin latencia</span>
          </div>
        </div>

        {/* Card 2: Quarantined Files */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Archivos en Cuarentena</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-900/60">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{quarantinedCount}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Almacenamiento Cifrado AES-256</span>
            <span className="text-amber-400 font-mono">100% aislado</span>
          </div>
        </div>

        {/* Card 3: External Blocked IPs */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">IPs Externas Bloqueadas</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-900/60">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{blockedIpsCount}</div>
          <div className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reglas de Cortafuegos Proactivo</span>
          </div>
        </div>

        {/* Card 4: Connected Fleet Endpoints */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Flota de Escritorio</span>
            <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-900/60">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{endpoints.length} <span className="text-xs font-normal text-slate-400">Equipos</span></div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{endpoints.length - isolatedEndpoints.length} Conectados</span>
            <span className="text-amber-400 font-semibold">{isolatedEndpoints.length} Aislados</span>
          </div>
        </div>

      </div>

      {/* Recharts Graphical Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart: Threat Detection Timeline */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Histórico de Amenazas e Intercepciones (Semanal)
              </h2>
              <p className="text-xs text-slate-400">Tendencia de ataques de ransomware, scripts zero-day y troyanos detectados.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Bloqueadas
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Ransomware
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_THREAT_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBloqueadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRansomware" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="bloqueadas" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorBloqueadas)" name="Total Bloqueadas" />
                <Area type="monotone" dataKey="ransomware" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRansomware)" name="Ataques Ransomware" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Categorías de Amenazas Interceptadas
            </h2>
            <p className="text-xs text-slate-400">Distribución por tipo de payload malicioso.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DISTRIBUTION} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Incidentes">
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Real-time Threat Intelligence Feed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Registro de Amenazas en Tiempo Real
            </h2>
            <p className="text-xs text-slate-400">Histórico de detecciones y acciones de remediación ejecutadas.</p>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Critical', 'High', 'Medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedSeverityFilter === sev
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'All' ? 'Todas' : sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Amenaza & ID</th>
                <th className="py-3 px-4">Severidad</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Equipo Afectado</th>
                <th className="py-3 px-4">Acción Autónoma</th>
                <th className="py-3 px-4 text-right">Acciones Manuales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No hay amenazas registradas con el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => {
                  const targetHost = endpoints.find(e => e.hostname === threat.affectedHost);
                  const isHostIsolated = targetHost ? !targetHost.networkSignalActive : false;

                  return (
                    <tr key={threat.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-mono">{threat.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{threat.id}</span>
                          <span>•</span>
                          <span>{threat.detectedAt}</span>
                        </div>
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                          threat.severity === 'Critical'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : threat.severity === 'High'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}>
                          {threat.severity}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {threat.category}
                      </td>

                      {/* Affected Host */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{threat.affectedHost}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{threat.ipAddress || '192.168.1.X'}</div>
                      </td>

                      {/* Action Taken */}
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          {threat.actionTaken}
                        </span>
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Gemini AI Inspector Trigger */}
                          <button
                            onClick={() => onOpenAiAnalyze(threat)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-[11px] font-medium transition-all flex items-center gap-1"
                            title="Analizar amenaza con Gemini AI"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            Análisis IA
                          </button>

                          {/* Individual Isolation Trigger */}
                          {targetHost && (
                            <button
                              onClick={() => onToggleEndpointIsolation(targetHost.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 border ${
                                isHostIsolated
                                  ? 'bg-emerald-950 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                                  : 'bg-red-950 border-red-800 text-red-300 hover:bg-red-900'
                              }`}
                              title={isHostIsolated ? 'Restablecer señal de red' : 'Aislar señal de red inmediatamente'}
                            >
                              <WifiOff className="w-3 h-3" />
                              {isHostIsolated ? 'Reconectar' : 'Aislar Red'}
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
