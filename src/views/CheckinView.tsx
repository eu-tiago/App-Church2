import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const CheckinView: React.FC = () => {
  const [codeOrToken, setCodeOrToken] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentCheckedIn, setRecentCheckedIn] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const evts = await api.getEvents();
        setEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[0].id);
          const details = await api.getEventDetails(evts[0].id);
          const checked = details.registrations.filter((r: any) => r.checkedIn);
          setRecentCheckedIn(checked);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeOrToken) return;

    setResult(null);
    setError(null);

    try {
      const res = await api.checkin(codeOrToken.trim());
      setResult(res);
      setRecentCheckedIn(prev => [res.registration, ...prev.filter(r => r.id !== res.registration.id)]);
      setCodeOrToken('');
    } catch (err: any) {
      setError(err.message || 'Erro ao validar check-in.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Terminal de Credenciamento & Check-in QR</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Validação instantânea de ingressos, prevenção de duplicidade e controle de presença no evento.
        </p>
      </div>

      {/* Main Validation Scanner Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <form onSubmit={handleCheckin} className="max-w-xl mx-auto space-y-3">
          <label className="block text-center font-bold text-sm text-slate-800">
            Escaneie o QR Code ou Digite o Código / E-mail do Participante
          </label>

          <div className="relative">
            <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="Ex: QR-CX26-LUCAS-8801 ou INS-2026-8801 ou e-mail"
              value={codeOrToken}
              onChange={e => setCodeOrToken(e.target.value)}
              className="w-full pl-11 pr-28 py-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-semibold text-slate-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-colors"
            >
              Validar
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Dica de teste: Digite <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">QR-CX26-GABRIEL-8802</code> ou o código impresso no voucher.
          </p>
        </form>

        {/* Feedback Alert Messages */}
        {result && (
          <div className="max-w-xl mx-auto p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-emerald-950">{result.message}</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                {result.registration.attendeeName} · {result.registration.lotName} · Inscrição {result.registration.code}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <XCircle className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-red-950">Atenção no Credenciamento</h4>
              <p className="text-xs text-red-800 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Check-ins List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Credenciamentos Recentes ({recentCheckedIn.length} participantes validados)
          </h3>
          <span className="text-[10px] text-emerald-600 font-semibold font-mono">
            Sincronizado em tempo real
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentCheckedIn.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Nenhum check-in registrado ainda hoje.</div>
          ) : (
            recentCheckedIn.map((item: any) => (
              <div key={item.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.attendeeName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.code} · {item.lotName} · {item.cellName || 'Igreja Sede'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmado
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {item.checkedInAt ? new Date(item.checkedInAt).toLocaleTimeString('pt-BR') : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
