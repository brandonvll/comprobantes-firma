'use client';

import React from 'react';
import { ReceiptFields } from '@/types/receipt';
import { Sparkles, Wand2, User, Send, CreditCard, DollarSign, Calendar, Clock } from 'lucide-react';
import { formatCurrencyString } from '@/lib/utils';
import { getTemplateList, templates } from '@/templates/registry';

interface ReceiptFormProps {
  fields: ReceiptFields;
  onChange: (field: string, value: string) => void;
  onBankTypeChange?: (bankType: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isImageLoaded: boolean;
  onAutoDetect?: () => void;
  isDetecting?: boolean;
}

// Icon mapping helper for dynamic fields
const getFieldIcon = (id: string, colorClass: string) => {
  const props = { className: `w-3.5 h-3.5 ${colorClass}` };
  if (id.includes('account')) return <CreditCard {...props} />;
  if (id.includes('amount')) return <DollarSign {...props} />;
  if (id.includes('date')) return <Calendar {...props} />;
  if (id.includes('time')) return <Clock {...props} />;
  if (id.includes('name')) return <User {...props} />;
  if (id.includes('contact')) return <Send {...props} />;
  return <Sparkles {...props} />;
};

export function ReceiptForm({
  fields,
  onChange,
  onBankTypeChange,
  onSubmit,
  isGenerating,
  isImageLoaded,
  onAutoDetect,
  isDetecting = false,
}: ReceiptFormProps) {
  const activeTemplateId = fields.templateId || 'chase';
  const activeTemplate = templates[activeTemplateId];
  
  if (!activeTemplate) return null;

  // Use the template's color for styling
  const themeColor = activeTemplate.config.color.replace('bg-', 'text-');
  const ringColor = activeTemplate.config.color.replace('bg-', 'focus:ring-').replace('-600', '-500');
  const borderColor = activeTemplate.config.color.replace('bg-', 'focus:border-').replace('-600', '-500');

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col gap-6"
    >
      {/* Header with AI auto-detect */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Valores a Modificar</span>
            <span className={`px-2 py-0.5 text-[11px] font-semibold bg-slate-800 rounded-md ${themeColor}`}>
              Modo {activeTemplate.config.name}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            La IA preservará la textura, fuente, papel e iluminación del comprobante.
          </p>
        </div>

        {isImageLoaded && onAutoDetect && (
          <button
            type="button"
            onClick={onAutoDetect}
            disabled={isDetecting || isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            title="Usar GPT-4o Vision para detectar los campos automáticamente de la imagen"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detectando...' : 'Auto-detectar con IA'}</span>
          </button>
        )}
      </div>

      {/* Bank Format Selector Tabs */}
      {onBankTypeChange && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tipo de Comprobante / Banco:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {getTemplateList().map((template) => (
              <button
                key={template.config.id}
                type="button"
                onClick={() => onBankTypeChange(template.config.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTemplateId === template.config.id
                    ? `${template.config.color} text-white shadow-sm`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {template.config.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeTemplate.fields.map((field) => (
          <div key={field.id} className={`space-y-1.5 ${activeTemplateId === 'zelle' ? 'sm:col-span-2' : ''}`}>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              {getFieldIcon(field.id, themeColor)}
              <span>{field.label}</span>
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={fields[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              onBlur={(e) => {
                if (field.type === 'currency') {
                  onChange(field.id, formatCurrencyString(e.target.value));
                }
              }}
              disabled={isGenerating}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 ${borderColor} ${ringColor} text-white placeholder-slate-600 text-sm font-mono transition-all outline-none`}
              required={field.required !== false}
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isImageLoaded || isGenerating}
        className={`mt-2 w-full py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group ${activeTemplate.config.color.replace('bg-', 'bg-gradient-to-r from-').replace('-600', '-600 to-slate-800')} hover:opacity-90`}
      >
        <Sparkles className="w-4 h-4 text-slate-100 group-hover:rotate-12 transition-transform" />
        <span>{isGenerating ? 'Generando Comprobante...' : 'Generar Imagen'}</span>
      </button>
    </form>
  );
}
