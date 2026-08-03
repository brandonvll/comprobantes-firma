'use client';

import React from 'react';
import { ReceiptFields, BankType } from '@/types/receipt';
import { CreditCard, DollarSign, Calendar, Clock, Sparkles, Wand2, User, Send } from 'lucide-react';
import { formatCurrencyString } from '@/lib/utils';

interface ReceiptFormProps {
  fields: ReceiptFields;
  onChange: (field: keyof ReceiptFields, value: string) => void;
  onBankTypeChange?: (bankType: BankType) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isImageLoaded: boolean;
  onAutoDetect?: () => void;
  isDetecting?: boolean;
}

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
  const isZelle = fields.bankType === 'zelle';

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
            {isZelle && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md">
                Modo Zelle
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isZelle
              ? 'Formato de Zelle: Modifica el monto, nombre registrado y teléfono o correo (Zelle no usa fecha ni hora).'
              : 'La IA preservará la textura, fuente, papel e iluminación del comprobante.'}
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
          <div className="grid grid-cols-4 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onBankTypeChange('chase')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                fields.bankType === 'chase'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chase
            </button>
            <button
              type="button"
              onClick={() => onBankTypeChange('bofa')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                fields.bankType === 'bofa'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BofA
            </button>
            <button
              type="button"
              onClick={() => onBankTypeChange('zelle')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                fields.bankType === 'zelle'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zelle
            </button>
            <button
              type="button"
              onClick={() => onBankTypeChange('general')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                fields.bankType === 'general' || !fields.bankType
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              General
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Fields Grid */}
      {isZelle ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Monto Zelle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Monto enviado</span>
            </label>
            <input
              type="text"
              placeholder="ej. $125.00"
              value={fields.amount || ''}
              onChange={(e) => onChange('amount', e.target.value)}
              onBlur={(e) => onChange('amount', formatCurrencyString(e.target.value))}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
          </div>

          {/* Nombre Registrado (Felipe Gonzalez) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Nombre del Destinatario (Registrado como)</span>
            </label>
            <input
              type="text"
              placeholder="ej. Felipe Gonzalez"
              value={fields.recipientName || ''}
              onChange={(e) => onChange('recipientName', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-600 text-sm font-sans transition-all outline-none"
              required
            />
            <p className="text-[11px] text-slate-500">
              Modifica automáticamente el nombre en ambas partes del comprobante Zelle ("Estamos enviando a..." y "Registrado como...").
            </p>
          </div>

          {/* Teléfono o Correo Electrónico */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Teléfono o Correo Electrónico</span>
            </label>
            <input
              type="text"
              placeholder="ej. (407) 415-4294 o correo@ejemplo.com"
              value={fields.contactInfo || ''}
              onChange={(e) => onChange('contactInfo', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
            <p className="text-[11px] text-slate-500">
              Puedes escribir un número de teléfono o una dirección de correo electrónico.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Últimos 4 números */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Últimos 4 números de cuenta</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="ej. 7842"
              value={fields.account || ''}
              onChange={(e) => onChange('account', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monto</span>
            </label>
            <input
              type="text"
              placeholder="ej. $1,250.00"
              value={fields.amount || ''}
              onChange={(e) => onChange('amount', e.target.value)}
              onBlur={(e) => onChange('amount', formatCurrencyString(e.target.value))}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fecha</span>
            </label>
            <input
              type="text"
              placeholder="ej. 08/07/2026"
              value={fields.date || ''}
              onChange={(e) => onChange('date', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
          </div>

          {/* Hora */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hora</span>
            </label>
            <input
              type="text"
              placeholder="ej. 03:45 PM"
              value={fields.time || ''}
              onChange={(e) => onChange('time', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
              required
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isImageLoaded || isGenerating}
        className={`mt-2 w-full py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group ${
          isZelle
            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25'
        }`}
      >
        <Sparkles className="w-4 h-4 text-slate-100 group-hover:rotate-12 transition-transform" />
        <span>{isGenerating ? 'Generando Comprobante...' : 'Generar Imagen'}</span>
      </button>
    </form>
  );
}
