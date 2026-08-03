'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils';

interface ReceiptUploaderProps {
  onImageSelected: (base64Image: string) => void;
  selectedImage: string | null;
  onClearImage: () => void;
  isAnalyzing?: boolean;
}

export function ReceiptUploader({
  onImageSelected,
  selectedImage,
  onClearImage,
  isAnalyzing = false,
}: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        onImageSelected(base64);
      } catch (err) {
        console.error('Error al leer el archivo:', err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        onImageSelected(base64);
      } catch (err) {
        console.error('Error al procesar archivo soltado:', err);
      }
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {selectedImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900/60 p-4 backdrop-blur-md transition-all shadow-xl">
          <div className="relative aspect-[3/4] max-h-[380px] w-full mx-auto rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Image Preview */}
            <img
              src={selectedImage}
              alt="Recibo original"
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />

            {/* Analyzing scanner overlay effect */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="w-full absolute h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-lg shadow-emerald-400/50"></div>
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-sm font-semibold text-emerald-300">
                  Analizando recibo con GPT Vision...
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Imagen de referencia cargada</span>
            </div>
            <button
              onClick={onClearImage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cambiar imagen</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Subir imagen de recibo bancario
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Arrastra y suelta tu comprobante aquí o haz clic para explorar tus archivos.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-2">
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md">PNG</span>
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md">JPG / JPEG</span>
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md">WEBP</span>
          </div>

          <button
            type="button"
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            Seleccionar archivo
          </button>
        </div>
      )}
    </div>
  );
}
