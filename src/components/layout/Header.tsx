import React, { useState } from 'react';
import {
  Church,
  Search,
  Bell,
  ExternalLink,
  LogOut,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentTitle: string;
  onOpenPublicEvent: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTitle, onOpenPublicEvent }) => {
  const { user, tenant, congregations, activeCongregationId, setActiveCongregationId, logout, quickSwitchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesList: { code: UserRole; label: string; desc: string }[] = [
    { code: 'pastor_principal', label: 'Pr. Tiago Silva', desc: 'Pastor Principal (Acesso Estratégico Total)' },
    { code: 'lider_celula', label: 'Matheus Oliveira', desc: 'Líder de Célula (Célula Ágape, Reuniões e Presença)' },
    { code: 'tesoureiro', label: 'Carla Mendes', desc: 'Tesoureira (Financeiro, Contas e Conciliação)' },
    { code: 'responsavel_eventos', label: 'Letícia Ramos', desc: 'Gestora de Eventos (Inscrições, Lotes e Check-in)' },
    { code: 'superadmin_saas', label: 'Diretoria SaaS', desc: 'Superadministrador SaaS (MRR, Tenants e Planos)' }
  ];

  const currentRoleName = rolesList.find(r => r.code === user?.roleCode)?.label || user?.name || 'Usuário';

  const notifications = [
    { id: 1, title: 'Inscrição confirmada via PIX', time: 'Há 12 min', read: false },
    { id: 2, title: 'Célula Ágape enviou relatório semanal', time: 'Há 45 min', read: false },
    { id: 3, title: 'Alerta: 3 novos visitantes sem contato inicial', time: 'Há 2h', read: true }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-2xs">
      {/* Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{currentTitle}</h1>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-medium text-slate-500">{tenant?.name || 'Igreja Batista Central'}</span>
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-3">
        {/* Public Event Link Button */}
        <button
          onClick={onOpenPublicEvent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
          title="Abrir página pública de inscrição do congresso como visitante"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver Inscrição Pública</span>
        </button>

        {/* Congregation Switcher */}
        {congregations.length > 0 && user?.roleCode !== 'superadmin_saas' && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-xs">
            <Church className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={activeCongregationId}
              onChange={e => setActiveCongregationId(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              {congregations.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isMain ? '(Sede)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Role Tester Dropdown (RBAC Simulator) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-amber-300/80 bg-amber-50 text-amber-900 text-xs font-medium hover:bg-amber-100 transition-colors"
            title="Alternar perfil instantaneamente para testar permissões"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-semibold">{currentRoleName}</span>
            <ChevronDown className="w-3 h-3 text-amber-700" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Simular Perfil de Acesso (RBAC)
              </div>
              {rolesList.map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    quickSwitchRole(item.code);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col transition-colors ${
                    user?.roleCode === item.code ? 'bg-amber-50/60 font-semibold' : ''
                  }`}
                >
                  <span className="text-slate-900">{item.label}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Central de Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-slate-900 border-b border-slate-100 flex items-center justify-between">
                <span>Notificações</span>
                <span className="text-[10px] text-blue-600 cursor-pointer">Marcar lidas</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-slate-800 font-medium">{n.title}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.name.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
