import React, { useState } from 'react';
import {
  UserCog,
  Shield,
  Plus,
  CheckCircle2,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UsersAdminView: React.FC = () => {
  const { user } = useAuth();

  const churchUsers = [
    {
      id: 'usr_pastor_tiago',
      name: 'Pr. Tiago Silva',
      email: 'pastor@ibcentral.com.br',
      phone: '(11) 98765-4321',
      role: 'Pastor Principal',
      roleCode: 'pastor_principal',
      status: 'Ativo',
      lastLogin: 'Hoje às 08:30'
    },
    {
      id: 'usr_lider_matheus',
      name: 'Matheus Oliveira',
      email: 'lider@ibcentral.com.br',
      phone: '(11) 99123-4567',
      role: 'Líder de Célula',
      roleCode: 'lider_celula',
      status: 'Ativo',
      lastLogin: 'Ontem às 22:45'
    },
    {
      id: 'usr_tesoureira_carla',
      name: 'Carla Mendes',
      email: 'tesouraria@ibcentral.com.br',
      phone: '(11) 97654-3210',
      role: 'Tesoureiro',
      roleCode: 'tesoureiro',
      status: 'Ativo',
      lastLogin: 'Hoje às 09:15'
    },
    {
      id: 'usr_eventos_leticia',
      name: 'Letícia Ramos',
      email: 'eventos@ibcentral.com.br',
      phone: '(11) 98111-2233',
      role: 'Responsável por Eventos',
      roleCode: 'responsavel_eventos',
      status: 'Ativo',
      lastLogin: '04/11 às 14:00'
    }
  ];

  const permissionsMatrix = [
    { role: 'Pastor Principal', dashboard: 'Total', membros: 'Total', celulas: 'Total', financeiro: 'Total', eventos: 'Total', gateways: 'Config' },
    { role: 'Líder de Célula', dashboard: 'Básico', membros: 'Visualizar', celulas: 'Suas Células & Reuniões', financeiro: 'Sem Acesso', eventos: 'Visualizar', gateways: 'Sem Acesso' },
    { role: 'Tesoureiro', dashboard: 'Financeiro', membros: 'Visualizar', celulas: 'Ofertas', financeiro: 'Total (Contas, DRE, Conciliação)', eventos: 'Financeiro Evento', gateways: 'Configuração' },
    { role: 'Responsável por Eventos', dashboard: 'Eventos', membros: 'Visualizar', celulas: 'Sem Acesso', financeiro: 'Financeiro de Eventos', eventos: 'Total (Lotes, Check-in)', gateways: 'Ver Webhooks' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Usuários & Controle de Acesso (RBAC)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie os operadores do sistema e os limites de acesso de cada função ministerial.
          </p>
        </div>

        <button
          onClick={() => alert('Convite de usuário: enviando e-mail de primeiro acesso com token temporário.')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Convidar Novo Operador</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Usuários com Acesso Administrativo
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Nome & Contato</th>
                <th className="py-3 px-4">Perfil / Função Ministerial</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {churchUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email} · {u.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLogin}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Matriz de Permissões RBAC (Role-Based Access Control)</h3>
          <p className="text-xs text-slate-500">
            Garante que líderes vejam apenas suas células, tesoureiros acessem finanças e a diretoria pastoral possua visão consolidada.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="p-2.5">Perfil</th>
                <th className="p-2.5">Dashboard</th>
                <th className="p-2.5">Membros</th>
                <th className="p-2.5">Células</th>
                <th className="p-2.5">Financeiro</th>
                <th className="p-2.5">Eventos</th>
                <th className="p-2.5">Gateways</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissionsMatrix.map(pm => (
                <tr key={pm.role} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">{pm.role}</td>
                  <td className="p-2.5">{pm.dashboard}</td>
                  <td className="p-2.5">{pm.membros}</td>
                  <td className="p-2.5">{pm.celulas}</td>
                  <td className="p-2.5 font-semibold text-blue-700">{pm.financeiro}</td>
                  <td className="p-2.5">{pm.eventos}</td>
                  <td className="p-2.5">{pm.gateways}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
