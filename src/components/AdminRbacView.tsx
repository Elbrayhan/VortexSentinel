import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  Lock, 
  Plus, 
  Check, 
  X, 
  UserPlus, 
  UserCheck, 
  Trash2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdminRole, UserAccount } from '../types';

interface AdminRbacProps {
  roles: AdminRole[];
  users: UserAccount[];
  onUpdateRolePermissions: (roleId: string, updatedPermissions: string[]) => void;
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

const ALL_PERMISSIONS = [
  { id: 'EXECUTE_REMOTE_KILL_SWITCH', name: 'Bloqueo de Red a Distancia (Kill-Switch)', group: 'Operaciones Críticas' },
  { id: 'EDIT_IP_FIREWALL', name: 'Modificar Cortafuegos IP Externe', group: 'Red' },
  { id: 'DECRYPT_EVENT_LOGS', name: 'Desencriptar Bóveda de Logs (AES-256)', group: 'Auditoría' },
  { id: 'CONFIGURE_SIEM', name: 'Configurar Transmisión SIEM', group: 'Integraciones' },
  { id: 'MANAGE_ROLES_USERS', name: 'Gestionar Usuarios y Permisos RBAC', group: 'Administración' },
  { id: 'TRIGGER_SYSTEM_SCANS', name: 'Lanzar Escaneos Manuales y Programados', group: 'Antivirus' },
  { id: 'RUN_OPTIMIZER', name: 'Ejecutar Optimización de Sistema', group: 'Rendimiento' },
  { id: 'ANALYZE_WITH_AI', name: 'Inspección de Muestras con Gemini AI', group: 'Análisis Forense' },
  { id: 'EXPORT_SIEM_DATA', name: 'Exportar Informes CEF / Syslog', group: 'Auditoría' }
];

export const AdminRbacView: React.FC<AdminRbacProps> = ({
  roles,
  users,
  onUpdateRolePermissions,
  onAddUser,
  onDeleteUser
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRoleId, setNewUserRoleId] = useState<string>(roles[0]?.id || '');

  const handleTogglePermission = (roleId: string, permId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    let updated = [...role.permissions];
    if (updated.includes(permId)) {
      updated = updated.filter(p => p !== permId);
    } else {
      updated.push(permId);
    }

    onUpdateRolePermissions(roleId, updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const selectedRole = roles.find(r => r.id === newUserRoleId);

    const createdUser: UserAccount = {
      id: `USR-${Math.floor(10 + Math.random() * 90)}`,
      name: newUserName,
      email: newUserEmail,
      roleId: newUserRoleId,
      roleName: selectedRole?.roleName || 'Analista SOC',
      status: 'Active',
      lastLogin: 'Recién creado',
      mfaEnabled: true,
      apiKey: `vtx_live_usr_key_${Math.floor(1000000000 + Math.random() * 9000000000)}`
    };

    onAddUser(createdUser);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-300" />
            Interfaz de Administración de Permisos y Roles (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión intuitiva de controles de acceso basado en roles para la consola de seguridad VortexSentinel.
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Crear Usuario Operador
        </button>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Matriz de Permisos por Rol de Seguridad
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Permiso de Operación</th>
                {roles.map(role => (
                  <th key={role.id} className="py-3 px-4 text-center">
                    <div className="font-bold text-white">{role.roleName}</div>
                    <div className="text-[9px] text-slate-500 lowercase font-mono">{role.userCount} usuarios</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {ALL_PERMISSIONS.map(perm => (
                <tr key={perm.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    <div className="font-bold text-slate-200">{perm.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{perm.id} • {perm.group}</div>
                  </td>

                  {roles.map(role => {
                    const hasPerm = role.permissions.includes(perm.id);

                    return (
                      <td key={`${role.id}-${perm.id}`} className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(role.id, perm.id)}
                          className={`p-1.5 rounded-lg transition-all inline-flex items-center justify-center ${
                            hasPerm
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-slate-950 text-slate-600 border border-slate-800 hover:bg-slate-800'
                          }`}
                          title={hasPerm ? 'Permiso concedido (Click para revocar)' : 'Permiso denegado (Click para otorgar)'}
                        >
                          {hasPerm ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 opacity-40" />}
                        </button>
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Accounts List */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          Usuarios de la Consola de Administración
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(usr => (
            <div key={usr.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{usr.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{usr.email}</p>
                </div>
                
                <button
                  onClick={() => onDeleteUser(usr.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Rol: <span className="font-bold text-cyan-400">{usr.roleName}</span></div>
                <div>Último Acceso: <span className="text-slate-300">{usr.lastLogin}</span></div>
                <div>MFA Autenticación: <span className="text-emerald-400 font-semibold">ACTIVADO (2FA)</span></div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Key: {usr.apiKey.slice(0, 16)}...</span>
                <span className="text-emerald-400 font-bold">ACTIVO</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white">Dar de Alta Nuevo Usuario Operador</h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Marta Rivas"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Correo Electrónico Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="ej: m.rivas@vortexsentinel.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rol Asignado</label>
                <select
                  value={newUserRoleId}
                  onChange={(e) => setNewUserRoleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
