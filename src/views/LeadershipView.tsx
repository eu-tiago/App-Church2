import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Users,
  Shield,
  ChevronDown,
  Church,
  Network
} from 'lucide-react';
import { api } from '../services/api';

export const LeadershipView: React.FC = () => {
  const [tree, setTree] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLeadershipTree();
        setTree(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !tree) {
    return <div className="p-8 text-center text-slate-400">Carregando organograma...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organograma & Hierarquia Pastoral</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Estrutura de liderança, supervisão de células e cadeia de discipulado da igreja.
        </p>
      </div>

      {/* Visual Hierarchy Cards */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-2xs space-y-8 flex flex-col items-center">
        {/* Level 1: Senior Pastor */}
        <div className="flex flex-col items-center">
          <div className="w-80 bg-slate-900 text-white p-4 rounded-lg shadow-sm border border-slate-800 text-center relative">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white mb-2">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-sm">{tree.name}</h3>
            <p className="text-xs text-blue-400 font-medium">{tree.role}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{tree.congregation}</p>
          </div>
          <div className="w-0.5 h-8 bg-slate-300" />
        </div>

        {/* Level 2: Supervisors & Campus Pastors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl relative">
          <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300 -translate-y-4" />

          {tree.children?.map((child: any) => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-full max-w-xs bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-2xs text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">{child.name}</h4>
                <p className="text-[11px] text-purple-700 font-semibold">{child.role}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{child.congregation}</p>
              </div>

              <div className="w-0.5 h-6 bg-slate-300" />

              {/* Level 3: Cell Leaders */}
              <div className="space-y-3 w-full max-w-xs">
                {child.children?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="bg-white border border-slate-200 p-3 rounded-md shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <Network className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{sub.name}</p>
                        <p className="text-[10px] text-slate-500">{sub.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {sub.membersCount} discipulados
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
