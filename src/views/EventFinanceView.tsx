import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { api } from '../services/api';

const CircularProgressRing: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}> = ({
  percentage,
  size = 40,
  strokeWidth = 3.5,
  color = '#2563EB',
  bgColor = '#E2E8F0'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
};

export const EventFinanceView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [details, setDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Expense form
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'alimentacao' | 'locacao' | 'som_iluminacao' | 'materiais' | 'palestrante' | 'outros'>('materiais');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseStatus, setExpenseStatus] = useState<'pendente' | 'pago'>('pendente');

  useEffect(() => {
    async function loadInitial() {
      try {
        const evts = await api.getEvents();
        setEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const loadEventDetails = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getEventDetails(id);
      setDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetails(selectedEventId);
    }
  }, [selectedEventId]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription || !expenseAmount || !supplierName) return;

    try {
      await api.createEventExpense(selectedEventId, {
        description: expenseDescription,
        category: expenseCategory,
        amount: Number(expenseAmount),
        supplierName,
        dueDate,
        status: expenseStatus
      });
      setShowExpenseModal(false);
      setExpenseDescription('');
      setExpenseAmount('');
      setSupplierName('');
      loadEventDetails(selectedEventId);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar despesa do evento.');
    }
  };

  if (!selectedEventId && events.length === 0) {
    return <div className="p-8 text-center text-slate-400">Nenhum evento encontrado.</div>;
  }

  const summary = details?.financialSummary;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header and Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financeiro Integrado por Evento</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            DRE operacional dedicada: receitas brutas, taxas de gateway, centro de custo e superávit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Despesa do Evento</span>
          </button>
        </div>
      </div>

      {isLoading || !summary ? (
        <div className="text-center py-12 text-slate-400">Carregando balancete do evento...</div>
      ) : (
        <>
          {/* Executive Event Financial KPIs with Radial Meters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Receita Bruta (Vendas)</span>
                <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                  R$ {summary.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {summary.paidCount} inscrições pagas
                </span>
              </div>
              <CircularProgressRing percentage={78} color="#0052CC" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Taxas Gateway Retidas</span>
                <p className="text-xl font-bold text-red-600 mt-1 tabular-nums">
                  - R$ {summary.estimatedGatewayFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Média 2.9% retido</span>
              </div>
              <CircularProgressRing percentage={97} color="#10B981" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Receita Líquida Real</span>
                <p className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
                  R$ {summary.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Disponível em conta</span>
              </div>
              <CircularProgressRing percentage={85} color="#06B6D4" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Despesas Operacionais</span>
                <p className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
                  R$ {(summary.totalExpenses + summary.pendingExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Pagas: R$ {summary.totalExpenses.toLocaleString('pt-BR')}
                </span>
              </div>
              <CircularProgressRing percentage={45} color="#F59E0B" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs col-span-2 md:col-span-1 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Resultado Operacional</span>
                <p className={`text-xl font-bold mt-1 tabular-nums ${summary.operationalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  R$ {summary.operationalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                  {summary.operationalProfit >= 0 ? 'Superávit / Lucro' : 'Déficit'}
                </span>
              </div>
              <CircularProgressRing percentage={100} color="#10B981" />
            </div>
          </div>

          {/* Detailed Lists: Expenses & Attendees */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Specific Expenses */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Despesas do Evento</h3>
                  <p className="text-[11px] text-slate-500">Kits, som, buffet e contratações</p>
                </div>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Adicionar
                </button>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
                {details.expenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Nenhuma despesa lançada.</div>
                ) : (
                  details.expenses.map((exp: any) => (
                    <div key={exp.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{exp.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {exp.supplierName} · {exp.category} · Venc: {new Date(exp.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono tabular-nums block">
                          R$ {exp.amount.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-semibold ${exp.status === 'pago' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {exp.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Inscriptions Feed */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inscrições & Recebimentos</h3>
                  <p className="text-[11px] text-slate-500">Participantes confirmados no gateway</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Total: {details.registrations.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
                {details.registrations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Nenhuma inscrição registrada.</div>
                ) : (
                  details.registrations.map((reg: any) => (
                    <div key={reg.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{reg.attendeeName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Código: {reg.code} · {reg.lotName} · {reg.paymentMethod.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 font-mono tabular-nums block">
                          R$ {reg.finalAmount.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          {reg.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Lançar Despesa */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Adicionar Despesa ao Evento</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Custo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel de Gerador e Iluminação Extra"
                  value={expenseDescription}
                  onChange={e => setExpenseDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500.00"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="materiais">Materiais & Brindes</option>
                    <option value="som_iluminacao">Som & Iluminação</option>
                    <option value="alimentacao">Alimentação / Coffee</option>
                    <option value="locacao">Locação do Espaço</option>
                    <option value="palestrante">Palestrante / Honra</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fornecedor / Prestador *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome da empresa ou profissional"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={expenseStatus}
                    onChange={e => setExpenseStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pendente">Pendente de Pagamento</option>
                    <option value="pago">Já Pago</option>
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-slate-500">
                Esta despesa será vinculada ao centro de custo do evento e integrada automaticamente ao livro caixa da igreja.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
