'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  isGenerating: boolean;
}

const STAGES = [
  { id: 1, label: 'Enviando fotografía base a GPT Image...', duration: 2000 },
  { id: 2, label: 'Conservando perspectiva, iluminación y textura...', duration: 3500 },
  { id: 3, label: 'Modificando únicamente los 4 datos indicados...', duration: 3000 },
  { id: 4, label: 'Sintetizando fotografía fotorrealista de cámara...', duration: 2500 },
];

export function ProgressBar({ isGenerating }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setCurrentStageIndex(0);
      return;
    }

    // Progress animation loop
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const next = prev + 1;
        if (next > 25 && currentStageIndex === 0) setCurrentStageIndex(1);
        if (next > 55 && currentStageIndex === 1) setCurrentStageIndex(2);
        if (next > 80 && currentStageIndex === 2) setCurrentStageIndex(3);
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isGenerating, currentStageIndex]);

  if (!isGenerating) return null;

  return (
    <div className="w-full rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Procesando con GPT Image</span>
              <span className="text-xs text-emerald-400 font-normal">({progress}%)</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 animate-pulse">
              {STAGES[currentStageIndex]?.label}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-300 shadow-md shadow-emerald-400/30"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <div
              key={stage.id}
              className={`p-2 rounded-lg border text-[11px] font-medium transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-slate-800 border-emerald-400 text-white animate-pulse'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                )}
                <span className="truncate">Paso {stage.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
