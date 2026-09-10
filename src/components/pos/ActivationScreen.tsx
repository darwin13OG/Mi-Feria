import React, { useState, useId } from 'react';
import { Key, ArrowRight, Sparkles, AlertCircle, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { PlanType } from '../../types';
import { calculateNumericStandId, verifyLicenseKey } from '../../lib/crypto';
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
        setErrorMsg(`Código incorrecto para el Stand "${cleanStandName}" (ID ${numericId}). Revisa el plan o el código que te entregaron.`);
      }
    } catch {
      setErrorMsg('Error de validación. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pos-theme-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 transition-colors">
      <div className="w-full max-w-sm rounded-[28px] pos-theme-card bg-[#0c0c0e] border border-cyan-500/30 p-6 shadow-2xl relative text-center">
        {/* Back Link & Theme */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onGoToLanding}
            className="text-xs text-slate-500 dark:text-gray-400 hover:text-cyan-500 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              {plan === 'premium' ? 'Premium' : 'Estándar'}
            </span>
            <ThemeToggle className="scale-75" />
          </div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <Key className="w-7 h-7" />
        </div>

        <h1 className="text-lg font-black uppercase tracking-tight mb-1 pos-theme-text-title text-white">
          Activar Licencia de Stand
        </h1>
        <p className="text-xs pos-theme-text-muted text-gray-400 mb-5 leading-relaxed">
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
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              plan === 'standard'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-400'
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
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              plan === 'premium'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Premium
          </button>
        </div>

        {/* UNIFIED ACTIVATION FORM */}
        <form onSubmit={handleValidateCode} className="space-y-3.5 text-left">
          {/* Stand Name Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Nombre de tu Stand <span className="text-cyan-400">*</span>
              </label>
              {numericId > 0 && (
                <span className="text-[10px] font-mono font-bold text-cyan-400">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-sm font-bold uppercase text-white focus:outline-none focus:border-cyan-400 placeholder:text-gray-600"
            />
          </div>

          {/* Activation Code Input */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Código de Activación (6 Dígitos) <span className="text-cyan-400">*</span>
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/20 text-center text-lg font-mono font-black text-cyan-300 focus:outline-none focus:border-cyan-400 placeholder:text-gray-600 tracking-wider"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>{isVerifying ? 'Verificando Código...' : 'Activar y Desbloquear Caja'}</span>
          </button>
        </form>

        {/* Purchase & Cash Support Guidance */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center space-y-2">
          <span className="text-[10px] text-gray-400 block font-medium">
            ¿Aún no compraste tu código?
          </span>
          <button
            type="button"
            onClick={onGoToLanding}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Precios y Pagar (Wompi / Efectivo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
