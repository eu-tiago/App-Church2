import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { DashboardView } from './views/DashboardView';
import { MembersView } from './views/MembersView';
import { VisitorsView } from './views/VisitorsView';
import { CellsView } from './views/CellsView';
import { LeadershipView } from './views/LeadershipView';
import { DiscipleshipView } from './views/DiscipleshipView';
import { MinistriesView } from './views/MinistriesView';
import { EventsView } from './views/EventsView';
import { EventFinanceView } from './views/EventFinanceView';
import { CheckinView } from './views/CheckinView';
import { FinancialView } from './views/FinancialView';
import { ReconciliationView } from './views/ReconciliationView';
import { GatewaysView } from './views/GatewaysView';
import { WebhooksView } from './views/WebhooksView';
import { AuditLogsView } from './views/AuditLogsView';
import { BIAnalyticsView } from './views/BIAnalyticsView';
import { UsersAdminView } from './views/UsersAdminView';
import { ChurchSettingsView } from './views/ChurchSettingsView';
import { SaasAdminView } from './views/SaasAdminView';
import { LoginView } from './views/LoginView';
import { PublicEventView } from './views/PublicEventView';

const viewTitles: Record<NavItemKey, string> = {
  dashboard: 'Dashboard Executivo',
  members: 'Gestão de Membros',
  visitors: 'Gestão de Visitantes',
  cells: 'Células & Reuniões Semanais',
  leadership: 'Organograma & Liderança Pastoral',
  discipleship: 'Funil de Discipulado & Jornada',
  ministries: 'Ministérios & Equipes',
  events: 'Eventos & Inscrições',
  event_finance: 'Painel Financeiro do Evento',
  checkin: 'Terminal de Credenciamento & Check-in',
  financial: 'Dashboard Financeiro',
  transactions: 'Livro Caixa (Receitas & Despesas)',
  accounts: 'Contas Bancárias & Centros de Custo',
  reconciliation: 'Conciliação Financeira & Gateways',
  gateways: 'Integrações de Pagamento',
  webhooks: 'Monitor de Webhooks & Idempotência',
  audit: 'Auditoria & Logs de Segurança (LGPD)',
  bi: 'Inteligência de Dados & BI',
  users: 'Usuários & Permissões (RBAC)',
  congregations: 'Campi & Congregações',
  settings: 'Configurações Institucionais',
  saas_admin: 'Painel Comercial SaaS (Proprietário)'
};

function MainApplication() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPublicEventOpen, setIsPublicEventOpen] = useState(false);

  // If public event simulation is requested
  if (isPublicEventOpen) {
    return (
      <PublicEventView
        eventSlug="conexao-jovem-2026"
        onBackToApp={() => setIsPublicEventOpen(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white text-xs gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-slate-400">Carregando ChurchFlow SaaS...</p>
      </div>
    );
  }

  // Not logged in -> Show Login and Church Registration
  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'members':
        return <MembersView />;
      case 'visitors':
        return <VisitorsView />;
      case 'cells':
        return <CellsView />;
      case 'leadership':
        return <LeadershipView />;
      case 'discipleship':
        return <DiscipleshipView />;
      case 'ministries':
        return <MinistriesView />;
      case 'events':
        return <EventsView onNavigate={setCurrentView} />;
      case 'event_finance':
        return <EventFinanceView />;
      case 'checkin':
        return <CheckinView />;
      case 'financial':
      case 'transactions':
      case 'accounts':
        return <FinancialView />;
      case 'reconciliation':
        return <ReconciliationView />;
      case 'gateways':
        return <GatewaysView />;
      case 'webhooks':
        return <WebhooksView />;
      case 'audit':
        return <AuditLogsView />;
      case 'bi':
        return <BIAnalyticsView />;
      case 'users':
        return <UsersAdminView />;
      case 'congregations':
      case 'settings':
        return <ChurchSettingsView />;
      case 'saas_admin':
        return <SaasAdminView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'ml-18' : 'ml-64'
        }`}
      >
        <Header
          currentTitle={viewTitles[currentView] || 'ChurchFlow'}
          onOpenPublicEvent={() => setIsPublicEventOpen(true)}
        />

        <main className="flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
