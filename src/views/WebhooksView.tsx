import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentWebhookEvent } from '../types';

export const WebhooksView: React.FC = () => {
  const [webhooks, setWebhooks] = useState<PaymentWebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  // Simulation form
  const [simProvider, setSimProvider] = useState<'asaas' | 'mercadopago' | 'stripe'>('asaas');
  const [simEventType, setSimEventType] = useState('PAYMENT_RECEIVED');
  const [simAmount, setSimAmount] = useState('119.00');
  const [simAttendeeName, setSimAttendeeName] = useState('Mariana Prado');
  const [isSimulating, setIsSimulating] = useState(false);

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWebhooks();
      setWebhooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const res = await api.simulateWebhook({
        provider: simProvider,
        eventType: simEventType,
        amount: Number(simAmount),
        attendeeName: simAttendeeName
      });
      setShowSimulateModal(false);
      alert(`Webhook recebido e processado com sucesso! Status: ${res.event.status}`);
      loadWebhooks();
    } catch (err: any) {
      alert(err.message || 'Erro ao simular webhook.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monitor de Webhooks & Idempotência</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro em tempo real dos eventos disparados pelos gateways de pagamento e proteção contra duplicidade.
          </p>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Simular Disparo de Webhook</span>
        </button>
      </div>

      {/* Webhooks Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Webhook className="w-4 h-4 text-slate-500" />
            Eventos Recebidos ({webhooks.length} registros)
          </h3>
          <button
            onClick={loadWebhooks}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Provedor</th>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">ID Externo</th>
                <th className="py-3 px-4">Status & Idempotência</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Carregando eventos...
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum evento de webhook recebido ainda.
                  </td>
                </tr>
              ) : (
                webhooks.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-500">
                      {new Date(w.receivedAt).toLocaleTimeString('pt-BR')} ({new Date(w.receivedAt).toLocaleDateString('pt-BR')})
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {w.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {w.eventType}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                      {w.externalEventId}
                    </td>
                    <td className="py-3 px-4">
                      {w.status === 'processado' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Processado
                        </span>
                      ) : w.status === 'ignorado_duplicado' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Duplicata Ignorada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          {w.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayload(w.payloadJson)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px] transition-colors"
                      >
                        Ver JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Visualizar Payload */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl w-full max-w-lg overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400">Payload JSON do Webhook</span>
              <button onClick={() => setSelectedPayload(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 text-xs font-mono bg-slate-950 overflow-x-auto max-h-96 text-emerald-400">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal Simular Webhook */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Simulador de Evento Webhook</h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provedor Remetente</label>
                <select
                  value={simProvider}
                  onChange={e => setSimProvider(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                >
                  <option value="asaas">Asaas (Brasil)</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Evento</label>
                <select
                  value={simEventType}
                  onChange={e => setSimEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value="PAYMENT_RECEIVED">PAYMENT_RECEIVED (PIX/Boleto Liquidado)</option>
                  <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED (Cartão Aprovado)</option>
                  <option value="PAYMENT_REFUNDED">PAYMENT_REFUNDED (Estorno/Reembolso)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Participante</label>
                  <input
                    type="text"
                    value={simAttendeeName}
                    onChange={e => setSimAttendeeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                O backend do ChurchFlow valida a assinatura HMAC, checa se o identificador já foi processado anteriormente (idempotência) e atualiza o financeiro e as inscrições.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  {isSimulating ? 'Disparando...' : 'Disparar Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
