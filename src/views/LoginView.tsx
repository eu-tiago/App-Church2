import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Church,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, registerChurch, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login inputs
  const [email, setEmail] = useState('pastor@ibcentral.com.br');
  const [password, setPassword] = useState('pastor123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register inputs
  const [churchName, setChurchName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [planId, setPlanId] = useState('plan_pro');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setLoginError(err.message || 'Falha ao autenticar.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await registerChurch({
        churchName,
        cnpj,
        contactEmail,
        contactPhone,
        adminName,
        password: adminPassword,
        planId
      });
      setRegisterSuccess(true);
    } catch (err: any) {
      setLoginError(err.message || 'Falha ao cadastrar igreja.');
    }
  };

  const handleQuickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">ChurchFlow</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Plataforma SaaS de Gestão Inteligente para Igrejas · Células, Membros, Financeiro e Eventos
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'login' ? 'bg-white text-slate-900 border-b-2 border-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Acessar Minha Igreja
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'register' ? 'bg-white text-slate-900 border-b-2 border-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadastrar Nova Igreja
          </button>
        </div>

        {/* Tab 1: Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
            {loginError && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Logins for reviewers */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Acessos de Demonstração Rápida:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('pastor@ibcentral.com.br', 'pastor123')}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left truncate"
                >
                  <strong className="block text-slate-800">Pr. Tiago Silva</strong>
                  <span className="text-slate-500 text-[10px]">Pastor Principal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('lider@ibcentral.com.br', 'lider123')}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left truncate"
                >
                  <strong className="block text-slate-800">Matheus Oliveira</strong>
                  <span className="text-slate-500 text-[10px]">Líder de Célula</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('tesouraria@ibcentral.com.br', 'tesouraria123')}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left truncate"
                >
                  <strong className="block text-slate-800">Carla Mendes</strong>
                  <span className="text-slate-500 text-[10px]">Tesoureira</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@churchflow.com.br', 'admin123')}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left truncate"
                >
                  <strong className="block text-blue-900">Diretoria SaaS</strong>
                  <span className="text-blue-700 text-[10px]">SuperAdmin</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Register New Church (Tenant) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
            {loginError && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nome da Igreja *</label>
              <input
                type="text"
                required
                placeholder="Ex: Igreja Evangélica Betel"
                value={churchName}
                onChange={e => setChurchName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CNPJ (Opcional)</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Igreja *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98888-7777"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nome do Pastor / Administrador *</label>
              <input
                type="text"
                required
                placeholder="Pr. João Paulo"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail Administrativo *</label>
                <input
                  type="email"
                  required
                  placeholder="pastor@igreja.org"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Criar Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 dígitos"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plano Escolhido</label>
              <select
                value={planId}
                onChange={e => setPlanId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="plan_starter">Starter (Até 150 membros) - R$ 149/mês</option>
                <option value="plan_pro">Pro (Até 600 membros + Gateways) - R$ 299/mês</option>
                <option value="plan_enterprise">Enterprise (Múltiplas Congregações) - R$ 599/mês</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{isLoading ? 'Criando Conta...' : 'Iniciar Teste Gratuito de 14 Dias'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
