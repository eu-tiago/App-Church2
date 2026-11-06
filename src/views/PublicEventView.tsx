import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  CreditCard,
  Copy,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface PublicEventViewProps {
  onBackToApp: () => void;
  eventSlug?: string;
}

export const PublicEventView: React.FC<PublicEventViewProps> = ({ onBackToApp, eventSlug = 'conexao-jovem-2026' }) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string>('');

  // Attendee registration form
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [attendeeCpf, setAttendeeCpf] = useState('');
  const [congregationName, setCongregationName] = useState('Sede Central');
  const [cellName, setCellName] = useState('Célula Ágape (Jovens)');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  // Checkout states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRegistration, setConfirmedRegistration] = useState<any | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.getPublicEvent(eventSlug);
        setData(res);
        if (res.lots && res.lots.length > 0) {
          setSelectedLotId(res.lots[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [eventSlug]);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || !attendeeName || !attendeeEmail || !attendeePhone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.registerPublicEvent(eventSlug, {
        lotId: selectedLotId,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        attendeeCpf,
        congregationName,
        cellName,
        paymentMethod
      });
      setConfirmedRegistration(res.registration);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar inscrição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136churchflow-asaas-mock-pix-key-9918235204000053039865405119.005802BR5925IGREJA BATISTA CENTRAL6009SAO PAULO62070503***6304E8A1');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Carregando evento público...
      </div>
    );
  }

  const { event, church, lots } = data;
  const selectedLot = lots.find((l: any) => l.id === selectedLotId) || lots[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar for Demo Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 backdrop-blur-md">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar ao Painel Administrativo</span>
        </button>

        <span className="text-[11px] text-blue-400 font-mono">
          Ambiente Público de Vendas & Inscrições (Sem necessidade de login)
        </span>
      </div>

      {confirmedRegistration ? (
        /* Confirmation Screen */
        <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Inscrição Confirmada com Sucesso!
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{event.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Guarde seu ingresso digital abaixo para apresentar no credenciamento.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Participante</span>
                  <p className="text-sm font-bold text-white">{confirmedRegistration.attendeeName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Código do Ingresso</span>
                  <p className="text-sm font-mono font-bold text-blue-400">{confirmedRegistration.code}</p>
                </div>
              </div>

              {/* QR Code Visual representation */}
              <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center text-slate-950 w-44 mx-auto shadow-md">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="font-mono text-[9px] font-bold mt-1 text-slate-700 tracking-wider">
                  {confirmedRegistration.qrCodeToken}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-500 block">Lote Adquirido</span>
                  <span className="font-semibold text-slate-200">{confirmedRegistration.lotName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Valor Pago</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    R$ {confirmedRegistration.finalAmount.toFixed(2)} ({confirmedRegistration.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Imprimir / Salvar PDF
              </button>
              <button
                onClick={onBackToApp}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Retornar ao ChurchFlow
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Public Sales Landing */
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-8 md:p-12 shadow-2xl">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{church.name} apresenta</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>20 a 22 de Novembro de 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{event.locationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Início às 19h30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lotes selection */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                1. Escolha seu Lote
              </h3>

              <div className="space-y-3">
                {lots.map((lot: any) => {
                  const isSelected = selectedLotId === lot.id;
                  const isSoldOut = lot.quantitySold >= lot.quantityTotal;

                  return (
                    <div
                      key={lot.id}
                      onClick={() => !isSoldOut && setSelectedLotId(lot.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500'
                          : isSoldOut
                          ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{lot.name}</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          R$ {lot.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isSoldOut ? 'Lote esgotado' : `Restam ${lot.quantityTotal - lot.quantitySold} vagas`}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Pagamento 100% Seguro</span>
                </div>
                <p className="text-[11px]">
                  Processamento oficial via gateway Asaas / Banco Central do Brasil. Seu comprovante e QR Code são gerados imediatamente.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                2. Seus Dados para a Inscrição
              </h3>

              <form onSubmit={handleSubmitRegistration} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo para o crachá"
                    value={attendeeName}
                    onChange={e => setAttendeeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={attendeeEmail}
                      onChange={e => setAttendeeEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">WhatsApp / Telefone *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98888-7777"
                      value={attendeePhone}
                      onChange={e => setAttendeePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">CPF (Opcional)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={attendeeCpf}
                      onChange={e => setAttendeeCpf(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Célula / Grupo que frequenta</label>
                    <input
                      type="text"
                      placeholder="Ex: Célula Ágape ou Visitante"
                      value={cellName}
                      onChange={e => setCellName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="pt-3 border-t border-slate-800">
                  <label className="block font-semibold text-slate-300 mb-2">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'pix'
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-bold block text-xs">PIX Imediato</span>
                        <span className="text-[10px] text-slate-400">Confirmação automática</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <div>
                        <span className="font-bold block text-xs">Cartão de Crédito</span>
                        <span className="text-[10px] text-slate-400">Até 3x no gateway</span>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Chave Copia e Cola Gerada</span>
                      <span className="text-xs text-slate-300 font-mono">00020126580014br.gov.bcb.pix0136...</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyPixCode}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>
                      {isSubmitting
                        ? 'Processando no Gateway...'
                        : `Finalizar Inscrição (R$ ${selectedLot?.price?.toFixed(2) || '0.00'})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
