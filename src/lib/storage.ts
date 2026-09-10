import { AppState, PlanType, Product, SaleSnapshot } from '../types';
import { formatCOP } from './crypto';

const STORAGE_KEY = 'mi_feria_app_state_v2';

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Combo Especial', price: 8000, initialStock: 30 },
  { id: 'p2', name: 'Producto Individual', price: 4000, initialStock: 50 },
  { id: 'p3', name: 'Bebida Refrescante', price: 3000, initialStock: 40 },
];

export const INITIAL_STATE: AppState = {
  config: {
    projectName: 'Emprendimiento Mi Feria',
    institutionName: 'Colegio / Institución Educativa',
    teamMembers: ['Estudiante Líder', 'Finanzas / Caja'],
    initialInvestment: 120000,
    products: DEFAULT_PRODUCTS,
    plan: 'premium',
    ownerName: '',
    standId: '',
    licenseKey: '',
    isConfigured: false,
  },
  sales: [],
  expenses: [],
  isLocked: false,
};

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      config: {
        ...INITIAL_STATE.config,
        ...(parsed.config || {}),
        products: parsed.config?.products?.length ? parsed.config.products : DEFAULT_PRODUCTS,
      },
      sales: parsed.sales || [],
      expenses: parsed.expenses || [],
      isLocked: Boolean(parsed.isLocked),
    };
  } catch (err) {
    console.warn('Error loading stored state, using defaults:', err);
    return INITIAL_STATE;
  }
}

export function saveStoredState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state:', err);
  }
}

// Financial calculations
export function calculateFinancials(state: AppState) {
  const totalSales = state.sales.reduce((sum, sale) => sum + sale.subtotal, 0);
  const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const investment = state.config.initialInvestment || 0;
  const netProfit = totalSales - totalExpenses - investment;
  
  // ROI %: (Net Profit / Investment) * 100
  const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
  
  // Progress towards recovering investment: Total Sales / (Investment + Expenses)
  const breakEvenTarget = investment + totalExpenses;
  const progressRatio = breakEvenTarget > 0 ? Math.min(100, Math.max(0, (totalSales / breakEvenTarget) * 100)) : 100;
  const missingToBreakEven = Math.max(0, breakEvenTarget - totalSales);

  // Total units sold
  const totalUnitsSold = state.sales.reduce((sum, sale) => sum + sale.c, 0);

  // Remaining stock calculation per product
  const productStockStats = state.config.products.map((p) => {
    const sold = state.sales
      .filter((s) => s.productId === p.id)
      .reduce((sum, s) => sum + s.c, 0);
    const remaining = Math.max(0, p.initialStock - sold);
    const revenue = state.sales
      .filter((s) => s.productId === p.id)
      .reduce((sum, s) => sum + s.subtotal, 0);
    return {
      product: p,
      sold,
      remaining,
      revenue,
    };
  });

  // Star Product (highest revenue or units sold)
  const starProduct = [...productStockStats].sort((a, b) => b.revenue - a.revenue)[0];

  return {
    totalSales,
    totalExpenses,
    investment,
    netProfit,
    roi,
    progressRatio,
    missingToBreakEven,
    breakEvenTarget,
    totalUnitsSold,
    productStockStats,
    starProduct,
    isProfitable: netProfit > 0,
    isBreakEven: netProfit >= 0,
  };
}

// Structured Text Report Generator for Standard Version
export function generateStandardReportText(state: AppState): string {
  const fin = calculateFinancials(state);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { dateStyle: 'full' });
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const separator = '='.repeat(48);
  const subSeparator = '-'.repeat(48);

  const productLines = fin.productStockStats
    .map(
      (item, i) =>
        ` [${i + 1}] ${item.product.name}\n` +
        `     Precio: ${formatCOP(item.product.price)} | Inicial: ${item.product.initialStock} uds\n` +
        `     Vendidas: ${item.sold} uds | En Stock: ${item.remaining} uds\n` +
        `     Recaudado: ${formatCOP(item.revenue)}`
    )
    .join('\n\n');

  return `
${separator}
            REPORTE OFICIAL MI FERIA
              (Versión Estándar)
${separator}
PROYECTO: ${state.config.projectName}
TITULAR / STAND: ${state.config.ownerName || 'Stand Oficial'} (ID: ${state.config.standId || 'N/A'})
FECHA: ${dateStr} - ${timeStr}
ESTADO: ${fin.isProfitable ? 'PROYECTO RENTABLE (+)' : 'EN RECUPERACION DE CAPITAL (-)'}

${subSeparator}
              BALANCE FINANCIERO EN VIVO
${subSeparator}
 (+) Caja Total Recaudada: ${formatCOP(fin.totalSales)}
 (-) Inversión Inicial:     ${formatCOP(fin.investment)}
 (-) Gastos Extras:         ${formatCOP(fin.totalExpenses)}
------------------------------------------------
 (=) GANANCIA NETA FINAL:   ${formatCOP(fin.netProfit)}
 (*) Retorno de Inv. (ROI): ${fin.roi.toFixed(1)}%
 (*) Total Unidades Vendidas: ${fin.totalUnitsSold} uds

${subSeparator}
               DESGLOSE DE PRODUCTOS
${subSeparator}
${productLines}

${subSeparator}
              RESUMEN DE CIERRE
${subSeparator}
* Producto Estrella: ${fin.starProduct ? `${fin.starProduct.product.name} (${fin.starProduct.sold} uds - ${formatCOP(fin.starProduct.revenue)})` : 'N/A'}
* Veredicto Contable: ${fin.netProfit >= 0 ? 'META SUPERADA CON ÉXITO' : `FALTAN ${formatCOP(fin.missingToBreakEven)} PARA EL EQUILIBRIO`}

Generado con Sistema Offline Mi Feria App.
${separator}
`.trim();
}

// Generate WhatsApp Share Message
export function generateWhatsAppSummary(state: AppState): string {
  const fin = calculateFinancials(state);
  const emojiState = fin.netProfit >= 0 ? '🟢' : '🔴';
  
  return encodeURIComponent(
    `📊 *REPORTE DE VENTAS - MI FERIA*\n` +
    `🏪 *Stand:* ${state.config.projectName}\n` +
    `👤 *Responsable:* ${state.config.ownerName || 'Equipo'}\n\n` +
    `💰 *Caja Total:* ${formatCOP(fin.totalSales)}\n` +
    `💸 *Inversión Inicial:* ${formatCOP(fin.investment)}\n` +
    (state.config.plan === 'premium' ? `🧾 *Gastos Extras:* ${formatCOP(fin.totalExpenses)}\n` : '') +
    `---------------------------\n` +
    `${emojiState} *Ganancia Neta:* ${formatCOP(fin.netProfit)}\n` +
    `📈 *ROI:* ${fin.roi.toFixed(1)}%\n` +
    `📦 *Unidades Vendidas:* ${fin.totalUnitsSold} uds\n` +
    `⭐ *Top Producto:* ${fin.starProduct ? fin.starProduct.product.name : 'N/A'}\n\n` +
    `_Generado al instante desde Mi Feria App (100% Offline)_`
  );
}
