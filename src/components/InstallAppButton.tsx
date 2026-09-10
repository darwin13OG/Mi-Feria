import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside standalone app, do not show install prompt in header
  if (isInstalled && variant === 'header') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await install();
        if (!success) {
          setShowGuide(true);
        }
      } catch {
        setShowGuide(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Show friendly step-by-step installation instructions for this browser/device
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isInstalling}
          className={`px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all cursor-pointer touch-manipulation select-none ${className}`}
          title="Instalar aplicación en tu pantalla de inicio"
          aria-label="Instalar aplicación en este dispositivo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
      )}

      {variant === 'banner' && !isInstalled && (
        <div
          className={`p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Instala la App en tu Celular</h4>
              <p className="text-[11px] text-cyan-200/80">
                Ábrela directo desde tu pantalla de inicio sin barra de navegador.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClick}
            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black font-black text-xs shrink-0 transition-all cursor-pointer touch-manipulation shadow-md shadow-cyan-500/30"
          >
            Instalar
          </button>
        </div>
      )}

      {variant === 'card' && (
        <div className={`p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-2 ${className}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Acceso en Pantalla de Inicio
            </span>
            {isInstalled ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Instalada
              </span>
            ) : null}
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            {isInstalled
              ? 'Esta aplicación ya está instalada en tu dispositivo y funciona de forma independiente.'
              : 'Agrega Mi Feria a tu pantalla principal para usarla como una app nativa en el stand sin necesidad de navegador.'}
          </p>

          {!isInstalled && (
            <button
              type="button"
              onClick={handleClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <Download className="w-4 h-4" />
              <span>Instalar en este Celular</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Guía Rápida de Instalación */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e0e12] border border-cyan-500/40 p-5 text-white shadow-2xl relative space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white">Instalar en tu Celular</h3>
                  <span className="text-[10px] text-cyan-400 font-mono block">Pantalla de inicio</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step Guide */}
            {isIOS ? (
              <div className="space-y-3 text-xs text-gray-300">
                <p className="text-gray-200 leading-relaxed">
                  Para instalar en tu <strong>iPhone o iPad</strong> desde Safari:
                </p>
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      Toca el botón <strong className="text-white">Compartir</strong> <Share className="w-3.5 h-3.5 inline text-cyan-400" /> en la barra inferior de Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      Desplázate hacia abajo y selecciona <strong className="text-white">«Agregar a inicio»</strong> <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      Toca <strong className="text-white">Agregar</strong> en la esquina superior derecha. ¡Listo!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-gray-300">
                <p className="text-gray-200 leading-relaxed">
                  Para instalar en tu <strong>celular Android</strong> o computador:
                </p>
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      Abre el menú de tu navegador tocando los <strong className="text-white">tres puntos (⋮)</strong> en la esquina superior derecha.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      Selecciona <strong className="text-white">«Instalar aplicación»</strong> o <strong className="text-white">«Agregar a la pantalla principal»</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      Confirma <strong className="text-white">«Instalar»</strong>. La aplicación aparecerá en tu teléfono con su propio icono.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
