'use client';

import React from 'react';
import { Sparkles, Image as ImageIcon, ShieldCheck, KeyRound } from 'lucide-react';

interface HeaderProps {
  hasApiKey?: boolean;
}

export function Header({ hasApiKey = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                GPT Receipt <span className="text-emerald-400">Studio</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                GPT Image v2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Generador de Comprobantes Bancarios Fotorrealistas con IA
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Preserva textura & sombras</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              hasApiKey
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{hasApiKey ? 'OpenAI API Activa' : 'Modo Demostración / Fallback'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
