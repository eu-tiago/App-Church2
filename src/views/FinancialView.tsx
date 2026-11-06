import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { FinancialAccount, FinancialTransaction } from '../types';

export const FinancialView: React.FC = () => {
  const [summary, setSummary] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New transaction form
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [nature, setNature] = useState<string>('dizimo');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerOrReceiver, setPayerOrReceiver] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sum, txs, accs, cats, ccs] = await Promise.all([
        api.getFinancialSummary(),
        api.getFinancialTransactions({ type: typeFilter, search }),
        api.getFinancialAccounts(),
        api.getFinancialCategories(),
        api.getFinancialCostCenters()
      ]);
      setSummary(sum);
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
      setCostCenters(ccs);
      if (accs.length > 0 && !accountId) setAccountId(accs[0].id);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, search]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId || !categoryId) return;

    try {
      await api.createFinancialTransaction({
        type,
        nature,
        description,
        amount: Number(amount),
        accountId,
        categoryId,
        costCenterId: costCenterId || undefined,
        dueDate,
        payerOrReceiver,
        status
      });
      setShowModal(false);
      setDescription('');
      setAmount('');
      setPayerOrReceiver('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar movimentação.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestão Financeira & Livro Caixa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dízimos, ofertas de células, contas bancárias e integração total com as inscrições de eventos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Accounts & Balances Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Saldo em Contas & Caixas</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              R$ {summary.totalBankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between">
                  <span className="truncate pr-2">{acc.name}</span>
                  <span className="font-mono font-medium tabular-nums text-slate-800">
                    R$ {acc.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Receitas Realizadas</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums flex items-center gap-1">
              R$ {summary.totalIncomePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              + R$ {summary.pendingReceivables.toLocaleString('pt-BR')} a receber
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Despesas Pagas</span>
            <p className="text-2xl font-bold text-red-600 mt-1 tabular-nums">
              R$ {summary.totalExpensePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              - R$ {summary.pendingPayables.toLocaleString('pt-BR')} a vencer
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Superávit Líquido do Período</span>
            <p className={`text-2xl font-bold mt-1 tabular-nums ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              R$ {summary.netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Auditoria em conformidade
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por descrição ou pagador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 self-stretch md:self-auto bg-slate-100 p-1 rounded-md text-xs">
          {['todos', 'receita', 'despesa'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                typeFilter === t ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'todos' ? 'Todas' : t === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Data Venc.</th>
                <th className="py-3 px-4">Descrição & Origem</th>
                <th className="py-3 px-4">Conta / Gateway</th>
                <th className="py-3 px-4">Categoria / Centro Custo</th>
                <th className="py-3 px-4 text-right">Valor Líquido</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Carregando movimentações financeiras...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => {
                  const isIncome = tx.type === 'receita';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-600">
                        {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{tx.description}</div>
                        {tx.payerOrReceiver && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {isIncome ? 'Recebido de' : 'Pago para'}: {tx.payerOrReceiver}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.accountName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium block">{tx.categoryName}</span>
                        {tx.costCenterName && (
                          <span className="text-[10px] text-blue-600 font-semibold">
                            {tx.costCenterName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isIncome ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tx.status === 'pago' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Novo Lançamento Financeiro</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Movimentação</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                  >
                    <option value="receita">Receita (Entrada)</option>
                    <option value="despesa">Despesa (Saída)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dízimo identificado ou Conta de Luz Sede"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conta Bancária / Caixa *</label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria Contábil *</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.filter(c => c.type === type).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Centro de Custo</label>
                  <select
                    value={costCenterId}
                    onChange={e => setCostCenterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Sem centro de custo específico</option>
                    {costCenters.map(cc => (
                      <option key={cc.id} value={cc.id}>
                        {cc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pagador / Fornecedor</label>
                  <input
                    type="text"
                    placeholder="Nome da pessoa ou empresa"
                    value={payerOrReceiver}
                    onChange={e => setPayerOrReceiver(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Situação</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                  >
                    <option value="pago">Liquidado / Pago</option>
                    <option value="pendente">Pendente de Liquidação</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Salvar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
