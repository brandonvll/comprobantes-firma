'use client';

import React from 'react';
import { PresetReceipt } from '@/types/receipt';
import { Sparkles } from 'lucide-react';

export const PRESET_RECEIPTS: PresetReceipt[] = [
  {
    id: 'chase',
    name: 'Comprobante Chase',
    bank: 'Chase Bank',
    imageUrl: '/Chase/chase-base-receipt.png',
    fields: {
      bankType: 'chase',
      account: '2274',
      amount: '$3,000.00',
      date: '09/17/2026',
      time: '12:40',
    },
  },
  {
    id: 'bofa',
    name: 'Recibo Bank of America',
    bank: 'Bank of America',
    imageUrl: '/Bank%20of%20america/WhatsApp%20Image%202026-08-02%20at%206.19.16%20PM.jpeg',
    fields: {
      bankType: 'bofa',
      account: '5441',
      amount: '$850.00',
      date: '01/24/2026',
      time: '12:51 PM',
    },
  },
  {
    id: 'zelle',
    name: 'Comprobante Zelle',
    bank: 'Zelle (BofA)',
    imageUrl: '/Zelle/zelle_bofa_reference.jpeg',
    fields: {
      bankType: 'zelle',
      amount: '$438.00',
      recipientName: 'NATHALIE DIAZ',
      contactInfo: '305-848-2711',
      account: 'Adv SafeBalance Banking - 4042',
      date: 'ago 26, 2026',
      confirmationNumber: 'vfwqisvbu',
    },
  },
];

interface BankPresetsProps {
  onSelectPreset: (preset: PresetReceipt) => void;
}

export function BankPresets({ onSelectPreset }: BankPresetsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
          O prueba con un recibo de ejemplo rápido
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PRESET_RECEIPTS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 mb-2 flex items-center justify-center p-1 border border-slate-800">
              <img
                src={preset.imageUrl}
                alt={preset.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate w-full text-center">
              {preset.bank}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
