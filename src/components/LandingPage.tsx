import React, { useState, useEffect } from 'react';
import {
  Zap,
  Shield,
  WifiOff,
  TrendingUp,
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Calculator,
  FileText,
  Users,
  Receipt,
  RotateCcw,
  Smartphone,
  ExternalLink,
  DollarSign,
  Lock,
  Layers,
  HelpCircle,
  Key,
  X,
  Menu,
  MessageCircle,
} from 'lucide-react';
import { PlanType } from '../types';
import { AdminKeyModal } from './AdminKeyModal';

interface LandingPageProps {
  onOpenApp: (preferredPlan?: PlanType) => void;
  onOpenActivation: (preferredPlan?: PlanType) => void;
  onOpenLicenseModal: (plan: PlanType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenApp,
  onOpenActivation,
  onOpenLicenseModal,
}) => {
  // Mobile and Accordion states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cashSectionOpen, setCashSectionOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [secretClicks, setSecretClicks] = useState(0);

  // Auto-reset secret click counter if not completed within 2 seconds
  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  const handleSecretAdminTrigger = () => {
    setSecretClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setAdminModalOpen(true);
        return 0;
      }
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 70;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    try {
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    } catch {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openAndScrollToCash = () => {
    setCashSectionOpen(true);
    setTimeout(() => {
      scrollToSection('efectivo');
    }, 120);
  };

  const handleMobileNav = (action: () => void) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      action();
    }, 120);
  };

  // Allow admin URL access (e.g. ?admin=2026 or ?organizador)
  useEffect(() => {
    try {
      const search = window.location.search.toLowerCase();
      if (search.includes('admin') || search.includes('darwin') || search.includes('organizador')) {
        setAdminModalOpen(true);
      }
    } catch {}
  }, []);

  // 9 Modules detailed
  const modules = [
    {
      id: 1,
      title: '1. Configuración Inicial',
      desc: 'Define el nombre del stand, institución, integrantes del equipo e inversión inicial con formato automático en pesos colombianos.',
      icon: Cpu,
      color: 'text-cyan-400',
    },
    {
      id: 2,
      title: '2. Gestión Multiproducto (Hasta 8)',
      desc: 'Administra precios unitarios y stock inicial de cada artículo de tu feria en una interfaz ágil y visual.',
      icon: Layers,
      color: 'text-blue-400',
    },
    {
      id: 3,
      title: '3. Panel Táctil de Ventas Rápidas',
      desc: 'Selector de cantidades y botones gigantes táctiles. Con un solo toque registras la venta frente al cliente en segundos.',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      id: 4,
      title: '4. Balance Financiero en Vivo',
      desc: 'Visualiza caja total, ganancia neta en tiempo real y barra de progreso de ROI que pasa de rojo a amarillo y verde al superar la meta.',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      id: 5,
      title: '5. Historial con Función "Deshacer"',
      desc: 'Blindaje contable con snapshots congelados de precios. Si hubo un error de digitación, un clic revierte la venta y el stock.',
      icon: RotateCcw,
      color: 'text-rose-400',
    },
    {
      id: 6,
      title: '6. Reporte y Análisis de ROI',
      desc: 'Cálculo exacto del Retorno de Inversión y conteo del Producto Estrella para defender tu proyecto con métricas reales.',
      icon: DollarSign,
      color: 'text-purple-400',
    },
    {
      id: 7,
      title: '7. Gastos Extras y PDF Oficial (Premium)',
      desc: 'Añade costos imprevistos (hielo, transporte, empaques) y genera el Acta Oficial de Cierre lista para imprimir o guardar en PDF.',
      icon: FileText,
      color: 'text-cyan-300',
    },
    {
      id: 8,
      title: '8. Calculadora de Vuelto Inteligente (Premium)',
      desc: 'Panel instantáneo con botones de billetes colombianos que calcula el cambio exacto sin margen de error mental.',
      icon: Calculator,
      color: 'text-emerald-300',
    },
    {
      id: 9,
      title: '9. Seguridad y Cierre Formal',
      desc: 'Cierre de sesión seguro con persistencia en localStorage para que tus datos sigan intactos ante apagones o recargas.',
      icon: Lock,
      color: 'text-blue-300',
    },
  ];

  // FAQs
  const faqs = [
    {
      q: '¿Funciona de verdad si en el colegio o feria no hay señal de internet?',
      a: '¡100% garantizado! Mi Feria funciona de manera 100% local en tu navegador. Una vez abierta, todos los cálculos, ventas y reportes operan en la memoria de tu dispositivo sin gastar datos ni requerir señal.',
    },
    {
      q: '¿Qué pasa si el celular se descarga o la página se cierra por accidente?',
      a: 'Cero pánico: cada toque de venta y gasto se congela al instante en el almacenamiento seguro de tu navegador. Al prender el celular o reabrir el enlace, tu balance estará exactamente en el mismo peso.',
    },
    {
      q: '¿Cómo recibo mi clave luego de pagar por Nequi / Wompi?',
      a: 'La pasarela Wompi te redirige automáticamente a la página de éxito donde se autogenera tu clave SHA-256. Además, puedes presionar "Generar Clave" con tu nombre en cualquier momento o contactarnos por WhatsApp.',
    },
    {
      q: '¿Puedo usar la aplicación en varios teléfonos a la vez?',
      a: 'Sí, puedes abrirla en los dispositivos de tu equipo. Para stands con caja centralizada, se recomienda operar la caja en un teléfono principal y respaldar el resumen por WhatsApp al instante.',
    },
    {
      q: '¿Cómo presento el resultado de mi feria al docente calificador?',
      a: 'En la versión Estándar descargas el archivo estructurado "Reporte_Stand.txt". En la versión Premium generas el "Acta de Cierre Oficial", con diseño ejecutivo perfecto para imprimir en PDF o mostrar en pantalla con veredicto financiero.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 dark:bg-[#050505] dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors duration-200">
      {/* Top Floating Navigation */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#050505]/90 border-b border-[#1f1f23] dark:bg-[#050505]/90 dark:border-[#1f1f23] light:bg-white/90 light:border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo con trigger secreto de 3 toques */}
          <div
            onClick={handleSecretAdminTrigger}
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform touch-manipulation"
            title="Mi Feria — Punto de Venta Escolar"
          >
            <img src="/icon.svg" alt="Mi Feria Logo" className="w-8 h-8 rounded-xl shadow-md shadow-cyan-500/30" />
            <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Mi Feria
            </span>
          </div>

          {/* Botón de Menú de 3 Barras (Restaurado en todos los dispositivos) */}
          <button
            type="button"
            id="nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 transition-all cursor-pointer touch-manipulation flex items-center gap-2"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-gray-200" />}
          </button>
        </div>

        {/* Slide-Down Quick Menu con transición suave y fluida */}
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out border-b border-[#1f1f23] bg-[#0c0c10]/98 backdrop-blur-2xl shadow-2xl ${
            mobileMenuOpen ? 'max-h-[420px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0 border-transparent pointer-events-none'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 space-y-1.5">
            <button
              type="button"
              onClick={() => handleMobileNav(() => scrollToSection('precios'))}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 active:bg-white/10 text-xs font-bold text-gray-200 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation"
            >
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Ver Licencias y Precios ($10k y $18k)</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNav(() => openAndScrollToCash())}
              className="w-full text-left p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 text-xs font-bold text-emerald-300 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Pagar en Efectivo en el Colegio</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNav(() => onOpenActivation())}
              className="w-full text-left p-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 active:bg-cyan-500/35 border border-cyan-500/30 text-xs font-black text-cyan-300 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation"
            >
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Activar mi Stand con Código</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNav(() => scrollToSection('modulos'))}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 active:bg-white/10 text-xs font-bold text-gray-200 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Los 9 Módulos del Sistema</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNav(() => scrollToSection('faqs'))}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 active:bg-white/10 text-xs font-bold text-gray-200 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Preguntas Frecuentes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:pt-20 md:pb-24 border-b border-white/5">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Punto de Venta Escolar Offline</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-4">
            Asegura tu nota y calcula tus ganancias{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              en vivo sin perder ni un peso
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Control de caja e inventario 100% offline para tu stand. Registra ventas al instante y genera el balance final para tu proyecto.
          </p>

          <div className="flex items-center justify-center max-w-md mx-auto mb-10">
            <button
              type="button"
              id="hero-see-pricing-btn"
              onClick={() => scrollToSection('precios')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Licencias y Precios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Insignias de Confianza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-[#0c0c0e]/90 border border-[#1f1f23] flex items-start gap-3.5 shadow-sm hover:border-cyan-500/30 transition-all">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">100% Offline</h3>
                <p className="text-xs text-gray-400">Funciona perfecto en patios o colegios sin datos móviles ni WiFi.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0c0e]/90 border border-[#1f1f23] flex items-start gap-3.5 shadow-sm hover:border-cyan-500/30 transition-all">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">Control ROI en Vivo</h3>
                <p className="text-xs text-gray-400">Calcula utilidades netas y porcentaje de retorno a cada segundo.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0c0e]/90 border border-[#1f1f23] flex items-start gap-3.5 shadow-sm hover:border-cyan-500/30 transition-all">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">Anti-Apagones</h3>
                <p className="text-xs text-gray-400">Persistencia instantánea en memoria local contra cierres o apagones.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque de Beneficios */}
      <section className="py-16 px-4 max-w-6xl mx-auto border-b border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            Ventajas Competitivas
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">
            La diferencia entre improvisar y liderar la feria
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Adiós al papel y a las cuentas manuales
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Olvídate de tachones en libretas frente a los profesores o clientes haciendo fila. Registra las ventas con toques de 1 segundo y mantén tu caja impecable.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-rose-400">
              <CheckCircle2 className="w-4 h-4" />
              Cero errores de cálculo
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Ganancias en vivo y conteo restante
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sabrás en qué momento exacto recuperaste tu inversión inicial y cuánto dinero neto te corresponde a ti y a tus socios tras cada combo despachado.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              Inventario en tiempo real
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Acta oficial para asegurar el 5.0
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Al terminar la jornada, imprime o descarga el Acta de Cierre con desglose formal por producto, ROI auditado y veredicto de rentabilidad.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              Formato ejecutivo listo para sustentar
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Adquirirla en 3 Pasos */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-b border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            Activación Inmediata
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">
            Cómo adquirir tu licencia en 3 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] relative">
            <span className="text-3xl font-black text-cyan-500/25 absolute top-5 right-5 font-mono">01</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 mb-4 font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base mb-2">Selecciona versión</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Elige entre la versión Estándar ($10.000 COP) o la versión Premium ($18.000 COP con Acta PDF y Calculadora de vuelto).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] relative">
            <span className="text-3xl font-black text-cyan-500/25 absolute top-5 right-5 font-mono">02</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 mb-4 font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base mb-2">Pago digital seguro</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Paga en segundos con Nequi, PSE o tarjeta a través del checkout oficial de Wompi Bancolombia, o reporta tu pago en efectivo.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] relative">
            <span className="text-3xl font-black text-cyan-500/25 absolute top-5 right-5 font-mono">03</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 mb-4 font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base mb-2">Activación al instante</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              El sistema genera tu clave criptográfica única SHA-256 ligada a tu stand y habilita tu panel de ventas de inmediato.
            </p>
          </div>
        </div>
      </section>

      {/* Planes y Precios con Enlaces Reales */}
      <section id="precios" className="py-20 px-4 max-w-5xl mx-auto border-b border-white/5 scroll-mt-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            Inversión Garantizada
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mt-2">
            Elige tu versión de Mi Feria
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mt-3">
            Licencia perpetua por evento. Sin mensualidades ni cobros escondidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Plan Estándar */}
          <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f23] flex flex-col justify-between relative hover:border-slate-600 transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Plan Inicial
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 font-medium">
                  Ideal stand individual
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Mi Feria Estándar</h3>
              <p className="text-xs text-gray-400 mb-6">
                Todas las herramientas esenciales para registrar ventas y calcular utilidades sin errores.
              </p>

              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                <span className="text-4xl font-black text-white">$10.000</span>
                <span className="text-xs text-gray-400 font-semibold">COP / Stand</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>100% Offline (sin señal de internet)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Panel táctil de ventas rápidas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Cálculo de ganancias netas y ROI en vivo</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Gestión de hasta 8 productos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Historial con botón "Deshacer" venta</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Descarga de Reporte estructurado en .txt</span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-500 line-through">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Calculadora de vuelto integrada</span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-500 line-through">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Acta Oficial para imprimir en PDF</span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-500 line-through">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Módulo de gastos extras / imprevistos</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <a
                href="https://checkout.nequi.wompi.co/l/MWuJTh"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    localStorage.setItem('feria_plan', 'standard');
                  } catch {}
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <span>Pagar $10.000 con Nequi / Wompi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => openAndScrollToCash()}
                className="w-full py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-500/40 text-emerald-300 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/30"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Pagar en Efectivo ($10k)</span>
              </button>
            </div>
          </div>

          {/* Plan Premium - Más Completo */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0c0c12] border-2 border-cyan-400 flex flex-col justify-between relative shadow-2xl shadow-cyan-950/40">
            {/* Pill badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-[11px] tracking-widest uppercase shadow-md">
              MÁS COMPLETO
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Edición Completa
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold">
                  Acceso Total
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Mi Feria Premium</h3>
              <p className="text-xs text-gray-300 mb-6">
                La experiencia definitiva con acta de cierre para imprimir, calculadora de vuelto y registro de gastos extras.
              </p>

              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-cyan-500/20">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                  $18.000
                </span>
                <span className="text-xs text-gray-400 font-semibold">COP / Stand</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-white">Todo lo del Plan Estándar incluido</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="font-bold text-cyan-200">Acta Oficial de Cierre para imprimir o PDF</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="font-bold text-cyan-200">Calculadora de Vuelto Inteligente con billetes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="font-bold text-cyan-200">Caja de Gastos Extras e Imprevistos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Registro de Integrantes del equipo en el acta</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Identificación de Producto Estrella y estadísticas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Soporte prioritario por WhatsApp el día del evento</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <a
                href="https://checkout.nequi.wompi.co/l/VWQty0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    localStorage.setItem('feria_plan', 'premium');
                  } catch {}
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Pagar $18.000 con Nequi / Wompi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => openAndScrollToCash()}
                className="w-full py-3.5 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 active:scale-95 border-2 border-emerald-500/50 text-emerald-200 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Pagar en Efectivo ($18k)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link directo de activación si ya tienen código */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onOpenActivation()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-gray-200 hover:text-cyan-300 transition-all shadow-sm cursor-pointer"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>¿Ya tienes tu clave? Activar mi Stand con Código aquí →</span>
          </button>
        </div>

        {/* Sección Pagar en Efectivo (Menú desplegable suave / Accordion) */}
        <div id="efectivo" className="mt-10 max-w-4xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-[#091510] to-[#0a0a0d] overflow-hidden shadow-2xl shadow-emerald-950/50">
            {/* Header Desplegable Suave */}
            <button
              type="button"
              onClick={() => setCashSectionOpen(!cashSectionOpen)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-emerald-500/5 active:bg-emerald-500/10 transition-colors cursor-pointer select-none touch-manipulation"
              aria-expanded={cashSectionOpen}
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0 shadow-inner">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                    Pago Directo en el Colegio
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-white">
                    Pagar en Efectivo en el Colegio ($10k o $18k)
                  </h3>
                  <p className="text-xs text-emerald-100/70 mt-0.5">
                    {cashSectionOpen ? 'Toca para contraer' : 'Toca para desplegar instrucciones y activación'}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                {cashSectionOpen ? (
                  <ChevronUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </button>

            {/* Contenido desplegable suave con animación fluida */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                cashSectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 sm:p-8 pt-0 border-t border-emerald-500/20">
                  <p className="text-xs sm:text-sm text-emerald-100/80 mb-5 leading-relaxed pt-4">
                    Sin comisiones bancarias ni tarjetas. Entrega el dinero en físico a la coordinación del evento y recibe tu código oficial de 6 dígitos.
                  </p>

                  {/* Pasos para el pago */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-3 mb-6">
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      Pasos para Pago en Efectivo:
                    </h4>
                    <ol className="list-decimal pl-4 space-y-2 text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                      <li>
                        Acércate a la <strong>Coordinación del Evento</strong> en el colegio o comunícate vía WhatsApp al <span className="text-emerald-300 font-bold">+57 321 832 2388</span>.
                      </li>
                      <li>
                        Entrega el valor de tu licencia: <strong>$10.000 COP</strong> (Estándar) o <strong>$18.000 COP</strong> (Premium).
                      </li>
                      <li>
                        Indica el nombre exacto de tu stand. El organizador generará tu <strong className="text-cyan-300">Código Oficial de 6 dígitos</strong>.
                      </li>
                      <li>
                        Presiona el botón <strong>«Activar Stand con Código (6 Dígitos)»</strong>, escribe tu stand y la clave para desbloquear el punto de venta.
                      </li>
                    </ol>
                  </div>

                  {/* Acciones: WhatsApp + Único Botón de Activación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <a
                      href="https://wa.me/573218322388?text=%C2%A1Hola!%20Quiero%20pagar%20mi%20licencia%20de%20Mi%20Feria%20en%20efectivo%20en%20el%20colegio.%20Mi%20stand%20es:%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Coordinar Pago por WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenActivation()}
                      className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-95 text-black font-black text-xs tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                    >
                      <Key className="w-4 h-4" />
                      <span>Activar Stand con Código (6 Dígitos)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Comparativa de Planes */}
        <div className="mt-16 max-w-4xl mx-auto overflow-hidden rounded-3xl border border-[#1f1f23] bg-[#0c0c0e]">
          <div className="p-5 border-b border-[#1f1f23] bg-black/40">
            <h3 className="font-bold text-base text-white">Tabla Comparativa Detallada</h3>
            <p className="text-xs text-gray-400">Compara las capacidades entre ambas versiones</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-3.5">Funcionalidad</th>
                  <th className="p-3.5 text-center">Mi Feria Estándar</th>
                  <th className="p-3.5 text-center text-cyan-400 font-bold">Mi Feria Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3.5 font-medium">Funcionamiento 100% Offline (Sin datos)</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Panel Táctil de Ventas Rápidas</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Balance Financiero & ROI en Vivo</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Función Deshacer Venta / Blindaje Contable</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Reporte de Cierre en archivo .TXT</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                  <td className="p-3.5 text-center text-cyan-400 font-bold">Sí</td>
                </tr>
                <tr className="bg-cyan-500/5">
                  <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Acta Oficial de Cierre para Imprimir / PDF
                  </td>
                  <td className="p-3.5 text-center text-gray-500">No</td>
                  <td className="p-3.5 text-center text-cyan-400 font-extrabold">Sí (Exclusivo)</td>
                </tr>
                <tr className="bg-cyan-500/5">
                  <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    Calculadora de Vuelto Inteligente con Billetes
                  </td>
                  <td className="p-3.5 text-center text-gray-500">No</td>
                  <td className="p-3.5 text-center text-cyan-400 font-extrabold">Sí (Exclusivo)</td>
                </tr>
                <tr className="bg-cyan-500/5">
                  <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                    Caja de Gastos Extras e Imprevistos
                  </td>
                  <td className="p-3.5 text-center text-gray-500">No</td>
                  <td className="p-3.5 text-center text-cyan-400 font-extrabold">Sí (Exclusivo)</td>
                </tr>
                <tr className="bg-cyan-500/5">
                  <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Registro de Integrantes en Reportes Formales
                  </td>
                  <td className="p-3.5 text-center text-gray-500">No</td>
                  <td className="p-3.5 text-center text-cyan-400 font-extrabold">Sí (Exclusivo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guía de Funcionamiento: Los 9 Módulos */}
      <section id="modulos" className="py-16 px-4 max-w-6xl mx-auto border-b border-white/5 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            Tour del Software
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">
            Guía de Funcionamiento: Los 9 Módulos
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mt-2">
            Diseñado desde cero para que cualquier estudiante domine el sistema en menos de 60 segundos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {modules.map((m, index) => {
            const Icon = m.icon;
            const isSelected = activeModule === index;
            return (
              <div
                key={m.id}
                onClick={() => setActiveModule(index)}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c0c14] border-cyan-500/60 shadow-xl shadow-cyan-950/30'
                    : 'bg-[#0c0c0e] border-[#1f1f23] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 ${m.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 font-bold">
                    MOD 0{m.id}
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white mb-1">{m.title}</h3>
                <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section id="faqs" className="py-16 px-4 max-w-3xl mx-auto border-b border-white/5 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            Centro de Ayuda
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq((prev) => (prev === idx ? null : idx))}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer select-none touch-manipulation"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-xs sm:text-sm text-white leading-snug">{faq.q}</span>
                  <div className="p-1 rounded-lg bg-white/5 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {/* Contenido FAQ con transición suave y pausada */}
                <div
                  className={`grid transition-all duration-400 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="py-8 px-4 max-w-6xl mx-auto text-center text-xs text-gray-500 border-t border-white/5">
        <div 
          onClick={handleSecretAdminTrigger}
          className="inline-flex items-center justify-center gap-2 cursor-pointer select-none touch-manipulation active:scale-95 transition-transform"
          title="Mi Feria"
        >
          <img src="/icon.svg" alt="Mi Feria" className="w-5 h-5 rounded-md" />
          <span className="font-semibold text-gray-400 hover:text-gray-300 transition-colors">
            Mi Feria © {new Date().getFullYear()} • Sistema de Gestión y Ventas
          </span>
        </div>
      </footer>

      {/* Modal Generador de Claves Físicas para Darwin */}
      <AdminKeyModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
};
