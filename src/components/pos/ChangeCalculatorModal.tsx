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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#0c0c0e] border border-cyan-500/40 text-white shadow-2xl p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Exclusivo Premium
            </span>
            <h3 className="text-base font-black">Calculadora de Vuelto</h3>
          </div>
        </div>

        {/* Total to Pay Display */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 mb-4 text-center">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
            Total a Cobrar
          </span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {formatCOP(totalToPay)}
          </span>
        </div>

        {/* Cash Received Input */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Dinero Recibido del Cliente</span>
            <button
              type="button"
              onClick={handleExactCash}
              className="text-[11px] text-cyan-400 hover:underline font-semibold"
            >
              Pago Exacto
            </button>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-base">
              $
            </span>
            <input
              type="text"
              autoFocus
              value={cashGivenStr}
              onChange={(e) => setCashGivenStr(formatNumberMask(e.target.value))}
              placeholder="0"
              className="w-full pl-8 pr-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-xl font-mono font-black text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Quick Bills Selector */}
        <div className="mb-4">
          <span className="text-[10px] font-semibold text-gray-400 block mb-1.5 uppercase">
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
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
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
              ? 'bg-white/5 border-white/10 text-gray-400'
              : isSufficient
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
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
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          Listo / Cerrar Calculadora
        </button>
      </div>
    </div>
  );
};
