
import React from 'react';
import { Scissors, Sparkles, UserCheck, Palmtree, Info } from 'lucide-react';

const ServicesView: React.FC = () => {
  const categories = [
    { name: 'Barbeiros', icon: Scissors, count: 240, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Cabeleireiros', icon: UserCheck, count: 185, color: 'text-purple-600 bg-purple-50' },
    { name: 'Manicure', icon: Sparkles, count: 130, color: 'text-fuchsia-600 bg-fuchsia-50' },
    { name: 'Estética/Sobrancelha', icon: Palmtree, count: 95, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="text-indigo-600 shrink-0" size={20} />
        <p className="text-sm text-indigo-700">
          Como <strong>Administrador Master</strong>, você define as categorias globais que estarão disponíveis para todas as empresas do SaaS BOOKI. Alterações aqui refletem em todo o ecossistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
              <cat.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-800">{cat.name}</h3>
            <p className="text-sm text-slate-400">{cat.count} serviços ativos</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Catálogo Global de Serviços</h2>
          <button className="text-indigo-600 text-sm font-bold px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all">
            + Nova Categoria
          </button>
        </div>
        <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
            Selecione uma categoria acima para gerenciar os serviços padrão vinculados a ela em todo o SaaS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicesView;
