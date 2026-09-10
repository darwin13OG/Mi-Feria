import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Sparkles, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { PlanType } from '../types';
import { calculateNumericStandId, generateNumericKey } from '../lib/crypto';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  initialPlan?: PlanType;
  onClose: () => void;
  onActivate: (data: { ownerName: string; standId: string; plan: PlanType; licenseKey: string }) => void;
}

export const LicenseGeneratorModal: React.FC<Props> = ({
  isOpen,
  initialPlan = 'premium',
  onClose,
  onActivate,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [plan, setPlan] = useState<PlanType>(initialPlan);
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [numericId, setNumericId] = useState<number>(0);
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
    }
  }, [initialPlan]);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = ownerName.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('⚠️ Ingresa el nombre de tu stand o titular.');
      return;
    }

    const id = calculateNumericStandId(clean);
    const key = generateNumericKey(id, plan);

    setNumericId(id);
    setGeneratedKey(String(key));
    setStep('result');
    setErrorMsg('');

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenApp = () => {
    onActivate({
      ownerName: ownerName.trim().toUpperCase(),
      standId: `STAND-${numericId}`,
      plan,
      licenseKey: generatedKey,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[28px] bg-[#0b0b0b] border border-cyan-500/40 p-6 sm:p-8 text-center text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 text-white">
              ¡Pago Confirmado!
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Escribe el nombre de tu stand o titular para generar tu acceso oficial de caja.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Plan badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Licencia {plan === 'premium' ? 'FP Premium' : 'FP Standard'}</span>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  required
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="EJ: STAND DELICIAS"
                  className="w-full bg-[#141417] border border-white/15 rounded-2xl px-4 py-3.5 text-white uppercase text-center font-black text-sm tracking-wide focus:border-cyan-400 outline-none transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                Generar Mi Licencia
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/40">
              <span className="block text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                ID de Registro: {numericId}
              </span>
              <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                Tu Clave de Acceso
              </label>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-cyan-300 mb-3">
                {generatedKey}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-bold uppercase tracking-wider transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Clave Copiada!' : '📋 Copiar Clave'}</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Toma captura o guarda tu clave. Puedes abrir la aplicación inmediatamente.
            </p>

            <button
              type="button"
              onClick={handleOpenApp}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 Abrir App y Desbloquear Caja</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
