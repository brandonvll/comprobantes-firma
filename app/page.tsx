'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ReceiptUploader } from '@/components/ReceiptUploader';
import { ReceiptForm } from '@/components/ReceiptForm';
import { ProgressBar } from '@/components/ProgressBar';
import { ReceiptPreview } from '@/components/ReceiptPreview';
import { BankPresets } from '@/components/BankPresets';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { ReceiptFields, PresetReceipt } from '@/types/receipt';
import { Sparkles, ShieldCheck, Zap, Image as ImageIcon, Info } from 'lucide-react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMockResult, setIsMockResult] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Form Fields State
  const [fields, setFields] = useState<ReceiptFields>({
    bankType: 'chase',
    account: '2274',
    amount: '$3,000.00',
    date: '07/25/2026',
    time: '11:02 AM',
  });

  // Toasts Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check if API key environment variable is populated on client load
  useEffect(() => {
    setHasApiKey(false); // Updated dynamically upon first API call response
  }, []);

  // Handle when image is selected or dropped
  const handleImageSelected = async (base64Image: string) => {
    setSelectedImage(base64Image);
    setGeneratedImage(null);
    addToast('info', 'Imagen cargada correctamente', 'Iniciando auto-detección de campos con GPT Vision...');

    // Trigger auto-analysis automatically upon upload
    await runVisionAnalysis(base64Image);
  };

  // Trigger GPT-4o Vision auto-detect
  const runVisionAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await res.json();
      if (data.success && data.fields) {
        setFields(data.fields);
        const details = data.fields.bankType === 'zelle'
          ? `Zelle detectado: Monto (${data.fields.amount}), Nombre (${data.fields.recipientName}), Contacto (${data.fields.contactInfo}).`
          : `Campos: Cuenta (**** ${data.fields.account || '---'}), Monto (${data.fields.amount}), Fecha (${data.fields.date || '---'}), Hora (${data.fields.time || '---'}).`;
        addToast('success', '¡Campos detectados con IA!', details);
      } else {
        addToast('info', 'Formulario listo', 'Puedes ajustar los valores manualmente.');
      }
    } catch (err) {
      console.error('Error auto-detecting vision:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldChange = (field: keyof ReceiptFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankTypeChange = (newBankType: 'chase' | 'bofa' | 'zelle' | 'general') => {
    setFields((prev) => {
      if (newBankType === 'zelle') {
        return {
          ...prev,
          bankType: 'zelle',
          amount: prev.amount || '$125.00',
          recipientName: prev.recipientName || 'Felipe Gonzalez',
          contactInfo: prev.contactInfo || '(407) 415-4294',
        };
      }
      return {
        ...prev,
        bankType: newBankType,
        account: prev.account || '2274',
        amount: prev.amount || '$1,250.00',
        date: prev.date || '08/07/2026',
        time: prev.time || '03:45 PM',
      };
    });
  };

  const handlePresetSelect = (preset: PresetReceipt) => {
    setSelectedImage(preset.imageUrl);
    setGeneratedImage(null);
    setFields(preset.fields);
    addToast('info', `Cargado comprobante de ${preset.bank}`, 'Valores iniciales listos para modificar.');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
  };

  // Submit handler to consume GPT Image API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      addToast('error', 'Imagen requerida', 'Debes subir un recibo de referencia primero.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          fields: fields,
        }),
      });

      const result = await response.json();

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setIsMockResult(Boolean(result.isMock));
        if (result.isMock) {
          setHasApiKey(false);
        } else {
          setHasApiKey(true);
        }

        addToast(
          'success',
          '¡Comprobante Generado con Éxito!',
          'Se ha regenerado la imagen manteniendo la textura, sombras y fuente exacta del recibo.'
        );

        if (result.error) {
          addToast('info', 'Nota de OpenAI', result.error);
        }
      } else {
        addToast('error', 'Error al generar la imagen', result.error || 'Ocurrió un error inesperado.');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      addToast('error', 'Error de Conexión', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Dynamic Header */}
      <Header hasApiKey={hasApiKey} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Hero */}
        <section className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Generador de Imágenes GPT Image & Vision</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Regenera Comprobantes Bancarios con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Inteligencia Artificial</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sube la imagen original de cualquier recibo bancario y modifica únicamente los últimos 4 dígitos de la cuenta, el monto, la fecha y la hora. La IA conserva el 100% de la perspectiva, iluminación, sombras y textura de papel.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-gradient-to-l from-emerald-400 to-transparent pointer-events-none hidden md:block" />
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>1. Imagen Base de Referencia</span>
              </h3>
              <p className="text-xs text-slate-400">
                Arrastra tu comprobante o selecciona uno de los ejemplos precargados.
              </p>
            </div>

            {/* Drag and Drop Uploader */}
            <ReceiptUploader
              onImageSelected={handleImageSelected}
              selectedImage={selectedImage}
              onClearImage={handleClearImage}
              isAnalyzing={isAnalyzing}
            />

            {/* Quick Bank Presets */}
            <BankPresets onSelectPreset={handlePresetSelect} />
          </div>

          {/* Right Column: Form & Progress & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>2. Datos a Modificar</span>
              </h3>
              <p className="text-xs text-slate-400">
                {fields.bankType === 'zelle'
                  ? 'Zelle: Modifica monto, nombre registrado y teléfono/correo. Sin fecha ni hora.'
                  : 'La IA sustituirá únicamente los campos indicados sin añadir marcas ni recuadros.'}
              </p>
            </div>

            {/* Form Component */}
            <ReceiptForm
              fields={fields}
              onChange={handleFieldChange}
              onBankTypeChange={handleBankTypeChange}
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
              isImageLoaded={Boolean(selectedImage)}
              onAutoDetect={() => selectedImage && runVisionAnalysis(selectedImage)}
              isDetecting={isAnalyzing}
            />

            {/* Progress Bar during API generation */}
            <ProgressBar isGenerating={isGenerating} />

            {/* Generated Receipt Result Preview & Download */}
            {generatedImage && selectedImage && (
              <ReceiptPreview
                originalImage={selectedImage}
                generatedImage={generatedImage}
                fields={fields}
                isMock={isMockResult}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GPT Receipt Studio — Impulsado por la API de OpenAI</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Fotorrealismo 100% Auténtico
            </span>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
