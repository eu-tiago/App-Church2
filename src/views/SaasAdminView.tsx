import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  Users,
  Shield,
  Power,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const SaasAdminView: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSaasData = async () => {
    setIsLoading(true);
    try {
      const [m, t, p] = await Promise.all([
        api.getSaasMetrics(),
        api.getSaasTenants(),
        api.getPlans()
      ]);
      setMetrics(m);
      setTenants(t);
      setPlans(p);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaasData();
  }, []);

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateTenantStatus(tenantId, newStatus);
      loadSaasData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase border border-blue-500/30">
            Acesso Restrito · Diretoria ChurchFlow
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Painel Comercial SaaS (Proprietário)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Gestão de igrejas assinantes, faturamento recorrente (MRR / ARR), planos e limites de uso.
        </p>
      </div>

      {/* SaaS Executive Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">MRR (Receita Recorrente Mensal)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
              R$ {metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              ARR: R$ {metrics.arr.toLocaleString('pt-BR')} / ano
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Igrejas Assinantes Ativas</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {metrics.activeTenants} / {metrics.totalTenants}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              {metrics.trialTenants} em período de teste
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Taxa de Churn & Retenção</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
              {metrics.churnRate}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              LTV médio: R$ {metrics.ltv.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Total Membros na Plataforma</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {metrics.totalMembersAcrossPlatform}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              {metrics.totalEventsAcrossPlatform} eventos gerenciados
            </span>
          </div>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            Igrejas Cadastradas (Tenants)
          </h3>
          <button
            onClick={loadSaasData}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Igreja & Contato</th>
                <th className="py-3 px-4">Plano Contratado</th>
                <th className="py-3 px-4">Utilização (Membros / Células)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : (
                tenants.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {t.contactEmail} · CNPJ: {t.documentCnpj || 'Não inf.'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{t.planName}</span>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        R$ {t.planPrice.toFixed(2)}/mês
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-mono text-[11px] tabular-nums">
                        {t.stats?.membersCount || 0} membros / {t.stats?.cellsCount || 0} células
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Limite: {t.limits?.maxMembers} membros
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {t.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Suspensa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(t.id, t.status)}
                        className={`px-3 py-1 rounded font-semibold text-xs border transition-colors ${
                          t.status === 'active'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {t.status === 'active' ? 'Suspender' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Configurator Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Configuração de Planos & Limites Comerciais</h3>
          <p className="text-xs text-slate-500">
            Nenhum limite está fixado no código; todos os planos são configuráveis no banco MySQL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                <span className="text-xs font-mono font-bold text-blue-700">
                  R$ {p.monthlyPrice.toFixed(2)}/mês
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/80">
                <div className="flex justify-between">
                  <span>Máx. Membros:</span>
                  <span className="font-bold text-slate-800">{p.maxMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Máx. Usuários Admins:</span>
                  <span className="font-bold text-slate-800">{p.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Máx. Células:</span>
                  <span className="font-bold text-slate-800">{p.maxCells}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gateways de Pagamento:</span>
                  <span className={p.hasPaymentGateway ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {p.hasPaymentGateway ? 'Incluso' : 'Não incluso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Multi-Congregações:</span>
                  <span className={p.hasMultiCongregations ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {p.hasMultiCongregations ? 'Sim' : 'Apenas Sede'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
