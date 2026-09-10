import React from 'react';
import { FileText, Printer, Download, X, CheckCircle, AlertTriangle, Sparkles, Award } from 'lucide-react';
import { AppState } from '../../types';
import { calculateFinancials, generateStandardReportText } from '../../lib/storage';
import { formatCOP } from '../../lib/crypto';

interface OfficialReportModalProps {
  isOpen: boolean;
  state: AppState;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  state,
  onClose,
}) => {
  if (!isOpen) return null;

  const isPremium = state.config.plan === 'premium';
  const fin = calculateFinancials(state);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // Verdict calculation
  const verdictText =
    fin.netProfit > 0
      ? 'PROYECTO RENTABLE (+)'
      : fin.netProfit === 0
      ? 'EQUILIBRIO FINANCIERO (0)'
      : 'POR RECUPERAR INVERSIÓN (-)';

  const verdictBadgeColor =
    fin.netProfit >= 0
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/40';

  // Standard txt download
  const handleDownloadTxt = () => {
    const text = generateStandardReportText(state);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${state.config.projectName.replace(/\s+/g, '_')}_${state.config.standId || 'STAND'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe Print trigger without popup blocking
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0c0c0e] border border-cyan-500/40 text-white shadow-2xl overflow-hidden">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121218] no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                {isPremium ? 'Acta de Cierre Oficial (Premium)' : 'Reporte de Balance (Estándar)'}
              </span>
              <h3 className="text-base font-black">
                {isPremium ? 'Acta Ejecutiva de Calificación' : 'Resumen Financiero del Stand'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / Viewable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-100 bg-white text-slate-900 dark:bg-[#0c0c0e] dark:text-slate-100 print:text-black print:bg-white print:p-0">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-300 dark:border-cyan-500/30 print:border-black pb-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-500 dark:text-cyan-400 print:text-black block mb-0.5">
                REPÚBLICA DE COLOMBIA — FERIA DE EMPRENDIMIENTO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                ACTA OFICIAL DE CIERRE
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 print:text-gray-700 mt-0.5 font-medium">
                {state.config.institutionName || 'Institución Educativa'}
              </p>
            </div>

            <div className="mt-3 sm:mt-0 sm:text-right">
              <div className="inline-block sm:block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:border-black text-[11px] font-mono">
                <span className="text-gray-500 print:text-black">STAND ID: </span>
                <strong className="text-cyan-600 dark:text-cyan-300 print:text-black">
                  {state.config.standId || 'OFICIAL'}
                </strong>
              </div>
              <p className="text-[10px] text-gray-500 print:text-black mt-1 capitalize">
                {dateFormatted} • {timeFormatted}
              </p>
            </div>
          </div>

          {/* Project & Team Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 print:border print:border-black print:bg-white text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold">
                Nombre del Stand / Proyecto
              </span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                {state.config.projectName}
              </strong>
            </div>

            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold">
                Titular Responsable
              </span>
              <span className="font-semibold text-slate-800 dark:text-gray-200 print:text-black">
                {state.config.ownerName || 'Equipo General'}
              </span>
            </div>

            {isPremium && state.config.teamMembers?.length > 0 && (
              <div className="sm:col-span-2 pt-1 border-t border-slate-200 dark:border-white/5 print:border-black">
                <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold mb-1">
                  Integrantes Evaluados
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {state.config.teamMembers.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 print:border print:border-black text-[11px] text-slate-700 dark:text-slate-300 print:text-black font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumen Financiero Auditado */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 print:text-black mb-2 flex items-center justify-between">
              <span>Resumen Financiero Auditado</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${verdictBadgeColor} print:border-black print:text-black`}>
                {verdictText}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:border print:border-black">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 print:text-black block mb-0.5">
                  Inversión Inicial
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-800 dark:text-white print:text-black">
                  {formatCOP(fin.investment)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:border print:border-black">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 print:text-black block mb-0.5">
                  Gastos Extras
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-rose-600 dark:text-rose-400 print:text-black">
                  -{formatCOP(fin.totalExpenses)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:border print:border-black">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 print:text-black block mb-0.5">
                  Total en Caja (Bruto)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-cyan-600 dark:text-cyan-400 print:text-black">
                  {formatCOP(fin.totalSales)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:border print:border-black">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 print:text-black block mb-0.5">
                  Ganancia Neta (ROI)
                </span>
                <span className={`text-sm sm:text-base font-black font-mono ${fin.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} print:text-black`}>
                  {formatCOP(fin.netProfit)} ({fin.roi.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Control de Inventario */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 print:text-black mb-2">
              Control de Inventario y Ventas por Producto
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 print:border-black">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 print:border-black text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 print:text-black">
                  <tr>
                    <th className="p-2.5">Producto</th>
                    <th className="p-2.5 text-right">P. Unitario</th>
                    <th className="p-2.5 text-center">Stock Inicial</th>
                    <th className="p-2.5 text-center">Vendidas</th>
                    <th className="p-2.5 text-center">Sobrantes</th>
                    <th className="p-2.5 text-right">Recaudado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 print:divide-black">
                  {fin.productStockStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-white print:text-black">
                        {item.product.name}
                      </td>
                      <td className="p-2.5 text-right font-mono text-gray-600 dark:text-gray-300 print:text-black">
                        {formatCOP(item.product.price)}
                      </td>
                      <td className="p-2.5 text-center font-mono">{item.product.initialStock}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400 print:text-black">
                        {item.sold}
                      </td>
                      <td className="p-2.5 text-center font-mono text-gray-500 print:text-black">
                        {item.remaining}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-800 dark:text-white print:text-black">
                        {formatCOP(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {fin.starProduct && (
              <div className="mt-2 text-[11px] p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 print:border print:border-black flex items-center justify-between text-slate-800 dark:text-cyan-200 print:text-black">
                <span className="flex items-center gap-1.5 font-bold">
                  <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Producto Estrella de la Jornada:
                </span>
                <span className="font-semibold">
                  {fin.starProduct.product.name} ({fin.starProduct.sold} uds vendidas • {formatCOP(fin.starProduct.revenue)})
                </span>
              </div>
            )}
          </div>

          {/* Firmas de Sustentación Oficial (Para evaluación de docentes) */}
          <div className="pt-8 border-t border-slate-300 dark:border-white/10 print:border-black grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 dark:border-white/30 print:border-black w-4/5 mx-auto mb-2 h-10" />
              <span className="font-bold text-slate-900 dark:text-white print:text-black block">
                Firma Estudiante Líder / Cajero
              </span>
              <span className="text-[10px] text-gray-500 print:text-black">Responsable de Caja</span>
            </div>

            <div>
              <div className="border-b border-slate-400 dark:border-white/30 print:border-black w-4/5 mx-auto mb-2 h-10" />
              <span className="font-bold text-slate-900 dark:text-white print:text-black block">
                Firma Docente Evaluador
              </span>
              <span className="text-[10px] text-gray-500 print:text-black">Calificación Oficial</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer (Hidden in Print) */}
        <div className="p-4 border-t border-white/10 bg-[#121218] flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="text-[11px] text-gray-400">
            {isPremium ? 'Listo para imprimir o guardar como PDF' : 'Versión Estándar: Descarga en texto plano'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .TXT</span>
            </button>

            {isPremium && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
