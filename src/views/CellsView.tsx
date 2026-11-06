import React, { useState, useEffect } from 'react';
import {
  Network,
  Plus,
  Users,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  X,
  History,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Cell, Member } from '../types';
import { useAuth } from '../context/AuthContext';

export const CellsView: React.FC = () => {
  const { user } = useAuth();
  const [cells, setCells] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showNewCellModal, setShowNewCellModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);

  // New cell fields
  const [cellName, setCellName] = useState('');
  const [cellType, setCellType] = useState<'mista' | 'jovens' | 'casais' | 'mulheres' | 'homens'>('mista');
  const [dayOfWeek, setDayOfWeek] = useState<'quarta' | 'quinta' | 'sexta' | 'sabado'>('quarta');
  const [meetingTime, setMeetingTime] = useState('20:00');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('15');

  // Meeting report fields
  const [meetingTheme, setMeetingTheme] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [membersPresent, setMembersPresent] = useState('10');
  const [visitorsPresent, setVisitorsPresent] = useState('2');
  const [absentCount, setAbsentCount] = useState('1');
  const [offeringAmount, setOfferingAmount] = useState('120.00');
  const [decisionsCount, setDecisionsCount] = useState('0');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [observations, setObservations] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cellsData, membersData] = await Promise.all([
        api.getCells(),
        api.getMembers()
      ]);
      setCells(cellsData);
      setMembers(membersData);
      if (membersData.length > 0 && !leaderId) {
        setLeaderId(membersData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellName || !leaderId || !address) return;

    try {
      await api.createCell({
        name: cellName,
        type: cellType,
        dayOfWeek,
        meetingTime: `${meetingTime}:00`,
        address,
        neighborhood,
        leaderId,
        maxCapacity: Number(maxCapacity)
      });
      setShowNewCellModal(false);
      setCellName('');
      setAddress('');
      setNeighborhood('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar célula.');
    }
  };

  const handleOpenMeetingModal = (cell: any) => {
    setSelectedCell(cell);
    setMeetingTheme('');
    setOfferingAmount('100.00');
    setDecisionsCount('0');
    setShowMeetingModal(true);
  };

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !meetingTheme) return;

    try {
      await api.createCellMeeting(selectedCell.id, {
        theme: meetingTheme,
        meetingDate,
        membersPresent: Number(membersPresent),
        visitorsPresent: Number(visitorsPresent),
        absentCount: Number(absentCount),
        offeringAmount: Number(offeringAmount),
        decisionsCount: Number(decisionsCount),
        prayerRequests,
        observations
      });
      setShowMeetingModal(false);
      alert('Relatório de reunião registrado com sucesso! Oferta integrada automaticamente ao financeiro.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar reunião.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestão de Células & Grupos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comunhão nos lares, multiplicação, registro de relatórios e ofertas de cada encontro.
          </p>
        </div>

        <button
          onClick={() => setShowNewCellModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Célula</span>
        </button>
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Carregando células...</div>
        ) : cells.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Nenhuma célula cadastrada.</div>
        ) : (
          cells.map(cell => (
            <div key={cell.id} className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {cell.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {cell.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5">{cell.name}</h3>
                <p className="text-[11px] text-slate-500 capitalize">Tipo: {cell.type}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">Líder: {cell.leaderName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="capitalize">{cell.dayOfWeek} às {cell.meetingTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cell.address} - {cell.neighborhood}</span>
                  </div>
                </div>

                {/* Last meeting metrics */}
                {cell.lastMeeting && (
                  <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Último Encontro:</span>
                      <span className="font-mono tabular-nums">{new Date(cell.lastMeeting.meetingDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-slate-500">
                      <span>Presenças: {cell.lastMeeting.totalMembersPresent + cell.lastMeeting.totalVisitorsPresent}</span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        Oferta: R$ {cell.lastMeeting.offeringAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {cell.memberCount} participantes
                </span>

                <button
                  onClick={() => handleOpenMeetingModal(cell)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lançar Relatório</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Lançar Relatório de Reunião */}
      {showMeetingModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Relatório da Reunião</h3>
                <p className="text-[11px] text-slate-500">{selectedCell.name} ({selectedCell.code})</p>
              </div>
              <button onClick={() => setShowMeetingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMeeting} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tema / Estudo Ministrado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O Poder da Oração Eficaz"
                  value={meetingTheme}
                  onChange={e => setMeetingTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data da Reunião</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Decisões por Cristo</label>
                  <input
                    type="number"
                    min="0"
                    value={decisionsCount}
                    onChange={e => setDecisionsCount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Attendance metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Membros Presentes</label>
                  <input
                    type="number"
                    min="0"
                    value={membersPresent}
                    onChange={e => setMembersPresent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1 text-[11px]">Novos Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    value={visitorsPresent}
                    onChange={e => setVisitorsPresent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-emerald-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1 text-[11px]">Ausentes</label>
                  <input
                    type="number"
                    min="0"
                    value={absentCount}
                    onChange={e => setAbsentCount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-600 font-semibold"
                  />
                </div>
              </div>

              {/* Offering with automatic financial integration */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Oferta da Célula (R$) - Integrada ao Financeiro Geral
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-semibold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offeringAmount}
                    onChange={e => setOfferingAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Ao salvar, este valor gera um lançamento de receita em &apos;Ofertas de Célula&apos; no módulo financeiro.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pedidos de Oração & Observações</label>
                <textarea
                  rows={2}
                  placeholder="Motivos de oração compartilhados pela célula..."
                  value={prayerRequests}
                  onChange={e => setPrayerRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Confirmar e Salvar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Nova Célula */}
      {showNewCellModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Cadastrar Nova Célula</h3>
              <button onClick={() => setShowNewCellModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCell} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Célula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Célula Betel (Jovens Universitários)"
                  value={cellName}
                  onChange={e => setCellName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Célula</label>
                  <select
                    value={cellType}
                    onChange={e => setCellType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="mista">Mista</option>
                    <option value="jovens">Jovens</option>
                    <option value="casais">Casais & Famílias</option>
                    <option value="mulheres">Mulheres</option>
                    <option value="homens">Homens</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Líder Responsável *</label>
                  <select
                    value={leaderId}
                    onChange={e => setLeaderId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.isLeader ? '(Líder)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dia da Semana</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 capitalize"
                  >
                    <option value="quarta">Quarta-feira</option>
                    <option value="quinta">Quinta-feira</option>
                    <option value="sexta">Sexta-feira</option>
                    <option value="sabado">Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={e => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endereço Completo do Anfitrião *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, número, apto"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidade Máxima</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCellModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Criar Célula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
