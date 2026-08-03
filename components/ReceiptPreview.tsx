'use client';

import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Check, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';
import { downloadImage } from '@/lib/utils';
import { ReceiptFields } from '@/types/receipt';

interface ReceiptPreviewProps {
  originalImage: string;
  generatedImage: string | null;
  fields: ReceiptFields;
  isMock?: boolean;
}

export function ReceiptPreview({
  originalImage,
  generatedImage,
  fields,
  isMock = false,
}: ReceiptPreviewProps) {
  const [activeTab, setActiveTab] = useState<'generated' | 'original' | 'split'>('generated');
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    if (generatedImage) {
      const filename = `comprobante-${fields.account || 'modificado'}.png`;
      downloadImage(generatedImage, filename);
    }
  };

  if (!generatedImage) return null;

  return (
    <div className="w-full rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Comprobante Generado</h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Fotorrealista
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserva la misma textura, sombras, fuente e inclinación.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'generated'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resultado IA
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'split'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comparar (Antes / Después)
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'original'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original
            </button>
          </div>

          {/* Zoom toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isZoomed ? 'Reducir zoom' : 'Ampliar zoom'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>
        </div>
      </div>

      {isMock && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Nota de Demostración:</strong> Se ha generado el comprobante en modo simulación de alta fidelidad. Configura tu <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-200">OPENAI_API_KEY</code> para conectar directamente con los servidores de OpenAI.
          </span>
        </div>
      )}

      {/* Main Image Viewer */}
      <div className="relative w-full rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[420px]">
        {activeTab === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Original */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                1. Imagen Original Base
              </span>
              <div className={`relative aspect-[3/4] w-full max-h-[450px] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center ${isZoomed ? 'scale-125 transition-transform' : ''}`}>
                <img
                  src={originalImage}
                  alt="Recibo Original"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Generated */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2. Recibo Regenerado GPT Image
              </span>
              <div className={`relative aspect-[3/4] w-full max-h-[450px] rounded-lg overflow-hidden border border-emerald-500/40 bg-slate-900 flex items-center justify-center shadow-lg shadow-emerald-500/10 ${isZoomed ? 'scale-125 transition-transform' : ''}`}>
                <img
                  src={generatedImage}
                  alt="Recibo Generado"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative w-full max-w-lg aspect-[3/4] max-h-[520px] rounded-lg overflow-hidden border border-emerald-500/30 flex items-center justify-center transition-all ${isZoomed ? 'scale-125' : ''}`}>
            <img
              src={activeTab === 'generated' ? generatedImage : originalImage}
              alt="Vista previa de recibo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Summary of modified values */}
      {fields.bankType === 'zelle' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Monto Enviado</span>
            <span className="text-sm font-bold text-purple-400 font-mono">{fields.amount}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Nombre Registrado</span>
            <span className="text-sm font-bold text-purple-400 font-sans">{fields.recipientName || 'Felipe Gonzalez'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Teléfono / Correo</span>
            <span className="text-sm font-bold text-purple-400 font-mono">{fields.contactInfo || '(407) 415-4294'}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cuenta Actualizada</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">**** {fields.account || '---'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Monto Actualizado</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{fields.amount}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Fecha Actualizada</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{fields.date || '---'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Hora Actualizada</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{fields.time || '---'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
