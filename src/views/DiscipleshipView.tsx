import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Clock,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { PastoralFollowup } from '../types';

export const DiscipleshipView: React.FC = () => {
  const [pipeline, setPipeline] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New followup form
  const [personName, setPersonName] = useState('');
  const [stage, setStage] = useState<'visitante' | 'primeiro_contato' | 'integracao' | 'discipulado' | 'membro_ativo' | 'lider_formacao'>('primeiro_contato');
  const [channel, setChannel] = useState<'whatsapp' | 'presencial' | 'ligacao'>('whatsapp');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadPipeline = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDiscipleshipPipeline();
      setPipeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const stagesList = [
    { key: 'visitante', label: '1. Visitante', desc: 'Porta de entrada', color: 'border-blue-400' },
    { key: 'primeiro_contato', label: '2. 1º Contato', desc: 'Mensagem de boas-vindas', color: 'border-amber-400' },
    { key: 'integracao', label: '3. Integração', desc: 'Conectado a uma célula', color: 'border-purple-400' },
    { key: 'discipulado', label: '4. Discipulado', desc: 'Estudo 1 a 1', color: 'border-indigo-400' },
    { key: 'membro_ativo', label: '5. Membro Ativo', desc: 'Batismo & comunhão', color: 'border-emerald-400' },
    { key: 'lider_formacao', label: '6. Líder Formação', desc: 'Treinamento de líderes', color: 'border-rose-400' }
  ];

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !notes) return;

    try {
      await api.createFollowup({
        personName,
        stage,
        channel,
        scheduledDate,
        notes
      });
      setShowModal(false);
      setPersonName('');
      setNotes('');
      loadPipeline();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar acompanhamento.');
    }
  };

  const handleAdvanceStage = async (followup: PastoralFollowup, nextStage: any) => {
    try {
      await api.updateFollowup(followup.id, { stage: nextStage });
      loadPipeline();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar etapa.');
    }
  };

  const handleCompleteTask = async (followup: PastoralFollowup) => {
    try {
      await api.updateFollowup(followup.id, { status: 'concluido' });
      loadPipeline();
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir tarefa.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Jornada do Membro & Discipulado</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Funil pastoral contínuo: do primeiro contato como visitante até a formação de um novo líder de célula.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Acompanhamento</span>
        </button>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {stagesList.map((st, idx) => {
          const items = pipeline?.followups?.filter((f: PastoralFollowup) => f.stage === st.key) || [];

          return (
            <div key={st.key} className="bg-slate-100/80 rounded-lg p-2.5 flex flex-col min-w-44 border border-slate-200/60">
              <div className={`border-t-2 ${st.color} pt-2 pb-1.5 flex items-center justify-between`}>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{st.label}</h4>
                  <p className="text-[10px] text-slate-500">{st.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2 mt-2 flex-1">
                {items.length === 0 ? (
                  <div className="text-[11px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded">
                    Vazio
                  </div>
                ) : (
                  items.map((item: PastoralFollowup) => {
                    const isDone = item.status === 'concluido';
                    const nextStageKey = stagesList[idx + 1]?.key;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white p-3 rounded-md border border-slate-200 shadow-2xs text-xs space-y-2 transition-all ${
                          isDone ? 'opacity-70 bg-slate-50' : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-slate-900 leading-tight">{item.personName}</p>
                          {isDone ? (
                            <span className="text-emerald-600" title="Concluído">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-amber-600" title="Pendente">
                              <Clock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-1.5 rounded">
                          {item.notes}
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="capitalize">{item.channel}</span>
                          <span className="tabular-nums font-mono">
                            {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1">
                          {!isDone && (
                            <button
                              onClick={() => handleCompleteTask(item)}
                              className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold"
                            >
                              Concluir
                            </button>
                          )}
                          {nextStageKey && (
                            <button
                              onClick={() => handleAdvanceStage(item, nextStageKey)}
                              className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-semibold ml-auto"
                              title="Avançar para a próxima etapa do funil"
                            >
                              <span>Avançar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Acompanhamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Novo Acompanhamento Pastoral</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Pessoa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do visitante ou discípulo"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Etapa Atual</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="visitante">Visitante</option>
                    <option value="primeiro_contato">1º Contato</option>
                    <option value="integracao">Integração</option>
                    <option value="discipulado">Discipulado</option>
                    <option value="membro_ativo">Membro Ativo</option>
                    <option value="lider_formacao">Líder em Formação</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Canal de Contato</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="presencial">Presencial (Culto/Célula)</option>
                    <option value="ligacao">Ligação Telefônica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data Agendada</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anotações Pastorais *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o objetivo do contato, situação espiritual ou pedidos..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  Salvar Acompanhamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
