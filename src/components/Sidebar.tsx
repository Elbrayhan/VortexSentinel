import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Globe, 
  Lock, 
  Share2, 
  Bell, 
  Users,
  X
} from 'lucide-react';

export type TabType = 
  | 'dashboard'
  | 'scanner'
  | 'optimizer'
  | 'killswitch'
  | 'firewall'
  | 'logs'
  | 'siem'
  | 'notifications'
  | 'rbac';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadAlertCount: number;
  isolatedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  unreadAlertCount,
  isolatedCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Panel de Control',
      icon: LayoutDashboard,
      badge: null,
      description: 'Estadísticas de amenazas e historial'
    },
    {
      id: 'scanner' as TabType,
      label: 'Escáner en Tiempo Real e IA',
      icon: ShieldCheck,
      badge: 'IA Gem',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      description: 'Escaneos programados y Sandbox de IA'
    },
    {
      id: 'optimizer' as TabType,
      label: 'Optimización de Sistema',
      icon: Zap,
      badge: 'Sin Lag',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      description: 'Liberación de RAM y CPU en 2º plano'
    },
    {
      id: 'killswitch' as TabType,
      label: 'Bloqueo de Red a Distancia',
      icon: WifiOff,
      badge: isolatedCount > 0 ? `${isolatedCount} Aislados` : null,
      badgeColor: 'bg-red-950 text-red-300 border-red-800 animate-pulse',
      description: 'Corte de señal de red en ataques'
    },
    {
      id: 'firewall' as TabType,
      label: 'Cortafuegos IP Externo',
      icon: Globe,
      badge: null,
      description: 'Bloqueo proactivo de IPs maliciosas'
    },
    {
      id: 'logs' as TabType,
      label: 'Auditoría y Logs Cifrados',
      icon: Lock,
      badge: 'AES-256',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      description: 'Bóveda de eventos con firma SHA-256'
    },
    {
      id: 'siem' as TabType,
      label: 'Integración SIEM',
      icon: Share2,
      badge: null,
      description: 'Exportación Syslog, CEF y Webhooks'
    },
    {
      id: 'notifications' as TabType,
      label: 'Notificaciones y Alertas',
      icon: Bell,
      badge: unreadAlertCount > 0 ? `${unreadAlertCount}` : null,
      badgeColor: 'bg-red-600 text-white font-bold',
      description: 'Alertas por correo e in-app'
    },
    {
      id: 'rbac' as TabType,
      label: 'Gestión de Permisos y Roles',
      icon: Users,
      badge: null,
      description: 'Control de acceso basado en roles (RBAC)'
    }
  ];

  const handleSelect = (tab: TabType) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-white text-sm">Menú de Navegación</span>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Módulos de Seguridad
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate font-normal">{item.description}</div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`ml-2 px-1.5 py-0.5 text-[9px] font-semibold rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status Box */}
        <div className="p-3 m-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Motor de Detección</span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold">100% OPERATIVO</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full rounded-full animate-pulse"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
            Escaneos programados y monitor de proceso ejecutándose sin latencia.
          </p>
        </div>
      </aside>
    </>
  );
};
