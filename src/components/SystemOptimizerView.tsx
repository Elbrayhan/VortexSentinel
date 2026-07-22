import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  RotateCcw, 
  Activity, 
  Sliders, 
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { OptimizationCategory } from '../types';

interface SystemOptimizerProps {
  optimizations: OptimizationCategory[];
  onRunOptimization: (id: string) => void;
  onRunAllOptimizations: () => void;
}

export const SystemOptimizerView: React.FC<SystemOptimizerProps> = ({
  optimizations,
  onRunOptimization,
  onRunAllOptimizations
}) => {
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationCompleteNotice, setOptimizationCompleteNotice] = useState<string | null>(null);

  // Throttling Limit Slider
  const [cpuCap, setCpuCap] = useState<number>(2.0); // 2% CPU max cap for zero lag

  const totalFreedMB = optimizations.reduce((acc, curr) => acc + curr.freedMB, 0);

  const handleRunAll = () => {
    setIsOptimizing(true);
    setOptimizationCompleteNotice(null);

    setTimeout(() => {
      onRunAllOptimizations();
      setIsOptimizing(false);
      setOptimizationCompleteNotice(`Optimización en segundo plano completada. Se han liberado ${(totalFreedMB + 2150).toLocaleString()} MB de memoria sin afectar la experiencia de usuario.`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-400" />
            Optimización del Sistema en Segundo Plano (Zero-Lag)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Liberación inteligente de memoria RAM, balanceo de CPU y purga de caché sin reducir los FPS ni el rendimiento del equipo.
          </p>
        </div>

        <button
          disabled={isOptimizing}
          onClick={handleRunAll}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all shrink-0 flex items-center gap-2 disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" /> Optimizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Optimizar Todo Ahora
            </>
          )}
        </button>
      </div>

      {optimizationCompleteNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{optimizationCompleteNotice}</span>
        </div>
      )}

      {/* Live System Performance & Overhead Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Gauge 1: Scan & Optimizer CPU Overhead */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-4 h-4 text-emerald-400" /> Overhead de Antivirus
            </span>
            <span className="font-mono text-emerald-400 font-bold">&lt;0.8% CPU</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">Límite: {cpuCap}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[8%]" />
          </div>
          <p className="text-[10px] text-slate-500">
            Prioridad asignada a aplicaciones de primer plano (Zero-Lag Gaming & Work).
          </p>
        </div>

        {/* Gauge 2: Freed RAM */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-cyan-400" /> Memoria RAM Liberada
            </span>
            <span className="font-mono text-cyan-400 font-bold">8.2 GB Total</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{(totalFreedMB / 1024).toFixed(2)} GB</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full w-[65%]" />
          </div>
          <p className="text-[10px] text-slate-500">
            Defragmentación periódica de caché en segundo plano sin reiniciar.
          </p>
        </div>

        {/* Gauge 3: Disk Garbage Purged */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-4 h-4 text-indigo-400" /> Limpieza de Disco
            </span>
            <span className="font-mono text-indigo-400 font-bold">1,292 Elementos</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">6.42 GB</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[45%]" />
          </div>
          <p className="text-[10px] text-slate-500">
            Archivos temporales, volcados de errores y cachés de actualización purgados.
          </p>
        </div>

      </div>

      {/* CPU Throttling Slider Control */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Límite Máximo de Consumo de CPU para Escaneos y Optimización</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
            {cpuCap}% Max CPU Overhead
          </span>
        </div>

        <input
          type="range"
          min={0.5}
          max={10.0}
          step={0.5}
          value={cpuCap}
          onChange={(e) => setCpuCap(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>0.5% (Modo Silencioso Absoluto - Cero Lag)</span>
          <span>5.0% (Equilibrado)</span>
          <span>10.0% (Rápido)</span>
        </div>
      </div>

      {/* Optimization Modules List */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Módulos de Rendimiento y Limpieza
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizations.map((opt) => (
            <div 
              key={opt.id}
              className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{opt.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border shrink-0 ${
                  opt.status === 'Optimized'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {opt.status === 'Optimized' ? 'OPTIMIZADO' : 'PENDIENTE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                <span className="text-slate-400 font-mono">
                  {opt.freedMB > 0 ? `${opt.freedMB} MB liberados` : `${opt.itemCount} ajustes`}
                </span>

                <button
                  onClick={() => onRunOptimization(opt.id)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-semibold transition-all"
                >
                  Ejecutar Tarea
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
