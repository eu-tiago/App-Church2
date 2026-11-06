import React, { useState } from 'react';
import {
  Church,
  Save,
  Building2,
  MapPin,
  Phone,
  Mail,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChurchSettingsView: React.FC = () => {
  const { tenant, tenantSettings, congregations } = useAuth();
  const [churchName, setChurchName] = useState(tenant?.name || 'Igreja Batista Central');
  const [email, setEmail] = useState(tenant?.contactEmail || 'contato@ibcentral.com.br');
  const [phone, setPhone] = useState(tenant?.contactPhone || '(11) 4500-8000');
  const [cnpj, setCnpj] = useState(tenant?.documentCnpj || '12.345.678/0001-90');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configurações da Igreja & Identidade</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Personalização de dados cadastrais, marca institucional e congregações.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Dados Institucionais
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome Oficial da Igreja *</label>
            <input
              type="text"
              required
              value={churchName}
              onChange={e => setChurchName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={e => setCnpj(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefone Principal</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-mail de Contato da Secretaria</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Congregations List */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Campi & Congregações Vinculadas ({congregations.length})
          </h3>

          <div className="space-y-2">
            {congregations.map(c => (
              <div key={c.id} className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    {c.name} {c.isMain && <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 rounded font-mono">SEDE</span>}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.address} · {c.city} - {c.state}</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Operacional
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {saved && (
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
