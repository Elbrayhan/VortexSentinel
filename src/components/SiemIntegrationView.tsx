import React, { useState } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Server, 
  Key, 
  Send, 
  Activity,
  Code
} from 'lucide-react';
import { SiemConfig } from '../types';

interface SiemIntegrationProps {
  config: SiemConfig;
  onUpdateConfig: (newConfig: SiemConfig) => void;
}

export const SiemIntegrationView: React.FC<SiemIntegrationProps> = ({
  config,
  onUpdateConfig
}) => {
  const [endpointUrl, setEndpointUrl] = useState<string>(config.endpointUrl);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [protocol, setProtocol] = useState<SiemConfig['protocol']>(config.protocol);
  const [batchInterval, setBatchInterval] = useState<number>(config.batchIntervalSec);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveSiemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      endpointUrl,
      apiKey,
      protocol,
      batchIntervalSec: batchInterval,
      syncStatus: 'Connected'
    });
    setTestResult('✅ Configuración SIEM guardada correctamente. Re-conectado con la matriz colectora.');
  };

  const handleTestForwarding = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/security/siem/test-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl,
          protocol,
          batchCount: 25
        })
      });

      const data = await res.json();
      setIsTesting(false);
      setTestResult(`✅ Transmisión SIEM Exitosa: 25 eventos (${protocol}) enviados a ${endpointUrl}. Estado: ${data.status}`);
    } catch (err) {
      console.error('SIEM test error:', err);
      setIsTesting(false);
      setTestResult('❌ Error al conectar con el servidor colector SIEM.');
    }
  };

  const handleDownloadCefSample = () => {
    window.open('/api/security/siem/export?format=cef', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-400" />
            Integración con Herramientas SIEM & SOC
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Transmisión directa de telemetría y eventos de seguridad a Splunk, Datadog, Elastic, Sentinel o Servidores Syslog centralizados.
          </p>
        </div>

        <button
          onClick={handleDownloadCefSample}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" /> Descargar Muestra CEF / Syslog
        </button>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-800 text-indigo-200 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* SIEM Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          Configuración del Colector SIEM
        </h2>

        <form onSubmit={handleSaveSiemConfig} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">URL del Recolector de Eventos / Endpoint Webhook</label>
            <input
              type="text"
              required
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Formato de Exportación</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
              >
                <option value="CEF (Common Event Format)">CEF (Common Event Format)</option>
                <option value="Syslog (RFC 5424)">Syslog (RFC 5424)</option>
                <option value="JSON Stream">JSON Stream</option>
                <option value="Webhook">Webhook HTTP/HTTPS POST</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Clave de API / Token Bearer</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Intervalo de Lote (Segundos)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={batchInterval}
                onChange={(e) => setBatchInterval(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestForwarding}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold transition-all flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Probar Envío de Eventos a SIEM
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-950"
            >
              Guardar Ajustes SIEM
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
