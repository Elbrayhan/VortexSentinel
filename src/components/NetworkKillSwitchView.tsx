import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  Monitor, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Send,
  Zap,
  Lock
} from 'lucide-react';
import { EndpointDevice } from '../types';

interface NetworkKillSwitchProps {
  endpoints: EndpointDevice[];
  onToggleIsolation: (hostId: string) => void;
  onSimulateAttack: (hostId: string) => void;
}

export const NetworkKillSwitchView: React.FC<NetworkKillSwitchProps> = ({
  endpoints,
  onToggleIsolation,
  onSimulateAttack
}) => {
  const isolatedDevices = endpoints.filter(e => !e.networkSignalActive || e.status === 'Isolated_Network');
  const onlineDevices = endpoints.filter(e => e.networkSignalActive && e.status !== 'Isolated_Network');

  const [selectedHostForAttack, setSelectedHostForAttack] = useState<string>(endpoints[0]?.id || '');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleSimulate = () => {
    if (!selectedHostForAttack) return;
    const target = endpoints.find(e => e.id === selectedHostForAttack);
    onSimulateAttack(selectedHostForAttack);
    setActionSuccessMessage(`🚨 ¡ALERTA DE SEGURIDAD! Ataque cyber cibernético simulado en ${target?.hostname || 'Equipo'}. Se ha enviado la orden de CORTE DE SEÑAL DE RED y notificado al administrador por correo.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-950 text-red-400 border border-red-800/80 shadow-lg shadow-red-950/60">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Corte y Bloqueo de Señal de Red a Distancia
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-mono">
                  Kill-Switch Flota
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Aísle inmediatamente la interfaz de red inalámbrica y cableada de los equipos de la organización para mitigar la propagación de ransomware o exfiltración de datos.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center shrink-0">
            <div className="text-xs text-slate-400">Estado Aislamiento</div>
            <div className="text-lg font-bold font-mono text-amber-400">
              {isolatedDevices.length} / {endpoints.length} Aislados
            </div>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs flex items-center gap-3 shadow-xl">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Cyber Attack Simulation Console */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Prueba de Respuesta a Incidentes: Simulación de Ataque
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 whitespace-nowrap">Equipo de la Flota:</span>
          
          <select
            value={selectedHostForAttack}
            onChange={(e) => setSelectedHostForAttack(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.hostname} ({ep.ipAddress}) - {ep.os}
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulate}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950 flex items-center gap-2 shrink-0"
          >
            <ShieldAlert className="w-4 h-4" /> Simular Ataque & Bloquear Red
          </button>
        </div>
      </div>

      {/* Fleet Endpoints Status Grid */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          Dispositivos de Escritorio Conectados a la Red Central
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpoints.map((ep) => {
            const isIsolated = !ep.networkSignalActive || ep.status === 'Isolated_Network';

            return (
              <div 
                key={ep.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                  isIsolated
                    ? 'bg-amber-950/30 border-amber-800/80 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">{ep.hostname}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{ep.ipAddress} • {ep.macAddress}</p>
                    </div>

                    <span className={`p-2 rounded-xl border ${
                      isIsolated ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {isIsolated ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Wifi className="w-4 h-4" />}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div>Sistema: <span className="text-slate-200">{ep.os}</span></div>
                    <div>Ubicación: <span className="text-slate-300">{ep.location}</span></div>
                    <div>Amenazas Detectadas: <span className="font-mono text-amber-400 font-bold">{ep.threatsDetectedCount}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isIsolated ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isIsolated ? 'SEÑAL BLOQUEADA' : 'CONECTADO A LA RED'}
                  </span>

                  <button
                    onClick={() => onToggleIsolation(ep.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isIsolated
                        ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                        : 'bg-red-950 hover:bg-red-900 border-red-800 text-red-200'
                    }`}
                  >
                    {isIsolated ? (
                      <>
                        <Wifi className="w-3.5 h-3.5" /> Restablecer Red
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5" /> Bloquear Red
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
