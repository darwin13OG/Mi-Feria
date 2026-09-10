import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, Key, DollarSign, HelpCircle, ArrowUpRight } from 'lucide-react';

export const WhatsAppSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getWhatsAppUrl = (customText: string) => {
    return 'https://wa.me/573218322388?text=' + encodeURIComponent(customText);
  };

  const quickActions = [
    {
      title: 'Pagar en Efectivo en el Colegio',
      desc: 'Coordina la entrega del dinero y recibe tu código oficial',
      icon: DollarSign,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      text: '¡Hola! Quiero pagar mi licencia de Mi Feria en efectivo en el colegio. Mi stand es: ',
    },
    {
      title: 'Ayuda con Código de Activación',
      desc: 'Si ya pagaste por Wompi o efectivo y requieres tu clave',
      icon: Key,
      color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      text: '¡Hola! Ya realicé el pago pero necesito ayuda para activar mi stand. Mi nombre o stand es: ',
    },
    {
      title: 'Consulta General o Técnica',
      desc: 'Asistencia para el día del evento o dudas contables',
      icon: HelpCircle,
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      text: '¡Hola! Tengo una duda sobre el funcionamiento del sistema Mi Feria: ',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 no-print pointer-events-none">
      {/* Sliding and Scaling Quick Contact Panel - only in DOM when open */}
      {isOpen && (
        <div
          className="mb-3 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-3xl border p-4 shadow-2xl backdrop-blur-xl bg-[#0c0c10]/98 border-emerald-500/40 text-white animate-in fade-in zoom-in-95 duration-200 origin-bottom-right pointer-events-auto shadow-emerald-950/60"
        >
          {/* Header with Live Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                  <span>Coordinación — Soporte Oficial</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono block">En línea por WhatsApp</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-colors cursor-pointer"
              aria-label="Cerrar soporte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Short prompt */}
          <p className="text-[11px] text-gray-300 mb-3 leading-snug">
            ¿En qué podemos ayudarte hoy? Selecciona una opción para abrir WhatsApp directamente:
          </p>

          {/* Quick Action Buttons */}
          <div className="space-y-2 mb-3">
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <a
                  key={i}
                  href={getWhatsAppUrl(qa.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/10 active:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 transition-all text-left block cursor-pointer"
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${qa.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                        {qa.title}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight line-clamp-1 mt-0.5">
                      {qa.desc}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* General Direct Button */}
          <a
            href={getWhatsAppUrl('¡Hola! Necesito información sobre Mi Feria.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir Chat de Soporte Oficial</span>
          </a>
        </div>
      )}

      {/* Floating Action Button with Animated Rotating Icon & Transitions */}
      <div className="flex items-center justify-end gap-2 pointer-events-auto">
        {!isOpen && (
          <div className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-[#0c0c10]/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-right-2">
            <span>¿Dudas o Clave? Escríbenos</span>
          </div>
        )}

        <button
          type="button"
          id="whatsapp-support-floating-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Contactar soporte por WhatsApp"
          className={`relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-90 focus:outline-none cursor-pointer ${
            isOpen
              ? 'bg-zinc-800 text-white rotate-90 border border-white/20'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white hover:scale-105 shadow-emerald-500/30 ring-4 ring-emerald-500/20'
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" />
          ) : (
            <>
              <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 animate-ping pointer-events-none" />
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10 transition-transform duration-200 group-hover:scale-110" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
