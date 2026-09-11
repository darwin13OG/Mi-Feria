import React, { useState, useId } from 'react';
import { Key, ArrowRight, Sparkles, AlertCircle, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { PlanType } from '../../types';
import { calculateNumericStandId, verifyLicenseKey, detectMismatchedPlanKey } from '../../lib/crypto';
import { playSuccess, playWarning } from '../../lib/audio';
import { ThemeToggle } from '../ThemeToggle';
import confetti from 'canvas-confetti';

interface ActivationScreenProps {
  onActivated: (data: { ownerName: string; standId: string; plan: PlanType; licenseKey: string }) => void;
  onGoToLanding: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({
  onActivated,
  onGoToLanding,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [plan, setPlan] = useState<PlanType>('premium');
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const cleanStandName = ownerName.trim().toUpperCase();
  const numericId = cleanStandName ? calculateNumericStandId(cleanStandName) : 0;

  // Verify and activate
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cleanStandName || cleanStandName.length < 2) {
      setErrorMsg('Por favor ingresa el nombre de tu stand o titular.');
      return;
    }

    if (!inputKey.trim()) {
      setErrorMsg('Por favor ingresa tu código de activación de 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    const standId = `STAND-${numericId}`;

    try {
      const isValid = await verifyLicenseKey(inputKey.trim(), standId, cleanStandName, plan);
      if (isValid) {
        playSuccess();
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}

        onActivated({
          ownerName: cleanStandName,
          standId,
          plan,
          licenseKey: inputKey.trim().toUpperCase(),
        });
      } else {
        playWarning();
        const mismatched = detectMismatchedPlanKey(inputKey.trim(), standId, cleanStandName, plan);
        if (mismatched === 'standard' && plan === 'premium') {
          setErrorMsg(`⚠️ Este código pertenece al Plan Estándar ($10.000). Selecciona "Estándar" arriba para activarlo.`);
        } else if (mismatched === 'premium' && plan === 'standard') {
          setErrorMsg(`⚠️ Este código pertenece al Plan Premium ($18.000). Selecciona "Premium" arriba para activarlo.`);
        } else {
          setErrorMsg(`Código incorrecto para el Stand "${cleanStandName}" (ID ${numericId}) en Plan ${plan === 'premium' ? 'Premium' : 'Estándar'}.`);
        }
      }
    } catch {
      playWarning();
      setErrorMsg('Error de validación. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pos-theme-screen bg-slate-100 dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 transition-colors">
      <div className={`w-full max-w-sm rounded-[28px] pos-theme-card bg-white dark:bg-[#0c0c0e] border p-6 shadow-2xl relative text-center transition-all ${
        plan === 'premium'
          ? 'border-amber-300 dark:border-amber-500/40 shadow-amber-500/10'
          : 'border-cyan-300 dark:border-cyan-500/40 shadow-cyan-500/10'
      }`}>
        {/* Back Link & Theme */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onGoToLanding}
            className="text-xs text-slate-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              plan === 'premium'
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                : 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
            }`}>
              {plan === 'premium' ? 'Premium' : 'Estándar'}
            </span>
            <ThemeToggle className="scale-75" />
          </div>
        </div>

        {/* Dynamic Plan Logo Asset */}
        <div className="flex justify-center mb-3">
          <img
            src={plan === 'premium' ? '/logo-premium.png' : '/logo-standard.png'}
            alt={plan === 'premium' ? 'Mi Feria Premium' : 'Mi Feria Estándar'}
            className={`w-16 h-16 rounded-2xl object-contain p-1 border shadow-xl ${
              plan === 'premium'
                ? 'border-amber-400/50 bg-amber-50 dark:bg-black/60 shadow-amber-500/10'
                : 'border-cyan-400/50 bg-cyan-50 dark:bg-black/60 shadow-cyan-500/10'
            }`}
          />
        </div>

        <h1 className="text-lg font-black uppercase tracking-tight mb-1 pos-theme-text-title text-slate-900 dark:text-white">
          Activar Licencia de Stand
        </h1>
        <p className="text-xs pos-theme-text-muted text-slate-600 dark:text-gray-400 mb-5 leading-relaxed">
          Ingresa el nombre de tu stand y el código de 6 dígitos que compraste online o pagaste en efectivo a Darwin.
        </p>

        {/* Plan Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setPlan('standard');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              plan === 'standard'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-400 text-cyan-800 dark:text-cyan-300 shadow-md'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
            }`}
          >
            Estándar
          </button>
          <button
            type="button"
            onClick={() => {
              setPlan('premium');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
              plan === 'premium'
                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-300 shadow-md'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Premium
          </button>
        </div>

        {/* UNIFIED ACTIVATION FORM */}
        <form onSubmit={handleValidateCode} className="space-y-3.5 text-left">
          {/* Stand Name Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                Nombre de tu Stand <span className="text-cyan-600 dark:text-cyan-400">*</span>
              </label>
              {numericId > 0 && (
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  ID: {numericId}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              autoFocus
              value={ownerName}
              onChange={(e) => {
                setOwnerName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="EJ: STAND DELICIAS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/70 border border-slate-300 dark:border-white/15 text-sm font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-gray-600"
            />
          </div>

          {/* Activation Code Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Código de Activación (6 Dígitos) <span className="text-cyan-600 dark:text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={12}
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value.trim());
                setErrorMsg('');
              }}
              placeholder="EJ: 482910"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/70 border border-slate-300 dark:border-white/20 text-center text-lg font-mono font-black text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-gray-600 tracking-wider"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>{isVerifying ? 'Verificando Código...' : 'Activar y Desbloquear Caja'}</span>
          </button>
        </form>

        {/* Purchase & Cash Support Guidance */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 text-center space-y-2">
          <span className="text-[10px] text-slate-500 dark:text-gray-400 block font-medium">
            ¿Aún no compraste tu código?
          </span>
          <button
            type="button"
            onClick={onGoToLanding}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ver Precios y Pagar (Wompi / Efectivo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
