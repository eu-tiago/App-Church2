import React, { useState } from 'react';
import {
  Music,
  Users,
  Calendar,
  Sparkles,
  Heart,
  BookOpen,
  Camera,
  Shield
} from 'lucide-react';

export const MinistriesView: React.FC = () => {
  const ministries = [
    {
      id: 'min_louvor',
      name: 'Ministério de Louvor & Adoração',
      desc: 'Bandas musicais, cantores, sonoplastia e adoração congregacional.',
      leader: 'Lucas Ferreira',
      membersCount: 16,
      icon: Music,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'min_midia',
      name: 'Comunicação & Mídia',
      desc: 'Transmissão ao vivo, fotografia dos cultos, redes sociais e projeção.',
      leader: 'Beatriz Albuquerque',
      membersCount: 12,
      icon: Camera,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      id: 'min_intercessao',
      name: 'Intercessão & Oração',
      desc: 'Vigílias, escala de oração antes dos cultos e plantão pastoral.',
      leader: 'Carla Mendes',
      membersCount: 22,
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      id: 'min_ensino',
      name: 'Ensino & EBD',
      desc: 'Escola bíblica dominical, discipulado de novos convertidos e teologia.',
      leader: 'Pr. Tiago Silva',
      membersCount: 8,
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ministérios & Departamentos</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Gestão de equipes ministeriais, voluntários e liderança departamental.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {ministries.map(m => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{m.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Líder:</span>
                  <span className="font-semibold text-slate-800">{m.leader}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voluntários:</span>
                  <span className="font-bold text-blue-600">{m.membersCount} ativos</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
