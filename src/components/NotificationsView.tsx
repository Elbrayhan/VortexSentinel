import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Server, 
  ShieldAlert, 
  FileCode,
  Loader2,
  X
} from 'lucide-react';
import { NotificationSetting } from '../types';

interface NotificationsProps {
  settings: NotificationSetting;
  onUpdateSettings: (newSettings: NotificationSetting) => void;
}

export const NotificationsView: React.FC<NotificationsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [adminEmail, setAdminEmail] = useState<string>(settings.adminEmail);
  const [smtpHost, setSmtpHost] = useState<string>(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState<number>(settings.smtpPort);
  const [minSeverity, setMinSeverity] = useState<NotificationSetting['minSeverity']>(settings.minSeverity);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(settings.emailAlertsEnabled);
  const [realTimeInApp, setRealTimeInApp] = useState<boolean>(settings.realTimeInApp);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(settings.soundAlerts);

  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      adminEmail,
      smtpHost,
      smtpPort,
      minSeverity,
      emailAlertsEnabled,
      realTimeInApp,
      soundAlerts
    });
    setTestResult('✅ Preferencias de notificación y alerta por correo guardadas correctamente.');
  };

  const handleTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    setEmailPreviewHtml(null);

    try {
      const res = await fetch('/api/security/send-email-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: adminEmail,
          threatName: 'WannaCry.v3.Variant.Ransomware',
          severity: 'CRITICAL',
          host: 'DESKTOP-FINANCE-01',
          actionTaken: 'Proceso finalizado & Aislamiento de archivo en bóveda cifrada',
          details: 'Prueba manual de sistema de notificación de correo lanzada por el Administrador.'
        })
      });

      const data = await res.json();
      setIsSendingTest(false);
      setTestResult(`📧 Correo de prueba enviado a ${data.recipient}. ID de mensaje: ${data.messageId}`);
      if (data.emailHtml) {
        setEmailPreviewHtml(data.emailHtml);
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setIsSendingTest(false);
      setTestResult('❌ Error enviando correo de prueba.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400" />
            Notificaciones y Reportes Automáticos por Correo
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Envío inmediato de reportes de incidentes a administradores de seguridad por correo electrónico y alertas emergentes en tiempo real en la aplicación.
          </p>
        </div>

        <button
          disabled={isSendingTest}
          onClick={handleTestEmail}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Probar Envío de Correo
        </button>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-red-800 text-red-200 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Alertas por Correo</div>
                <div className="text-[10px] text-slate-400">Notificar ataques inmediatamente</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Alertas In-App en Tiempo Real</div>
                <div className="text-[10px] text-slate-400">Mensajes emergentes en la consola</div>
              </div>
              <input
                type="checkbox"
                checked={realTimeInApp}
                onChange={(e) => setRealTimeInApp(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Sonido de Alerta de Emergencia</div>
                <div className="text-[10px] text-slate-400">Sirena acústica en amenzas críticas</div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>

          </div>

          {/* Email Settings */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-400" />
              Destinatario y Gateway SMTP
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Correo de Administradores</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Servidor SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Puerto SMTP & Severidad Mínima</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none"
                  />
                  <select
                    value={minSeverity}
                    onChange={(e) => setMinSeverity(e.target.value as any)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Critical">Solo Críticas</option>
                    <option value="High">Altas y Críticas</option>
                    <option value="Medium">Medias, Altas y Críticas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950"
            >
              Guardar Preferencias de Notificación
            </button>
          </div>

        </form>

      </div>

      {/* HTML Email Live Preview Modal */}
      {emailPreviewHtml && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-red-400" />
                Vista Previa del Mensaje HTML Generado
              </h3>
              <button onClick={() => setEmailPreviewHtml(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-800">
              <iframe 
                srcDoc={emailPreviewHtml}
                className="w-full h-80 rounded border-0"
                title="Vista previa correo"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
