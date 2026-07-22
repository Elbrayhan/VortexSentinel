import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { IpFirewallRule } from '../types';

interface IpFirewallViewProps {
  rules: IpFirewallRule[];
  onAddRule: (rule: IpFirewallRule) => void;
  onToggleRuleStatus: (id: string) => void;
  onDeleteRule: (id: string) => void;
}

export const IpFirewallView: React.FC<IpFirewallViewProps> = ({
  rules,
  onAddRule,
  onToggleRuleStatus,
  onDeleteRule
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Rule Form State
  const [newIp, setNewIp] = useState<string>('');
  const [newDirection, setNewDirection] = useState<'Inbound' | 'Outbound' | 'Both'>('Inbound');
  const [newCategory, setNewCategory] = useState<'Malicious' | 'Botnet' | 'Brute Force' | 'Custom'>('Brute Force');
  const [newCountry, setNewCountry] = useState<string>('Desconocido');
  const [newNotes, setNewNotes] = useState<string>('');

  const filteredRules = rules.filter(r => 
    r.ipOrCidr.includes(searchQuery) || 
    r.originCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    try {
      const res = await fetch('/api/security/firewall/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipOrCidr: newIp,
          category: newCategory,
          notes: newNotes
        })
      });

      const data = await res.json();

      const createdRule: IpFirewallRule = {
        id: data.ruleId || `IPR-${Date.now()}`,
        ipOrCidr: newIp,
        direction: newDirection,
        action: 'Block',
        category: newCategory,
        originCountry: newCountry || 'Manual Block',
        hitCount: 1,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        active: true,
        notes: newNotes || 'Regla inyectada proactivamente en el cortafuegos externo.'
      };

      onAddRule(createdRule);
      setShowAddModal(false);
      setNewIp('');
      setNewNotes('');
    } catch (err) {
      console.error('Error adding IP firewall rule:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            Cortafuegos IP Externo Proactivo
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Mitigue accesos no autorizados, escáneres de puertos y redes de botnets bloqueando direcciones IP de origen maliciosas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Bloquear Nueva IP / Subred
        </button>
      </div>

      {/* Rules Table Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por IP, País o Nota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Reglas Activas: <span className="font-mono text-cyan-400 font-bold">{rules.filter(r => r.active).length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Dirección IP / CIDR</th>
                <th className="py-3 px-4">Dirección & Categoría</th>
                <th className="py-3 px-4">País de Origen</th>
                <th className="py-3 px-4">Paquetes Bloqueados</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No hay reglas de cortafuegos registradas.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white text-sm">{rule.ipOrCidr}</div>
                      <div className="text-[10px] text-slate-500">{rule.notes}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        {rule.direction === 'Inbound' ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{rule.direction}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{rule.category}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {rule.originCountry}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                      {rule.hitCount.toLocaleString()} paquetes
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        rule.active ? 'bg-red-950 text-red-300 border-red-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {rule.active ? 'BLOQUEADO' : 'INACTIVO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleRuleStatus(rule.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                        >
                          {rule.active ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
                          onClick={() => onDeleteRule(rule.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300"
                          title="Eliminar regla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Rule */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white">Bloquear Nueva IP o Subred Externa</h3>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Dirección IP o Rango CIDR</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 185.220.101.44 o 194.26.29.0/24"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Dirección del Tráfico</label>
                  <select
                    value={newDirection}
                    onChange={(e) => setNewDirection(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Inbound">Entrante (Inbound)</option>
                    <option value="Outbound">Saliente (Outbound)</option>
                    <option value="Both">Ambas Direcciones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Brute Force">Fuerza Bruta</option>
                    <option value="Malicious">C2 Servidor Malicioso</option>
                    <option value="Botnet">Escáner Botnet</option>
                    <option value="Custom">Personalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">País / Origen Estimado</label>
                <input
                  type="text"
                  placeholder="ej: RU (Rusia) o NL (Países Bajos)"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notas / Motivo del Bloqueo</label>
                <textarea
                  rows={2}
                  placeholder="Justificación de la regla para auditoría..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Inyectar Regla IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
