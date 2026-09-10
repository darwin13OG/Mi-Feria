import React, { useState } from 'react';
import { ShieldCheck, Key, Copy, Check, Share2, X, Lock, Sparkles, Hash } from 'lucide-react';
import { calculateNumericStandId, generateNumericKey } from '../lib/crypto';

interface AdminKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminKeyModal: React.FC<AdminKeyModalProps> = ({ isOpen, onClose }) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [standName, setStandName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin PIN check
    const cleanPin = pinInput.trim().toUpperCase();
    if (cleanPin === '2026' || cleanPin === 'DARWIN' || cleanPin === 'ADMIN') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Acceso no autorizado.');
    }
  };

  const cleanStand = standName.trim().toUpperCase();
  const numericId = cleanStand ? calculateNumericStandId(cleanStand) : 0;
  const standardKey = numericId > 0 ? generateNumericKey(numericId, 'standard') : 0;
  const premiumKey = numericId > 0 ? generateNumericKey(numericId, 'premium') : 0;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShareWhatsApp = (planType: 'Estándar' | 'Premium', key: number) => {
    const message = 
      `🎫 *MI FERIA - CLAVE DE ACTIVACIÓN OFICIAL*\n\n` +
      `🏢 *Stand:* ${cleanStand}\n` +
      `🆔 *ID Asignado:* ${numericId}\n` +
      `⭐ *Versión:* ${planType}\n` +
      `🔑 *Código de Activación:* ${key}\n\n` +
      `📲 *Instrucciones:*\n` +
      `1. Abre la aplicación desde el enlace.\n` +
      `2. Presiona "Activar Stand con Código".\n` +
      `3. Escribe tu Stand y pega tu código para desbloquear la caja offline.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0c0c0e] border border-cyan-500/40 p-6 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          <form onSubmit={handleAuth} className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Acceso Administrador Darwin
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Herramienta exclusiva para generar claves instantáneas a estudiantes que pagan en efectivo.
            </p>

            <div className="max-w-xs mx-auto">
              <input
                type="password"
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa tu PIN de seguridad"
                className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-center font-mono text-lg font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              {pinError && (
                <span className="text-[11px] text-rose-400 mt-1 block font-medium">
                  {pinError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full max-w-xs mx-auto py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-cyan-500/20"
            >
              Ingresar al Generador
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  Generador de Claves (Efectivo)
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono">Modo Administrador Activo</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Nombre del Stand que te pagó en efectivo
              </label>
              <input
                type="text"
                autoFocus
                value={standName}
                onChange={(e) => setStandName(e.target.value.toUpperCase())}
                placeholder="EJ: STAND DELICIAS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-sm font-bold uppercase text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {numericId > 0 ? (
              <div className="space-y-3 pt-1">
                {/* ID block */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">ID Numérico de Stand:</span>
                  <span className="font-mono font-black text-cyan-300 text-base">{numericId}</span>
                </div>

                {/* Standard Plan Key */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 block">
                        Versión Estándar ($10.000)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Código Oficial de 6 Dígitos
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono text-white">
                      {standardKey}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(String(standardKey), 'std')}
                      className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center justify-center gap-1"
                    >
                      {copiedKey === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'std' ? '¡Copiado!' : 'Copiar Clave'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp('Estándar', standardKey)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center justify-center gap-1"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Premium Plan Key */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> Versión Premium ($18.000)
                      </span>
                      <span className="text-[10px] text-cyan-400 font-medium">
                        Código Oficial de 6 Dígitos
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono text-cyan-300">
                      {premiumKey}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(String(premiumKey), 'prem')}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[11px] font-bold text-cyan-200 border border-cyan-500/30 flex items-center justify-center gap-1"
                    >
                      {copiedKey === 'prem' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'prem' ? '¡Copiado!' : 'Copiar Clave'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp('Premium', premiumKey)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center justify-center gap-1"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-gray-500">
                Escribe el nombre del stand arriba para calcular su ID y claves al instante.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
