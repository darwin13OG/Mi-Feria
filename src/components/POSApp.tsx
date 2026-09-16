import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Receipt,
  Calculator,
  FileText,
  Settings,
  Share2,
  Lock,
  Sparkles,
  Copy,
  Check,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Layers,
  Printer,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppState, PlanType, Product, SaleSnapshot, Expense, StandConfig } from '../types';
import {
  loadStoredState,
  saveStoredState,
  calculateFinancials,
  generateWhatsAppSummary,
  resetStoredState,
  generateStandardReportText,
} from '../lib/storage';
import { formatCOP, formatNumberMask, parseMaskedNumber } from '../lib/crypto';
import { playBeep, playCashRegister, playSuccess, playWarning, isAudioMuted, setAudioMuted } from '../lib/audio';
import { ChangeCalculatorModal } from './pos/ChangeCalculatorModal';
import { UpgradeModal } from './pos/UpgradeModal';
import { ThemeToggle } from './ThemeToggle';
import { InstallAppButton } from './InstallAppButton';
import confetti from 'canvas-confetti';

interface POSAppProps {
  onBackToLanding: () => void;
  onOpenLicenseModal: () => void;
}

type TabType = 'ventas' | 'balance' | 'gastos' | 'config' | 'reporte';

export const POSApp: React.FC<POSAppProps> = ({ onBackToLanding, onOpenLicenseModal }) => {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<TabType>('ventas');

  // Fast Cashier POS State
  const [quantity, setQuantity] = useState<number>(1);
  const [lastSaleFeedback, setLastSaleFeedback] = useState<string | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Audio and Demo Setup State
  const [soundMuted, setSoundMuted] = useState<boolean>(() => isAudioMuted());
  const [showClearDemoModal, setShowClearDemoModal] = useState(false);
  const [setupStandName, setSetupStandName] = useState(state.config.projectName || '');
  const [setupInvestmentStr, setSetupInvestmentStr] = useState(
    state.config.initialInvestment ? formatNumberMask(state.config.initialInvestment) : ''
  );

  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://') ||
    new URLSearchParams(window.location.search).get('app') === 'pos' ||
    new URLSearchParams(window.location.search).get('view') === 'pos'
  );

  const toggleAudio = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setAudioMuted(next);
    if (!next) {
      playBeep();
    }
  };

  const handleClearDemoAndStartReal = () => {
    const inv = parseMaskedNumber(configInvStr);
    const updatedName = configStand.trim() || 'Mi Stand';

    setState((prev) => {
      const updated: AppState = {
        ...prev,
        sales: [],
        expenses: [],
        config: {
          ...prev.config,
          projectName: updatedName,
          initialInvestment: inv,
          isConfigured: true,
        },
      };
      saveStoredState(updated);
      return updated;
    });

    playSuccess();
    confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
    setShowClearDemoModal(false);
    setActiveTab('ventas');
    setLastSaleFeedback('✨ ¡Stand configurado! Ventas de prueba eliminadas y caja en $0.');
    setTimeout(() => setLastSaleFeedback(null), 3000);
  };

  const handleUpgradeSuccess = () => {
    setState((prev) => {
      const updated: AppState = {
        ...prev,
        config: {
          ...prev.config,
          plan: 'premium' as PlanType,
        },
      };
      saveStoredState(updated);
      return updated;
    });
    setLastSaleFeedback('⭐ ¡Plan Premium Desbloqueado con Éxito!');
    setTimeout(() => setLastSaleFeedback(null), 3000);
  };

  // New Expense form state
  const [newExpenseConcept, setNewExpenseConcept] = useState('');
  const [newExpenseAmountStr, setNewExpenseAmountStr] = useState('');

  // Config tab form state (mirroring inputs)
  const [configStand, setConfigStand] = useState(state.config.projectName || '');
  const [configTeam, setConfigTeam] = useState(state.config.teamMembers?.join(', ') || '');
  const [configInvStr, setConfigInvStr] = useState(formatNumberMask(state.config.initialInvestment || 100000));
  const [configStock, setConfigStock] = useState<number>(
    state.config.products.reduce((sum, p) => sum + p.initialStock, 0) || 50
  );

  // Save changes to localStorage
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  const financials = calculateFinancials(state);
  const isPremium = state.config.plan === 'premium';

  // Break-even celebration
  useEffect(() => {
    if (financials.isProfitable && state.sales.length > 0) {
      const prevCelebrated = localStorage.getItem('mi_feria_celebrated_profit') === 'true';
      if (!prevCelebrated) {
        localStorage.setItem('mi_feria_celebrated_profit', 'true');
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [financials.isProfitable, state.sales.length]);

  // Handle Instant One-Touch Sale
  const handleRegisterSale = (product: Product) => {
    const soldSoFar = state.sales
      .filter((s) => s.productId === product.id)
      .reduce((sum, s) => sum + s.c, 0);
    const remaining = Math.max(0, product.initialStock - soldSoFar);

    if (remaining <= 0) {
      playWarning();
      setLastSaleFeedback(`¡Alerta! ${product.name} agotado.`);
      setTimeout(() => setLastSaleFeedback(null), 2500);
      return;
    }

    const qtyToSell = Math.min(quantity, remaining);
    const subtotal = product.price * qtyToSell;

    const newSale: SaleSnapshot = {
      id: 'sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      productId: product.id,
      n: product.name,
      p: product.price,
      c: qtyToSell,
      subtotal,
      t: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      sales: [newSale, ...prev.sales],
    }));

    playCashRegister();
    setCalcAmount(subtotal);
    setLastSaleFeedback(`+ ${formatCOP(subtotal)} (${qtyToSell}x ${product.name})`);
    setTimeout(() => setLastSaleFeedback(null), 2000);
    setQuantity(1);
  };

  // Undo Last Sale
  const handleUndoLastSale = () => {
    if (state.sales.length === 0) return;
    const last = state.sales[0];
    setState((prev) => ({
      ...prev,
      sales: prev.sales.slice(1),
    }));
    playWarning();
    setLastSaleFeedback(`↩ Anulado: ${last.c}x ${last.n}`);
    setTimeout(() => setLastSaleFeedback(null), 2500);
  };

  // Add Extra Expense (Premium)
  const handleAddExpense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseMaskedNumber(newExpenseAmountStr);
    if (!newExpenseConcept.trim() || amount <= 0) return;

    const exp: Expense = {
      id: 'exp_' + Date.now(),
      concept: newExpenseConcept.trim().toUpperCase(),
      amount,
      t: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      expenses: [exp, ...prev.expenses],
    }));

    setNewExpenseConcept('');
    setNewExpenseAmountStr('');
  };

  const handleRemoveExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Update Config on the fly
  const handleUpdateStandInfo = (
    name?: string,
    team?: string,
    invStr?: string,
    numProducts?: number
  ) => {
    const updatedStandName = name !== undefined ? name : configStand;
    const updatedTeamStr = team !== undefined ? team : configTeam;
    const updatedInv = invStr !== undefined ? parseMaskedNumber(invStr) : parseMaskedNumber(configInvStr);

    let updatedProducts = [...state.config.products];
    if (numProducts !== undefined && numProducts > 0) {
      if (numProducts > updatedProducts.length) {
        for (let i = updatedProducts.length; i < numProducts; i++) {
          updatedProducts.push({
            id: 'prod_' + (i + 1),
            name: `PRODUCTO ${i + 1}`,
            price: 5000,
            initialStock: 30,
          });
        }
      } else if (numProducts < updatedProducts.length) {
        updatedProducts = updatedProducts.slice(0, numProducts);
      }
    }

    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        projectName: updatedStandName.toUpperCase(),
        teamMembers: updatedTeamStr
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        initialInvestment: updatedInv,
        products: updatedProducts,
      },
    }));
  };

  // Product field updater
  const handleProductChange = (index: number, field: keyof Product, val: any) => {
    const updated = [...state.config.products];
    if (field === 'price' || field === 'initialStock') {
      const num = parseMaskedNumber(String(val));
      updated[index] = { ...updated[index], [field]: num };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, products: updated },
    }));
  };

  // Reset Session
  const handleResetSession = () => {
    resetStoredState();
    setState(loadStoredState());
    setShowResetConfirm(false);
    localStorage.removeItem('mi_feria_celebrated_profit');
  };

  // Download standard report
  const handleDownloadTxt = () => {
    const text = generateStandardReportText(state);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${state.config.projectName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pos-theme-screen bg-[#000000] text-slate-100 flex flex-col items-center justify-start p-0 sm:p-3 selection:bg-cyan-500/30 transition-colors">
      {/* Mobile Shell (< 480px, compact and clean) */}
      <div className="w-full sm:max-w-[460px] min-h-screen sm:min-h-[94vh] flex flex-col pos-theme-shell bg-[#050505] sm:rounded-[36px] sm:border sm:border-[#1f1f23] sm:shadow-2xl overflow-hidden relative transition-colors">
        {/* COMPACT APP HEADER */}
        <header className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-[#1f1f23] pos-theme-header bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Dynamic Plan Logo: Gold for Premium, Blue for Standard */}
            <img
              src={isPremium ? '/logo-premium.png' : '/logo-standard.png'}
              alt={isPremium ? 'Mi Feria Premium' : 'Mi Feria Estándar'}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain p-0.5 border shadow-sm shrink-0 ${
                isPremium
                  ? 'border-amber-400/50 bg-amber-50 dark:bg-[#0c0903] shadow-amber-500/20'
                  : 'border-cyan-400/50 bg-cyan-50 dark:bg-[#040812] shadow-cyan-500/20'
              }`}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-xs sm:text-sm pos-theme-text-title text-slate-900 dark:text-white tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                  {state.config.projectName || 'Mi Stand'}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0 border ${
                    isPremium
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  }`}
                >
                  {isPremium ? 'Premium' : 'Estándar'}
                </span>
              </div>
              <span className="text-[10px] pos-theme-text-muted text-slate-500 dark:text-gray-400 block truncate">
                {state.config.standId || 'STAND'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sound Mute/Unmute Toggle Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 active:scale-95 transition-all cursor-pointer"
              title={soundMuted ? 'Activar Sonidos' : 'Silenciar Sonidos'}
              aria-label={soundMuted ? 'Activar Sonidos' : 'Silenciar Sonidos'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
            </button>

            {/* Botón Instalar App */}
            <InstallAppButton variant="header" />

            <ThemeToggle className="scale-85" />
          </div>
        </header>

        {/* DEMO MODE WARNING BANNER */}
        {!state.config.isConfigured && (
          <div className="bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-amber-500/25 border-b border-amber-500/40 px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-inner z-15 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-[11px] leading-tight">
                <strong>Modo Ejemplo:</strong> Datos de prueba activos.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('config');
                playBeep();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-[10px] uppercase tracking-wider shrink-0 transition-all shadow-md shadow-amber-500/30 cursor-pointer touch-manipulation flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Configurar en Tuerca</span>
            </button>
          </div>
        )}

        {/* FEEDBACK TOAST NOTIFICATION */}
        {lastSaleFeedback && (
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold py-1.5 px-4 text-center shadow-lg animate-in slide-in-from-top-2 flex items-center justify-center gap-1.5 z-10">
            <span>{lastSaleFeedback}</span>
          </div>
        )}

        {/* DYNAMIC SEGMENTED TABS */}
        <div className="grid grid-cols-5 p-1.5 pos-theme-tabs bg-[#0c0c0e] border-b border-[#1f1f23] gap-1 shrink-0 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('ventas')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'ventas'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ventas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'balance'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Balance</span>
          </button>

          {isPremium ? (
            <button
              type="button"
              onClick={() => setActiveTab('gastos')}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 relative ${
                activeTab === 'gastos'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos</span>
              {state.expenses.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsUpgradeOpen(true)}
              className="py-2 px-1 rounded-xl text-[11px] font-medium text-slate-400 dark:text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-300 flex flex-col items-center gap-0.5"
              title="Desbloquear en Premium"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              <span>Gastos</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'config'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Stand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reporte')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'reporte'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cierre</span>
          </button>
        </div>

        {/* TAB CONTENTS (DESIGNED TO FIT SCREEN WITH ZERO REDUNDANT SCROLL) */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {/* TAB 1: 🛒 VENTAS (PUNTO DE VENTA RÁPIDO) */}
          {activeTab === 'ventas' && (
            <div className="space-y-3 animate-in fade-in">
              {/* Mini ROI & Cash Status Strip */}
              <div className="p-3 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Utilidad Neta</span>
                  <span
                    className={`font-black font-mono text-sm ${
                      financials.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCOP(financials.netProfit)}
                  </span>
                </div>

                <div className="flex-1 mx-3 text-center">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-gray-400 mb-1">
                    <span>Meta ROI</span>
                    <span className="font-mono text-cyan-400">{financials.progressRatio.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        financials.isProfitable
                          ? 'bg-emerald-400'
                          : financials.progressRatio >= 70
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${financials.progressRatio}%` }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Vendidas</span>
                  <span className="font-bold font-mono pos-theme-text-title text-white text-sm">
                    {financials.totalUnitsSold} uds
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between gap-1 p-1.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-2">
                  Cant:
                </span>
                <div className="flex items-center gap-1 flex-1">
                  {[1, 2, 3, 4, 5, 6].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`flex-1 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                        quantity === q
                          ? 'bg-cyan-500 text-black font-black'
                          : 'bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-white/10'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tactile Products Grid */}
              <div className="grid grid-cols-2 gap-2">
                {state.config.products.map((p) => {
                  const soldSoFar = state.sales
                    .filter((s) => s.productId === p.id)
                    .reduce((sum, s) => sum + s.c, 0);
                  const remaining = Math.max(0, p.initialStock - soldSoFar);
                  const isOutOfStock = remaining <= 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleRegisterSale(p)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 select-none min-h-[90px] ${
                        isOutOfStock
                          ? 'bg-black/40 border-white/5 opacity-40 cursor-not-allowed'
                          : 'pos-theme-card bg-[#0c0c0e] border-[#1f1f23] hover:border-cyan-500/50 hover:bg-[#121217]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-xs pos-theme-text-title text-white leading-tight line-clamp-2">
                          {p.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            remaining <= 5 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-gray-400'
                          }`}
                        >
                          {remaining}
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xs font-black font-mono text-cyan-500 dark:text-cyan-400">
                          {formatCOP(p.price)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {quantity > 1 ? `x${quantity}` : '+ Sumar'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Bar (Deshacer & Calculadora de Vuelto) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUndoLastSale}
                  disabled={state.sales.length === 0}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Anular Última Venta</span>
                </button>

                {isPremium ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (calcAmount === 0 && state.sales.length > 0) {
                        setCalcAmount(state.sales[0].subtotal);
                      }
                      setIsCalcOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calcular Vuelto</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUpgradeOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-gray-400" />
                    <span>Vuelto (Premium)</span>
                  </button>
                )}
              </div>

              {/* Recent Sales Mini Ticker */}
              <div className="p-2.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Últimas Ventas ({state.sales.length})
                </span>
                {state.sales.length === 0 ? (
                  <p className="text-[11px] text-gray-500 text-center py-2">
                    Sin ventas aún. Toca un producto arriba para sumar.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {state.sales.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center py-0.5 border-b border-slate-200/50 dark:border-white/5 text-[11px]"
                      >
                        <span className="text-slate-700 dark:text-gray-300 truncate max-w-[180px]">
                          {s.c}x {s.n}
                        </span>
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">+{formatCOP(s.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 📊 BALANCE Y CONTROL FINANCIERO */}
          {activeTab === 'balance' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 rounded-3xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] shadow-lg">
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div className="p-2.5 rounded-2xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block mb-0.5">
                      En Caja (Bruto)
                    </span>
                    <span className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                      {formatCOP(financials.totalSales)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block mb-0.5">
                      Inversión Inicial
                    </span>
                    <span className="text-xl font-black font-mono pos-theme-text-title text-white">
                      {formatCOP(financials.investment)}
                    </span>
                  </div>
                </div>

                {isPremium && financials.totalExpenses > 0 && (
                  <div className="p-2.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                      Gastos Extras Imprevistos
                    </span>
                    <span className="text-base font-black font-mono text-rose-400">
                      -{formatCOP(financials.totalExpenses)}
                    </span>
                  </div>
                )}

                {/* Net Profit Big Box */}
                <div
                  className={`p-4 rounded-2xl border text-center mb-3 ${
                    financials.netProfit >= 0
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-400 dark:text-emerald-300'
                      : 'bg-rose-950/25 border-rose-500/40 text-rose-400 dark:text-rose-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                    Utilidad Neta (Ganancia)
                  </span>
                  <div className="text-3xl font-black font-mono">
                    {formatCOP(financials.netProfit)}
                  </div>
                  <span className="text-[11px] font-bold mt-1 block">
                    ROI: {financials.roi.toFixed(1)}%
                  </span>
                </div>

                {/* Status Message */}
                <div className="p-3 rounded-xl pos-theme-card-subtle bg-black/40 border border-slate-200/50 dark:border-white/5 text-center text-xs font-bold">
                  {financials.isProfitable ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡META LOGRADA! Proyecto con rentabilidad positiva.
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      Faltan {formatCOP(financials.missingToBreakEven)} para recuperar la inversión.
                    </span>
                  )}
                </div>
              </div>

              {/* Star product */}
              {financials.starProduct && (
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Award className="w-4 h-4 text-cyan-400" />
                    Producto Estrella:
                  </span>
                  <span className="font-bold text-white">
                    {financials.starProduct.product.name} ({financials.starProduct.sold} uds)
                  </span>
                </div>
              )}

              {/* Share & WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const encoded = generateWhatsAppSummary(state);
                    window.open(`https://wa.me/?text=${encoded}`, '_blank');
                  }}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const fin = financials;
                    const summary =
                      `📊 RESUMEN FERIA: ${state.config.projectName}\n` +
                      `💰 Caja: ${formatCOP(fin.totalSales)}\n` +
                      `📈 Ganancia Neta: ${formatCOP(fin.netProfit)} (ROI: ${fin.roi.toFixed(1)}%)\n` +
                      `📦 Vendidas: ${fin.totalUnitsSold} uds`;
                    navigator.clipboard.writeText(summary);
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2000);
                  }}
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShare ? '¡Copiado!' : 'Copiar Balance'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 💸 GASTOS EXTRAS (EXCLUSIVO PREMIUM) */}
          {activeTab === 'gastos' && isPremium && (
            <div className="space-y-3 animate-in fade-in">
              <form onSubmit={handleAddExpense} className="p-3.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] space-y-2.5 text-xs">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Registrar Gasto Extra / Imprevisto
                </span>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={newExpenseConcept}
                    onChange={(e) => setNewExpenseConcept(e.target.value)}
                    placeholder="Concepto (ej. Hielo)"
                    className="flex-1 px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    required
                    value={newExpenseAmountStr}
                    onChange={(e) => setNewExpenseAmountStr(formatNumberMask(e.target.value))}
                    placeholder="Valor ($)"
                    className="w-24 px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1">
                  {['Hielo', 'Bolsas', 'Vasos', 'Transporte'].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setNewExpenseConcept(sugg)}
                      className="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 text-[10px] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </form>

              {/* List of registered expenses */}
              <div className="p-3.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Egresos Registrados
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    Total: -{formatCOP(financials.totalExpenses)}
                  </span>
                </div>

                {state.expenses.length === 0 ? (
                  <p className="text-[11px] text-gray-500 text-center py-4">
                    No has registrado gastos extras aún.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {state.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2 rounded-xl pos-theme-card-subtle bg-black/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="pos-theme-text-title text-white font-semibold">{exp.concept}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-400">
                            -{formatCOP(exp.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExpense(exp.id)}
                            className="text-gray-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ⚙️ CONFIGURACIÓN DEL STAND */}
          {activeTab === 'config' && (
            <div className="space-y-3 animate-in fade-in text-xs">
              {/* Banner Oficial de la App */}
              <div className="flex justify-center py-1">
                <img
                  src="/banner-miferia.png"
                  alt="Mi Feria - Punto de Venta Escolar"
                  className="h-10 w-auto object-contain rounded-xl"
                />
              </div>

              {/* Alerta de Modo Ejemplo con Limpieza de Ventas de Prueba */}
              {!state.config.isConfigured && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 space-y-2.5 shadow-lg shadow-amber-950/20">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                    <span>Estás usando el Stand de Ejemplo</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Personaliza aquí abajo el nombre de tu stand y tus productos. Al presionar este botón, se borrarán las ventas de prueba y tu caja quedará en $0 lista para tu feria real.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearDemoAndStartReal}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Borrar Ventas de Prueba e Iniciar Stand Real</span>
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Parámetros del Stand
                </span>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    value={configStand}
                    onChange={(e) => {
                      setConfigStand(e.target.value);
                      handleUpdateStandInfo(e.target.value);
                    }}
                    placeholder="NOMBRE DEL STAND"
                    className="w-full px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {isPremium && (
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Integrantes del Equipo (Separados por coma)
                    </label>
                    <input
                      type="text"
                      value={configTeam}
                      onChange={(e) => {
                        setConfigTeam(e.target.value);
                        handleUpdateStandInfo(undefined, e.target.value);
                      }}
                      placeholder="Camilo, Andrea, Felipe..."
                      className="w-full px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Inversión Inicial ($)
                    </label>
                    <input
                      type="text"
                      value={configInvStr}
                      onChange={(e) => {
                        const mask = formatNumberMask(e.target.value);
                        setConfigInvStr(mask);
                        handleUpdateStandInfo(undefined, undefined, mask);
                      }}
                      placeholder="100.000"
                      className="w-full px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Num. Productos
                    </label>
                    <select
                      value={state.config.products.length}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        handleUpdateStandInfo(undefined, undefined, undefined, num);
                      }}
                      className="w-full px-3 py-2 rounded-xl pos-theme-input bg-black/70 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="1">1 Producto</option>
                      <option value="2">2 Productos</option>
                      <option value="3">3 Productos</option>
                      <option value="4">4 Productos</option>
                      <option value="5">5 Productos</option>
                      <option value="6">6 Productos</option>
                      <option value="8">8 Productos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Products Inputs */}
              <div className="p-3.5 rounded-2xl pos-theme-card bg-[#0c0c0e] border border-[#1f1f23] space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                  Catálogo de Productos ({state.config.products.length})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {state.config.products.map((p, idx) => (
                    <div key={p.id} className="p-2 rounded-xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10 space-y-1.5">
                      <div className="flex gap-1.5">
                        <span className="w-5 h-5 rounded bg-slate-200/60 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleProductChange(idx, 'name', e.target.value.toUpperCase())}
                          placeholder="Nombre del producto"
                          className="flex-1 px-2.5 py-1 rounded-lg pos-theme-input bg-black/70 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-6">
                        <div>
                          <span className="text-[9px] text-gray-500 block">Precio ($)</span>
                          <input
                            type="text"
                            value={formatNumberMask(p.price)}
                            onChange={(e) => handleProductChange(idx, 'price', e.target.value)}
                            placeholder="5.000"
                            className="w-full px-2 py-1 rounded-lg pos-theme-input bg-black/70 border border-slate-300 dark:border-white/10 text-xs font-mono text-cyan-600 dark:text-cyan-300 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block">Stock Inicial (uds)</span>
                          <input
                            type="number"
                            value={p.initialStock}
                            onChange={(e) => handleProductChange(idx, 'initialStock', e.target.value)}
                            placeholder="30"
                            className="w-full px-2 py-1 rounded-lg pos-theme-input bg-black/70 border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opción para Instalar App en Pantalla de Inicio */}
              <InstallAppButton variant="card" />

              {/* Exit & Reset Session Section */}
              <div className="text-center pt-2 space-y-2.5">
                {!isPWA && (
                  <button
                    type="button"
                    onClick={onBackToLanding}
                    className="w-full py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Salir al Portal Principal</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-rose-500 dark:text-rose-400 hover:underline block mx-auto pt-1 cursor-pointer"
                >
                  Borrar datos y reiniciar stand
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: 📋 CIERRE Y REPORTE OFICIAL */}
          {activeTab === 'reporte' && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-4 rounded-3xl pos-theme-card bg-[#0c0c0e] border border-cyan-500/30 text-center space-y-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 inline-block mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-black text-sm uppercase pos-theme-text-title text-white">
                  {isPremium ? 'Acta de Cierre Oficial (PDF)' : 'Reporte de Stand (.TXT)'}
                </h3>
                <p className="text-[11px] pos-theme-text-muted text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {isPremium
                    ? 'Genera el documento formal con notas, balance auditado y firmas para entregarle al profesor evaluador.'
                    : 'Descarga un archivo de texto con el resumen completo de caja e inventario.'}
                </p>

                {/* Inventory Snapshot Table */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10">
                    <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Vendidas</span>
                    <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">{financials.totalUnitsSold}</span>
                  </div>
                  <div className="p-2.5 rounded-xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10">
                    <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Sobrantes</span>
                    <span className="font-mono font-bold text-sm pos-theme-text-title text-gray-300">
                      {financials.productStockStats.reduce((sum, p) => sum + p.remaining, 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl pos-theme-card-subtle bg-black/50 border border-slate-200/50 dark:border-white/10">
                    <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-400 block">ROI</span>
                    <span className="font-mono font-bold text-sm text-emerald-500 dark:text-emerald-400">{financials.roi.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {isPremium ? (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Acta Oficial / Guardar PDF</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadTxt}
                        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-xs shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Reporte (.TXT)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsUpgradeOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Desbloquear Acta en PDF y Firmas (Premium)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-[#0c0c0e] border border-rose-300 dark:border-rose-500/40 p-5 text-slate-900 dark:text-white shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">¿Borrar todos los datos y reiniciar?</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Esta acción es irreversible y dejará el stand en blanco para una nueva jornada.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetSession}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-600/20"
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Demo & Setup Real Stand Modal */}
      {showClearDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0c0c0e] border border-amber-300 dark:border-amber-500/50 p-5 text-slate-900 dark:text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">Configurar mi Stand Real</h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">Elimina datos de prueba y deja tu caja en ceros</p>
              </div>
            </div>

            <p className="text-xs text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-200 dark:border-amber-500/20 leading-relaxed">
              Al confirmar, las ventas de prueba se borrarán y tu stand quedará listo para tu feria real.
            </p>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 block mb-1">
                  Nombre de tu Stand / Negocio:
                </label>
                <input
                  type="text"
                  value={setupStandName}
                  onChange={(e) => setSetupStandName(e.target.value)}
                  placeholder="Ej: Delicias Caseras, Arte & Diseño"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 block mb-1">
                  Costo de Stand o Inversión Inicial (COP):
                </label>
                <input
                  type="text"
                  value={setupInvestmentStr}
                  onChange={(e) => setSetupInvestmentStr(formatNumberMask(e.target.value))}
                  placeholder="Ej: 50.000"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs font-mono text-amber-700 dark:text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearDemoModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearDemoAndStartReal}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Iniciar Stand Real
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Calculator Modal */}
      <ChangeCalculatorModal
        isOpen={isCalcOpen}
        totalToPay={calcAmount}
        onClose={() => setIsCalcOpen(false)}
      />

      {/* Premium Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        standName={state.config.projectName || state.config.ownerName || 'MI STAND'}
        onClose={() => setIsUpgradeOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};
