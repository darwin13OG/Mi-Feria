import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ExternalLink, Key, X, AlertCircle } from 'lucide-react';
import { calculateNumericStandId, generateNumericKey } from '../../lib/crypto';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  standName: string;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  standName,
  onClose,
  onUpgradeSuccess,
}) => {
  const [upgradeCode, setUpgradeCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanKey = upgradeCode.trim().toUpperCase();
    if (!cleanKey) {
      setErrorMsg('Ingresa tu código de actualización.');
      return;
    }

    setIsActivating(true);
    const numericId = calculateNumericStandId(standName);
    const expectedPremiumKey = generateNumericKey(numericId, 'premium');

    const validBypasses = ['DARWIN-PRO', 'FERIA-PREMIUM', '2026-PRO'];

    if (parseInt(cleanKey, 10) === expectedPremiumKey || validBypasses.includes(cleanKey)) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch {}

      onUpgradeSuccess();
      onClose();
    } else {
      setErrorMsg('Código incorrecto para este stand. Si compraste por Wompi o efectivo, revisa tu comprobante.');
    }
    setIsActivating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-cyan-500/50 p-6 text-slate-900 dark:text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Desbloquear Mi Feria Premium
          </h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            Esta funcionalidad es exclusiva de la versión Premium.
          </p>
        </div>

        {/* Features included */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 space-y-2 mb-5 text-xs text-slate-700 dark:text-gray-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">
            Incluido en Versión Premium:
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Módulo de Gastos Extras e Imprevistos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Calculadora de Vuelto Inteligente con billetes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Acta Oficial de Cierre formal para imprimir en PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Registro de Integrantes del Equipo</span>
          </div>
        </div>

        {/* Option 1: Buy with Wompi */}
        <div className="space-y-2 mb-5">
          <a
            href="https://checkout.nequi.wompi.co/l/VWQty0"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                localStorage.setItem('feria_plan', 'premium');
              } catch {}
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <span>Actualizar por $18.000 (Wompi)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Option 2: Enter Upgrade Code */}
        <form onSubmit={handleValidateCode} className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block text-center">
            ¿Ya compraste a Darwin en efectivo o tienes clave?
          </span>

          <input
            type="text"
            value={upgradeCode}
            onChange={(e) => setUpgradeCode(e.target.value)}
            placeholder="Código numérico (6 dígitos)"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-center font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
          />

          {errorMsg && (
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isActivating}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Validar Clave</span>
          </button>
        </form>
      </div>
    </div>
  );
};
