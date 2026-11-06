import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Receipt,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const ReconciliationView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const loadReconciliation = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReconciliation();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliation();
  }, []);

  const handleReconcile = async (id: string) => {
    setReconcilingId(id);
    try {
      await api.reconcileTransaction(id);
      loadReconciliation();
    } catch (err: any) {
      alert(err.message || 'Erro ao conciliar.');
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Conciliação Financeira & Gateways</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditoria comparativa entre cobranças do gateway (Asaas), recebimentos de inscrições e extrato bancário.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="text-center py-12 text-slate-400">Carregando conciliação...</div>
      ) : (
        <>
          {/* Status strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Lançamentos Pendentes de Conciliação
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {data.unreconciledCount} itens
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Movimentações financeiras registradas no livro caixa aguardando validação com o extrato bancário oficial.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Inscrições Confirmadas no Gateway
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {data.gatewayPendingCount} pagamentos
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Valores liquidados via webhook que foram vinculados com sucesso ao saldo virtual da conta Asaas.
              </p>
            </div>
          </div>

          {/* Unreconciled Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Movimentações com Validação Pendente
              </h3>
              <span className="text-[11px] text-slate-500">
                Cruze com o arquivo OFX ou extrato do banco
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.unreconciledTransactions?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <p className="font-semibold text-slate-800">Tudo Conciliado!</p>
                  <p className="text-[11px] text-slate-400">
                    Não há divergências entre o livro caixa, as contas bancárias e os gateways de pagamento.
                  </p>
                </div>
              ) : (
                data.unreconciledTransactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{tx.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.accountName} · {tx.categoryName} · Vencimento: {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-sm tabular-nums text-slate-900">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>

                      <button
                        onClick={() => handleReconcile(tx.id)}
                        disabled={reconcilingId === tx.id}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{reconcilingId === tx.id ? 'Conciliando...' : 'Conciliar Agora'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
