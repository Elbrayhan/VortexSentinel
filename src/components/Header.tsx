import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Wifi, 
  WifiOff, 
  Bell, 
  User, 
  Menu, 
  Cpu,
  Lock
} from 'lucide-react';
import { EndpointDevice } from '../types';

interface HeaderProps {
  endpoints: EndpointDevice[];
  unreadAlertCount: number;
  activeRoleName: string;
  onOpenMobileMenu: () => void;
  onOpenNotifications: () => void;
  onOpenKillSwitchView: () => void;
  currentUserEmail: string;
}

export const Header: React.FC<HeaderProps> = ({
  endpoints,
  unreadAlertCount,
  activeRoleName,
  onOpenMobileMenu,
  onOpenNotifications,
  onOpenKillSwitchView,
  currentUserEmail
}) => {
  const isolatedDevices = endpoints.filter(e => !e.networkSignalActive || e.status === 'Isolated_Network');
  const totalFleet = endpoints.length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left branding & mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Abrir Menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">Vortex<span className="text-cyan-400">Sentinel</span></span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded-full">
                  Enterprise v2.6
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Protección Antivirus & Aislamiento en Tiempo Real
              </p>
            </div>
          </div>
        </div>

        {/* Center status indicators */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-1.5">
          {/* Watchdog status */}
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-200">Defensa Activa</span>
          </div>

          {/* CPU Overhead Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 border-r border-slate-800 pr-3.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Impacto CPU:</span>
            <span className="font-mono font-semibold text-emerald-400">0.8%</span>
            <span className="text-[10px] text-slate-500">(Sin Lag)</span>
          </div>

          {/* Fleet Network Status & Remote Isolation Count */}
          <button 
            onClick={onOpenKillSwitchView}
            className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              isolatedDevices.length > 0
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60'
                : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {isolatedDevices.length > 0 ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isolatedDevices.length} Equipo(s) Aislado(s)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Red Flota: {totalFleet} Equipos Conectados</span>
              </>
            )}
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency Kill-Switch Shortcut */}
          <button
            onClick={onOpenKillSwitchView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-700/70 hover:bg-red-900 text-red-200 text-xs font-bold transition-all shadow-md shadow-red-950/50"
            title="Activar Bloqueo de Red a Distancia para Equipos Bajo Ataque"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">CORTE DE RED</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors"
            title="Notificaciones y Alertas"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Active User Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-medium text-slate-200 truncate max-w-[120px] lg:max-w-[160px]">
                {currentUserEmail.split('@')[0]}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                {activeRoleName}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
