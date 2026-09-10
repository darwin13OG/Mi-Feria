import React, { useState } from 'react';
import { ShieldCheck, Key, Copy, Check, Share2, X, Lock, Sparkles } from 'lucide-react';
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
    const cleanPin = pinInput.trim().toUpperCase();
    if (cleanPin === '2026' || cleanPin === 'DARWIN' || cleanPin === 'ADMIN') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. Ingresa el código de coordinación.');
    }
  };

  const cleanStand = standName.trim().toUpperCase();
  const numericId = cleanStand ? calculateNumericStandId(cleanStand) : 0;
  const standardKey = numericId > 0 ? generateNumericKey(numericId, 'standard') : 0;
  const premiumKey = numericId > 0 ? generateNumericKey(numericId, 'premium') : 0;

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleShareWhatsApp = (planType: 'Estándar' | 'Premium', key: number) => {
    const message = 
      `🎫 *MI FERIA - CLAVE DE ACTIVACIÓN OFICIAL*\n\n` +
      `🏢 *Stand:* ${cleanStand}\n` +
      `🆔 *ID:* ${numericId}\n` +
      `⭐ *Plan:* ${planType}\n` +
      `🔑 *Clave de 6 Dígitos:* ${key}\n\n` +
      `📲 *Instrucciones para desbloquear:*\n` +
      `1. Abre Mi Feria en tu celular.\n` +
      `2. Toca "Activar Stand con Código".\n` +
      `3. Escribe tu stand exacto y digita tu clave. ¡Listo!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto pt-6 sm:pt-10">
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl bg-[#0e0e12] border border-cyan-500/40 p-4 sm:p-6 text-white shadow-2xl relative my-auto">
        {/* Header con botón X siempre visible y destacado */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              {isAuthenticated ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                {isAuthenticated ? 'Generador de Claves' : 'Acceso Coordinación'}
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono block">
                {isAuthenticated ? 'Modo Organizador Activo' : 'Seguridad Interna'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white border border-white/20 transition-all cursor-pointer touch-manipulation"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleAuth} className="space-y-4 py-1">
            <p className="text-xs text-gray-300 leading-relaxed text-center">
              Panel privado para generar claves de activación de 6 dígitos a los stands que pagan en efectivo.
            </p>

            <div>
              <input
                type="password"
                inputMode="numeric"
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Digita el PIN"
                className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-center font-mono text-xl font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              {pinError && (
                <span className="text-[11px] text-rose-400 mt-1.5 block font-medium text-center">
                  {pinError}
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer touch-manipulation"
              >
                Entrar al Generador
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 text-xs font-semibold transition-all cursor-pointer touch-manipulation"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Nombre del Stand:
              </label>
              <input
                type="text"
                autoFocus
                value={standName}
                onChange={(e) => setStandName(e.target.value.toUpperCase())}
                placeholder="Ej: STAND AREPAS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/20 text-sm font-bold uppercase text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {numericId > 0 ? (
              <div className="space-y-2.5 pt-1">
                {/* ID badge */}
                <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">ID del Stand:</span>
                  <span className="font-mono font-black text-cyan-300">{numericId}</span>
                </div>

                {/* Standard Plan Key */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 block">
                        Estándar ($10.000)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">Clave Oficial</span>
                    </div>
                    <div className="text-xl font-black font-mono text-white tracking-widest">
                      {standardKey}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(String(standardKey), 'std')}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-all touch-manipulation"
                    >
                      {copiedKey === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'std' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp('Estándar', standardKey)}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-[11px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-all touch-manipulation"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Premium Plan Key */}
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> Premium ($18.000)
                      </span>
                      <span className="text-[10px] text-cyan-400 font-medium">Clave Oficial</span>
                    </div>
                    <div className="text-xl font-black font-mono text-cyan-300 tracking-widest">
                      {premiumKey}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(String(premiumKey), 'prem')}
                      className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-[11px] font-bold text-cyan-200 border border-cyan-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all touch-manipulation"
                    >
                      {copiedKey === 'prem' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'prem' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp('Premium', premiumKey)}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-[11px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-all touch-manipulation"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 px-3 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-gray-400">
                Escribe el nombre del stand arriba para ver sus claves oficiales.
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white text-xs font-semibold transition-all cursor-pointer touch-manipulation"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
