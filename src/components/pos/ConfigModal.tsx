import React, { useState } from 'react';
import { Settings, X, Plus, Trash2, Save, Users, Layers, DollarSign, Check } from 'lucide-react';
import { Product, StandConfig, PlanType } from '../../types';
import { formatNumberMask, parseMaskedNumber } from '../../lib/crypto';

interface ConfigModalProps {
  isOpen: boolean;
  config: StandConfig;
  onClose: () => void;
  onSave: (updatedConfig: StandConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
}) => {
  const [projectName, setProjectName] = useState(config.projectName || '');
  const [institutionName, setInstitutionName] = useState(config.institutionName || '');
  const [investmentStr, setInvestmentStr] = useState(formatNumberMask(config.initialInvestment || 0));
  const [teamMembers, setTeamMembers] = useState<string[]>(
    config.teamMembers?.length ? config.teamMembers : ['Líder de Proyecto', 'Cajero / Ventas']
  );
  const [newMember, setNewMember] = useState('');
  const [products, setProducts] = useState<Product[]>(
    config.products?.length ? config.products : []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isPremium = config.plan === 'premium';

  const handleInvestmentChange = (val: string) => {
    setInvestmentStr(formatNumberMask(val));
  };

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    setTeamMembers([...teamMembers, newMember.trim()]);
    setNewMember('');
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleAddProduct = () => {
    if (products.length >= 8) return;
    const newId = 'prod_' + Date.now();
    setProducts([
      ...products,
      {
        id: newId,
        name: `Producto ${products.length + 1}`,
        price: 5000,
        initialStock: 30,
      },
    ]);
  };

  const handleProductChange = (index: number, field: keyof Product, val: any) => {
    const updated = [...products];
    if (field === 'price' || field === 'initialStock') {
      const num = parseMaskedNumber(String(val));
      updated[index] = { ...updated[index], [field]: num };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setProducts(updated);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length <= 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updated: StandConfig = {
      ...config,
      projectName: projectName.trim() || 'Mi Stand de Feria',
      institutionName: institutionName.trim() || 'Institución Educativa',
      initialInvestment: parseMaskedNumber(investmentStr),
      teamMembers: isPremium ? teamMembers : [],
      products: products.length > 0 ? products : config.products,
      isConfigured: true,
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#0c0c0e] border border-cyan-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121218]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Configuración del Stand</h3>
              <p className="text-[11px] text-gray-400">
                Ajusta los parámetros financieros y el catálogo de productos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Project & Institution */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                Nombre del Proyecto o Stand
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ej. EcoSnacks 11-A"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                Colegio / Institución Educativa
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Ej. Institución Educativa San José"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>
          </div>

          {/* Inversión Inicial con Máscara Monetaria */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <label className="block font-bold text-cyan-300 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Inversión Inicial Total (con máscara automática)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-sm">
                $
              </span>
              <input
                type="text"
                value={investmentStr}
                onChange={(e) => handleInvestmentChange(e.target.value)}
                placeholder="100.000"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/70 border border-cyan-500/40 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Es el capital inicial invertido por el equipo. La ganancia neta se calculará restando esta cifra.
            </p>
          </div>

          {/* Integrantes del Equipo (Exclusivo Premium) */}
          {isPremium ? (
            <div className="space-y-2.5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Integrantes del Equipo (Aparecen en el Acta Oficial)
                </label>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">Premium</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                  placeholder="Nombre de estudiante"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                >
                  Añadir
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {teamMembers.map((member, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs text-slate-200"
                  >
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-gray-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Registro de integrantes del equipo exclusivo de la versión Premium.</span>
            </div>
          )}

          {/* Gestión Multiproducto (1 a 8 Productos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Catálogo de Productos ({products.length} de 8)
              </label>
              {products.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nuevo Producto</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {products.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-5 h-5 rounded-md bg-white/10 text-cyan-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      placeholder="Nombre del producto"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                    />
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5">Precio Unitario ($)</span>
                      <input
                        type="text"
                        value={formatNumberMask(p.price)}
                        onChange={(e) => handleProductChange(idx, 'price', e.target.value)}
                        placeholder="5.000"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5">Stock Inicial (Uds)</span>
                      <input
                        type="number"
                        min="1"
                        value={p.initialStock}
                        onChange={(e) => handleProductChange(idx, 'initialStock', e.target.value)}
                        placeholder="30"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-[#121218] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
