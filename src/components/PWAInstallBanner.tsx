import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          type="button"
          onClick={install}
          className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 ${
            compact
              ? 'px-3 py-1.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
              : 'px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Instalar PWA Móvil</span>
        </button>
      )}

      {isIOS && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 ${
            compact
              ? 'px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
              : 'px-4 py-2 text-sm bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 dark:text-slate-200 light:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Instalar en iPhone / iPad</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Instalar en iOS Safari</h4>
                <p className="text-xs text-gray-400">Sin descargar desde la App Store</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5">Paso 1: Compartir</span>
                  Toca el botón <strong className="text-cyan-300">Compartir</strong> (icono de caja con flecha hacia arriba) en la barra inferior de Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5">Paso 2: Añadir a Inicio</span>
                  Baja en el menú y presiona <strong className="text-cyan-300">«Añadir a pantalla de inicio»</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wider uppercase transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
