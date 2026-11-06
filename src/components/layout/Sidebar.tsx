import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Network,
  GitFork,
  HeartHandshake,
  Music,
  Calendar,
  DollarSign,
  QrCode,
  Wallet,
  Receipt,
  Scale,
  CreditCard,
  Webhook,
  ShieldAlert,
  BarChart3,
  UserCog,
  Church,
  Sliders,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type NavItemKey =
  | 'dashboard'
  | 'members'
  | 'visitors'
  | 'cells'
  | 'leadership'
  | 'discipleship'
  | 'ministries'
  | 'events'
  | 'event_finance'
  | 'checkin'
  | 'financial'
  | 'transactions'
  | 'accounts'
  | 'reconciliation'
  | 'gateways'
  | 'webhooks'
  | 'audit'
  | 'bi'
  | 'users'
  | 'congregations'
  | 'settings'
  | 'saas_admin';

interface SidebarProps {
  currentView: NavItemKey;
  onNavigate: (view: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavSection {
  title: string;
  items: {
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: UserRole[];
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse
}) => {
  const { user, tenant, hasRole } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { key: 'dashboard', label: 'Visão Geral & Métricas', icon: LayoutDashboard }
      ]
    },
    {
      title: 'GESTÃO DA IGREJA & CRM',
      items: [
        { key: 'visitors', label: 'CRM de Visitantes', icon: UserPlus, badge: 'NOVO' },
        { key: 'members', label: 'Membros & Famílias', icon: Users },
        { key: 'cells', label: 'Células & Reuniões', icon: Network },
        { key: 'leadership', label: 'Organograma & Liderança', icon: GitFork },
        { key: 'discipleship', label: 'Funil de Discipulado', icon: HeartHandshake },
        { key: 'ministries', label: 'Ministérios & Equipes', icon: Music }
      ]
    },
    {
      title: 'EVENTOS & INSCRIÇÕES',
      items: [
        { key: 'events', label: 'Eventos & Lotes', icon: Calendar },
        { key: 'event_finance', label: 'Financeiro por Evento', icon: DollarSign },
        { key: 'checkin', label: 'Check-in (QR Code)', icon: QrCode }
      ]
    },
    {
      title: 'FINANCEIRO GERAL',
      items: [
        { key: 'financial', label: 'Dashboard Financeiro', icon: Wallet, roles: ['pastor_principal', 'tesoureiro', 'admin_igreja'] },
        { key: 'transactions', label: 'Livro Caixa (Receitas/Desp)', icon: Receipt, roles: ['pastor_principal', 'tesoureiro', 'admin_igreja'] },
        { key: 'accounts', label: 'Contas & Centros de Custo', icon: Building2, roles: ['pastor_principal', 'tesoureiro', 'admin_igreja'] },
        { key: 'reconciliation', label: 'Conciliação Bancária', icon: Scale, roles: ['pastor_principal', 'tesoureiro', 'admin_igreja'] }
      ]
    },
    {
      title: 'INTEGRAÇÕES & GATEWAYS',
      items: [
        { key: 'gateways', label: 'Provedores de Pagamento', icon: CreditCard, roles: ['pastor_principal', 'admin_igreja', 'tesoureiro'] },
        { key: 'webhooks', label: 'Monitor de Webhooks', icon: Webhook, roles: ['pastor_principal', 'admin_igreja'] },
        { key: 'audit', label: 'Auditoria & LGPD', icon: ShieldAlert, roles: ['pastor_principal', 'admin_igreja'] }
      ]
    },
    {
      title: 'INTELIGÊNCIA',
      items: [
        { key: 'bi', label: 'BI & Indicadores', icon: BarChart3 }
      ]
    },
    {
      title: 'ADMINISTRAÇÃO',
      items: [
        { key: 'users', label: 'Usuários & Permissões', icon: UserCog, roles: ['pastor_principal', 'admin_igreja'] },
        { key: 'congregations', label: 'Congregações (Campi)', icon: Church, roles: ['pastor_principal', 'admin_igreja'] },
        { key: 'settings', label: 'Configurações da Igreja', icon: Sliders, roles: ['pastor_principal', 'admin_igreja'] }
      ]
    }
  ];

  if (user?.roleCode === 'superadmin_saas') {
    sections.unshift({
      title: 'PAINEL SAAS (PROPRIETÁRIO)',
      items: [
        { key: 'saas_admin', label: 'Gestão de Clientes & MRR', icon: TrendingUp, badge: 'SAAS' }
      ]
    });
  }

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-[#004BB7] text-white border-r border-[#003D99] transition-all duration-200 select-none shadow-xl ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#003E9E]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-white text-[#004BB7] flex items-center justify-center font-extrabold shrink-0 shadow-md">
              <Church className="w-5 h-5 text-[#004BB7]" />
            </div>
            <div className="truncate">
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                CHURCHFLOW
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white/20 text-white border border-white/30">
                  SMART
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate">
                {tenant?.name || 'Gestão Inteligente'}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-white text-[#004BB7] flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Church className="w-5 h-5 text-[#004BB7]" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {sections.map(section => {
          const visibleItems = section.items.filter(item => !item.roles || hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/80">
                  {section.title}
                </div>
              )}
              {isCollapsed && <div className="h-px bg-white/10 mx-2 my-2" />}

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#004BB7] font-bold shadow-md'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#004BB7]' : 'text-blue-100'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-[#004BB7]/10 text-[#004BB7]' : 'bg-white/20 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Smart Assistant Card (Matching Reference Image 1) */}
      {!isCollapsed && (
        <div className="p-3 mx-2 mb-3 rounded-xl bg-white/10 border border-white/15 text-white shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-blue-300 text-[#004BB7] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#004BB7]" />
            </div>
            <span className="text-[11px] font-bold tracking-tight">Cuidado Pastoral Inteligente</span>
          </div>
          <p className="text-[10px] text-blue-100 leading-relaxed">
            Acompanhe o funil de visitantes, decisões de fé e presenças em tempo real.
          </p>
        </div>
      )}

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 border-t border-white/10 bg-[#00388F] text-[11px] text-blue-100 flex items-center justify-between">
          <span className="truncate font-medium">{tenant?.slug || 'ibcentral'}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
            ATIVO
          </span>
        </div>
      )}
    </aside>
  );
};
