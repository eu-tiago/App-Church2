import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Power,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentIntegration } from '../types';

export const GatewaysView: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const loadGateways = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGateways();
      setGateways(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleGateway(id);
      loadGateways();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testGatewayConnection(id);
      setTestResult({ id, message: res.message });
      loadGateways();
    } catch (err: any) {
      alert(err.message || 'Falha no teste de conexão.');
    } finally {
      setTestingId(null);
    }
  };

  const copyWebhookUrl = (provider: string) => {
    const url = `${window.location.origin}/api/webhooks/payment/${provider}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Provedores de Pagamento & Gateways</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Conexão direta com as contas das igrejas (Asaas, Mercado Pago e Stripe). O SaaS não custodia valores.
        </p>
      </div>

      {/* Info notice about direct account payout */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Modelo Comercial de Recebimento Direto</p>
          <p className="text-blue-800 mt-0.5">
            Cada igreja conecta sua própria conta jurídica. O valor das inscrições é liquidado diretamente na conta da igreja no provedor, garantindo conformidade fiscal e autonomia total.
          </p>
        </div>
      </div>

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Carregando gateways...</div>
        ) : (
          gateways.map(gw => {
            const isHealthy = gw.lastHealthStatus === 'healthy';

            return (
              <div
                key={gw.id}
                className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {gw.provider}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        gw.isSandbox ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {gw.isSandbox ? 'Ambiente Sandbox' : 'Produção'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2.5">{gw.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Chave: {gw.apiKeyMasked}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Status da Integração:</span>
                      <span className={`font-semibold ${gw.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {gw.isActive ? 'Ativa' : 'Desativada'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Última Verificação:</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {gw.lastHealthCheckAt ? new Date(gw.lastHealthCheckAt).toLocaleTimeString('pt-BR') : 'Nunca'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Diagnóstico de API:</span>
                      <span className={`text-[11px] font-semibold ${isHealthy ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isHealthy ? 'Operacional (200 OK)' : 'Não testado'}
                      </span>
                    </div>
                  </div>

                  {/* Test Result Message */}
                  {testResult && testResult.id === gw.id && (
                    <div className="mt-3 p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                      {testResult.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(gw.id)}
                      disabled={testingId === gw.id}
                      className="flex-1 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingId === gw.id ? 'animate-spin' : ''}`} />
                      <span>{testingId === gw.id ? 'Testando...' : 'Testar Conexão'}</span>
                    </button>

                    <button
                      onClick={() => handleToggle(gw.id)}
                      className={`p-1.5 rounded border text-xs font-semibold transition-colors ${
                        gw.isActive ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title={gw.isActive ? 'Desativar este provedor' : 'Ativar este provedor'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Copy Webhook URL */}
                  <button
                    onClick={() => copyWebhookUrl(gw.provider)}
                    className="w-full py-1 text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUrl ? 'URL do Webhook Copiada!' : 'Copiar URL do Webhook'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
