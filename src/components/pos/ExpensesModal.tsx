import React, { useState } from 'react';
import { Receipt, X, Plus, Trash2, DollarSign } from 'lucide-react';
import { Expense } from '../../types';
import { formatCOP, formatNumberMask, parseMaskedNumber } from '../../lib/crypto';

interface ExpensesModalProps {
  isOpen: boolean;
  expenses: Expense[];
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
}

const COMMON_EXPENSE_SUGGESTIONS = ['Hielo', 'Bolsas y empaques', 'Vasos / servilletas', 'Transporte / Domicilio', 'Decoración stand'];

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  expenses,
  onClose,
  onAddExpense,
  onRemoveExpense,
}) => {
  const [concept, setConcept] = useState('');
  const [amountStr, setAmountStr] = useState('');

  if (!isOpen) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseMaskedNumber(amountStr);
    if (!concept.trim() || amount <= 0) return;

    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      concept: concept.trim(),
      amount,
      t: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    setConcept('');
    setAmountStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#121218]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                Exclusivo Premium
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Gastos Extras e Imprevistos</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Add form */}
          <form onSubmit={handleAdd} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider block">
              Registrar Nuevo Egreso
            </span>

            <div>
              <label className="text-[10px] text-slate-600 dark:text-gray-400 block mb-1">Concepto del Gasto</label>
              <input
                type="text"
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej. Bolsa de hielo extra"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/80 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1">
              {COMMON_EXPENSE_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setConcept(sugg)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10 text-[10px]"
                >
                  + {sugg}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] text-slate-600 dark:text-gray-400 block mb-1">Valor en Pesos ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 font-bold">$</span>
                <input
                  type="text"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(formatNumberMask(e.target.value))}
                  placeholder="6.000"
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-black/80 border border-slate-300 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir a Egresos</span>
            </button>
          </form>

          {/* List of registered expenses */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                Historial de Gastos Extras
              </span>
              <span className="text-xs font-mono font-bold text-rose-500 dark:text-rose-400">
                Total: -{formatCOP(totalExpenses)}
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-gray-500 text-xs">
                No has registrado gastos imprevistos aún.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block text-xs">{exp.concept}</span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-500">
                        {new Date(exp.t).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-500 dark:text-rose-400">
                        -{formatCOP(exp.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121218] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-bold text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
