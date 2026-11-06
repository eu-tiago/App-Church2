import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  DollarSign,
  QrCode,
  Tag,
  MapPin,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { EventItem } from '../types';
import { NavItemKey } from '../components/layout/Sidebar';

interface EventsViewProps {
  onNavigate: (view: NavItemKey) => void;
  onSelectEventForFinance?: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onNavigate, onSelectEventForFinance }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New event form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'congresso' | 'conferencia' | 'retiro' | 'acampamento' | 'encontro_casais'>('congresso');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('300');
  const [isPaid, setIsPaid] = useState(true);

  // Lots fields
  const [lot1Price, setLot1Price] = useState('89.00');
  const [lot1Qty, setLot1Qty] = useState('100');
  const [lot2Price, setLot2Price] = useState('119.00');
  const [lot2Qty, setLot2Qty] = useState('200');

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !locationName) return;

    try {
      await api.createEvent({
        title,
        description,
        category,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(startDate).toISOString(),
        locationName,
        address,
        capacity: Number(capacity),
        isPaid,
        lots: isPaid
          ? [
              { name: '1º Lote Promocional', price: Number(lot1Price), quantity: Number(lot1Qty) },
              { name: '2º Lote Oficial', price: Number(lot2Price), quantity: Number(lot2Qty) }
            ]
          : [{ name: 'Inscrição Gratuita', price: 0, quantity: Number(capacity) }]
      });

      setShowModal(false);
      setTitle('');
      setDescription('');
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar evento.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Eventos, Congressos & Inscrições</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plataforma própria de comercialização de lotes com checkout PIX/Cartão e controle de participantes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('checkin')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <QrCode className="w-4 h-4 text-slate-500" />
            <span>Terminal Check-in QR</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Nenhum evento cadastrado.</div>
        ) : (
          events.map(event => {
            const soldPercent = event.capacity ? Math.min(100, Math.round(((event.totalSold || 0) / event.capacity) * 100)) : 0;

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 hover:border-slate-300 transition-colors space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {event.category}
                      </span>
                      {event.isPublished ? (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Inscrições Abertas
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Rascunho</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(event.startDate).toLocaleDateString('pt-BR')} até {new Date(event.endDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {event.locationName}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => onNavigate('event_finance')}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Painel Financeiro</span>
                    </button>
                    <button
                      onClick={() => onNavigate('checkin')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Fazer Check-in</span>
                    </button>
                  </div>
                </div>

                {/* Lots & Metrics Strip */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Vagas Ocupadas</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5 tabular-nums">
                      {event.paidRegistrations || 0} / {event.capacity} ({soldPercent}%)
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${soldPercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px]">Receita Bruta Confirmada</span>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5 tabular-nums">
                      R$ {(event.grossRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-slate-400">Gateway Asaas / Cartão / PIX</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px]">Check-ins Realizados</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5 tabular-nums">
                      {event.checkedInCount || 0} presentes
                    </p>
                    <span className="text-[10px] text-slate-400">Validados por QR Code</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px]">Lotes Ativos</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.lots?.map((lot: any) => (
                        <span
                          key={lot.id}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            lot.isActive ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                          }`}
                        >
                          {lot.name}: R$ {lot.price.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar Evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Cadastrar Novo Evento</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conferência Transformados 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 capitalize"
                  >
                    <option value="congresso">Congresso</option>
                    <option value="conferencia">Conferência</option>
                    <option value="retiro">Retiro</option>
                    <option value="acampamento">Acampamento</option>
                    <option value="encontro_casais">Encontro de Casais</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidade Total</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Término</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Local *</label>
                  <input
                    type="text"
                    required
                    placeholder="Auditório Principal IBC"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    placeholder="Av. Paulista, 1800"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lotes Configuration */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Configuração de Lotes de Inscrição</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={e => setIsPaid(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    Evento Pago
                  </label>
                </div>

                {isPaid && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-700 block">1º Lote (Promocional)</span>
                      <div>
                        <span className="text-[10px] text-slate-500">Valor (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={lot1Price}
                          onChange={e => setLot1Price(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Quantidade Vagas</span>
                        <input
                          type="number"
                          value={lot1Qty}
                          onChange={e => setLot1Qty(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-700 block">2º Lote (Oficial)</span>
                      <div>
                        <span className="text-[10px] text-slate-500">Valor (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={lot2Price}
                          onChange={e => setLot2Price(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Quantidade Vagas</span>
                        <input
                          type="number"
                          value={lot2Qty}
                          onChange={e => setLot2Qty(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição e Programação</label>
                <textarea
                  rows={3}
                  placeholder="Informações para a página pública de divulgação..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Publicar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
