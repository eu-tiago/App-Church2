import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Network,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Heart,
  ChevronRight,
  ShieldCheck,
  Building2,
  Compass,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NavItemKey } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (view: NavItemKey) => void;
}

// Circular SVG Progress Ring matching reference Image 2 & 3
const CircularProgressRing: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}> = ({
  percentage,
  size = 46,
  strokeWidth = 4,
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

// Large Radial Gauge for Customer/Member Retention (Matching Image 3)
const LargeRadialRetentionGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  const size = 150;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#radialGaugeGrad)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="radialGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Retenção</span>
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">{percentage}%</span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, activeCongregationId, tenant } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.getDashboardSummary(activeCongregationId);
        setData(res);
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeCongregationId]);

  if (isLoading || !data) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, alerts } = data;

  // Breakdown of income categories matching Reference Image 3 "Policy Type" panel
  const ministryBreakdown = [
    {
      name: 'Dízimos & Ofertas Gerais',
      dept: 'Manutenção & Ministério Pastoral',
      amount: 84520,
      icon: Heart,
      color: 'bg-blue-50 text-[#0052CC]'
    },
    {
      name: 'Missões Nacionais & Mundiais',
      dept: 'Plantação de Igrejas e Ação Social',
      amount: 18240,
      icon: Compass,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      name: 'Ministério de Jovens & Eventos',
      dept: 'Inscrições Congresso Conexão 2026',
      amount: 38500,
      icon: Flame,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      name: 'Fundo de Expansão & Obras',
      dept: 'Reforma do Anexo Infantil',
      amount: 14750,
      icon: Building2,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* 1. Header with Personalized Welcome & Quick Actions (Matching Image 3 & Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Olá, {user?.name || 'Pastor Ricardo'}! 👋
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão estratégica consolidada de membros, visitantes, células e finanças de {tenant?.name || 'Igreja Batista Central'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('visitors')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>CRM Visitantes</span>
          </button>
          <button
            onClick={() => onNavigate('cells')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Relatório Célula</span>
          </button>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards with Circular Stroke Progress Rings (Matching Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Membros Ativos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Membros Ativos</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums pt-1">
              {kpis.totalMembers}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              +8.5% <ArrowUpRight className="w-3 h-3" />
              <span className="text-slate-400 font-normal">este mês</span>
            </span>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgressRing percentage={88} color="#0052CC" bgColor="#E2E8F0" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">88% meta</span>
          </div>
        </div>

        {/* Card 2: Visitantes no Mês */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Visitantes no Mês</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums pt-1">
              {kpis.visitorsThisMonth}
            </p>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
              {kpis.followupsPending} em acompanhamento
            </span>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgressRing percentage={72} color="#10B981" bgColor="#E2E8F0" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">72% acolhidos</span>
          </div>
        </div>

        {/* Card 3: Células & Pequenos Grupos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Células Ativas</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums pt-1">
              {kpis.activeCells}
            </p>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-0.5">
              Média {kpis.avgAttendance} pessoas/célula
            </span>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgressRing percentage={85} color="#8B5CF6" bgColor="#E2E8F0" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">85% ativas</span>
          </div>
        </div>

        {/* Card 4: Saldo Operacional Líquido */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Saldo Líquido</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums pt-1">
              R$ {kpis.netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              Superávit Operacional
            </span>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgressRing percentage={94} color="#06B6D4" bgColor="#E2E8F0" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">94% orçado</span>
          </div>
        </div>
      </div>

      {/* 3. AI Pastoral Insight Banner (Matching Image 1) */}
      <div className="bg-white border border-blue-100 rounded-xl p-3.5 px-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#0052CC]" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-900 block">Insight Inteligente da Pastoral</span>
            <p className="text-xs text-slate-600 mt-0.5">
              Detectamos que 3 células da Zona Sul estão sem relatório de frequência há mais de 10 dias e 5 visitantes aguardam primeiro contato.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('visitors')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:text-blue-800 transition-colors whitespace-nowrap"
        >
          <span>Acessar CRM</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Middle Grid: Event Highlight & Attendance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance & Visitor Growth Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Frequência Geral & Novos Visitantes</h2>
              <p className="text-[11px] text-slate-500">Média de presenças em celebrações e reuniões de células</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" /> Presenças
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Visitantes
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresenca" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVisitantes" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="presenca" stroke="#0052CC" strokeWidth={2.5} fill="url(#colorPresenca)" name="Presenças" />
                <Area type="monotone" dataKey="visitantes" stroke="#10B981" strokeWidth={2.5} fill="url(#colorVisitantes)" name="Visitantes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event in Highlight Card with Real-time Capacity Progress */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Evento em Destaque
              </span>
              <span className="text-xs text-slate-300">20 a 22 de Nov</span>
            </div>
            <h3 className="text-base font-bold text-white mt-2 leading-snug">
              Congresso Conexão Jovem 2026: Avivamento & Missão
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Inscrições automatizadas com gateway Asaas (PIX imediato e Cartão de Crédito).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Inscrições Confirmadas</span>
                <span className="text-lg font-extrabold text-white tabular-nums">
                  {kpis.paidRegistrations} <span className="text-xs font-normal text-slate-400">/ 450 vagas</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Arrecadação Bruta</span>
                <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                  R$ {kpis.eventGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Capacidade do Lote 2</span>
                <span className="font-bold text-white font-mono">78%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '78%' }} />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('event_finance')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors text-center"
              >
                Gerenciar Financeiro do Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Bento Grid: Radial Retention Gauge + Profit vs Expenses + Category Breakdown (Matching Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bento Col 1: Customer Retention Rate / Radial Gauge (From Image 3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Taxa de Retenção & Engajamento</h3>
            <p className="text-[11px] text-slate-500">Membros e visitantes integrados nos últimos 90 dias</p>
          </div>

          <LargeRadialRetentionGauge percentage={84} />

          <div className="space-y-3">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Cuidado pastoral contínuo e acompanhamento ágil no funil de visitantes garantem alta retenção.
            </p>

            <button
              onClick={() => onNavigate('discipleship')}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-lg text-xs font-bold transition-colors text-center"
            >
              Ver Detalhes do Cuidado
            </button>
          </div>
        </div>

        {/* Bento Col 2: Profit vs Expenses / Fluxo com 4 mini cards (From Image 3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Entradas vs Despesas</h3>
              <p className="text-[11px] text-slate-500">Evolução de caixa consolidada do semestre</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Conciliado
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.financialEvolutionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR')}`}
                />
                <Area type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.15} name="Receitas" />
                <Area type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={2} fill="#EF4444" fillOpacity={0.08} name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 4 Mini Metric Badges (Matching Image 3) */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Esta Sem</span>
              <span className="text-xs font-bold text-slate-900 tabular-nums">R$ 14.2k</span>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Este Mês</span>
              <span className="text-xs font-bold text-slate-900 tabular-nums">R$ 52.8k</span>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Despesas</span>
              <span className="text-xs font-bold text-red-600 tabular-nums">R$ 28.3k</span>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Saldo</span>
              <span className="text-xs font-bold text-emerald-600 tabular-nums">R$ 24.5k</span>
            </div>
          </div>
        </div>

        {/* Bento Col 3: Policy Type / Category Breakdown List (From Image 3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Arrecadação por Fundo</h3>
              <p className="text-[11px] text-slate-500">Destinação e centros de custo ativos</p>
            </div>
            <button
              onClick={() => onNavigate('financial')}
              className="text-[11px] font-bold text-[#0052CC] hover:text-blue-800"
            >
              Ver DRE
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {ministryBreakdown.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.dept}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block">
                      R$ {item.amount.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {Math.round((item.amount / 156010) * 100)}% do total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Total Arrecadado</span>
            <span className="font-extrabold text-slate-900 font-mono tabular-nums">
              R$ 156.010,00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
