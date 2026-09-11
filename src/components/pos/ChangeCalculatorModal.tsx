import React, { useState } from 'react';
import { Calculator, X, DollarSign, Check, AlertTriangle } from 'lucide-react';
import { formatCOP, formatNumberMask, parseMaskedNumber } from '../../lib/crypto';

interface ChangeCalculatorModalProps {
  isOpen: boolean;
  totalToPay: number;
  onClose: () => void;
  onSaleComplete?: () => void;
}

const COMMON_COP_BILLS = [2000, 5000, 10000, 20000, 50000, 100000];

export const ChangeCalculatorModal: React.FC<ChangeCalculatorModalProps> = ({
  isOpen,
  totalToPay,
  onClose,
  onSaleComplete,
}) => {
  const [cashGivenStr, setCashGivenStr] = useState<string>('');

  if (!isOpen) return null;

  const cashGiven = parseMaskedNumber(cashGivenStr);
  const change = cashGiven - totalToPay;
  const isSufficient = cashGiven >= totalToPay;

  const handleBillClick = (amount: number) => {
    setCashGivenStr(formatNumberMask(amount));
  };

  const handleExactCash = () => {
    setCashGivenStr(formatNumberMask(totalToPay));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white shadow-2xl p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:border dark:border-cyan-500/30 dark:text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
              Exclusivo Premium
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Calculadora de Vuelto</h3>
          </div>
        </div>

        {/* Total to Pay Display */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 mb-4 text-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-0.5">
            Total a Cobrar
          </span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {formatCOP(totalToPay)}
          </span>
        </div>

        {/* Cash Received Input */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Dinero Recibido del Cliente</span>
            <button
              type="button"
              onClick={handleExactCash}
              className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              Pago Exacto
            </button>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 font-bold text-base">
              $
            </span>
            <input
              type="text"
              autoFocus
              value={cashGivenStr}
              onChange={(e) => setCashGivenStr(formatNumberMask(e.target.value))}
              placeholder="0"
              className="w-full pl-8 pr-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-black/80 border border-slate-300 dark:border-white/20 text-xl font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick Bills Selector */}
        <div className="mb-4">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1.5 uppercase">
            Billetes comunes (COP)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {COMMON_COP_BILLS.map((bill) => (
              <button
                key={bill}
                type="button"
                onClick={() => handleBillClick(bill)}
                className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  cashGiven === bill
                    ? 'bg-cyan-100 border-cyan-400 text-cyan-900 dark:bg-cyan-500/25 dark:border-cyan-400 dark:text-cyan-300 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
              >
                ${(bill / 1000).toLocaleString('es-CO')}k
              </button>
            ))}
          </div>
        </div>

        {/* Change / Vuelto Output */}
        <div
          className={`p-4 rounded-2xl border text-center transition-all ${
            cashGiven === 0
              ? 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400'
              : isSufficient
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/30 dark:border-rose-500/40 dark:text-rose-300'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest block mb-1">
            {isSufficient ? 'Cambio / Vuelto a Entregar' : 'Dinero Insuficiente'}
          </span>
          <div className="text-3xl font-black font-mono tracking-tight">
            {isSufficient ? formatCOP(change) : `Faltan ${formatCOP(Math.abs(change))}`}
          </div>
        </div>

        {/* Close / Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onSaleComplete) onSaleComplete();
            onClose();
          }}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
        >
          Listo / Cerrar Calculadora
        </button>
      </div>
    </div>
  );
};
