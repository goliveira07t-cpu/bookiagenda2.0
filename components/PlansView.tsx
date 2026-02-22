
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Check, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  X, 
  DollarSign, 
  ListChecks, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const PlansView: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: 'ACTIVE',
    features: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (data) setPlans(data);
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', price: '', status: 'ACTIVE', features: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: any) => {
    setIsEditing(true);
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      status: plan.status,
      features: plan.features ? plan.features.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (plan: any) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setIsSubmitting(true);
    
    const { error } = await supabase.from('plans').delete().eq('id', planToDelete.id);
    
    if (!error) {
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== '');
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      status: formData.status,
      features: featuresArray
    };

    try {
      if (isEditing && editingId) {
        const { error } = await supabase.from('plans').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('plans').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      alert('Erro ao salvar plano: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tighter">Planos SaaS</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie os pacotes de assinatura BOOKI</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] hover:bg-indigo-700 active:scale-95 transition-all text-sm font-black shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} /> Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [1,2,3].map(i => (
             <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-pulse h-80"></div>
           ))
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all border-b-4 border-b-transparent hover:border-b-indigo-500">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl transition-transform group-hover:rotate-6 ${plan.status === 'ACTIVE' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Package size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleOpenEditModal(plan)}
                    className="p-2.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                    title="Editar Plano"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleOpenDeleteModal(plan)}
                    className="p-2.5 bg-rose-50 dark:bg-rose-900 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                    title="Excluir Plano"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6 text-slate-900 dark:text-white">
                <span className="text-sm font-black text-slate-400 dark:text-slate-500">R$</span>
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{plan.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">/ mês</span>
              </div>

              <div className="space-y-3 mb-8 min-h-[120px]">
                {plan.features?.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all uppercase tracking-[0.2em]">
                Gerenciar Assinantes
              </button>
              
              <div className="absolute top-0 right-0 p-4">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${plan.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900'}`}>
                  {plan.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Confirmar Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20 dark:border-slate-800">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100/50 dark:shadow-none">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Excluir Plano?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                Você tem certeza que deseja excluir o plano <span className="text-slate-900 dark:text-slate-200 font-black">"{planToDelete?.name}"</span>? Esta ação pode impactar empresas que utilizam este plano.
              </p>
              
              <div className="mt-10 flex flex-col gap-3">
                <button 
                  onClick={confirmDeletePlan}
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>Sim, Excluir Plano <Trash2 size={18} /></>
                  )}
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-750 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo/Editar Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col border border-white/20 dark:border-slate-800">
            
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isEditing ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'} dark:shadow-none`}>
                  {isEditing ? <Edit2 size={28} /> : <Package size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{isEditing ? 'Editar Plano' : 'Novo Plano SaaS'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Cobrança</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome do Plano</label>
                  <div className="relative group">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Pro Plus"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Preço Mensal (R$)</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      type="number"
                      step="0.01"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="99.90"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Funcionalidades (separadas por vírgula)</label>
                <div className="relative group">
                  <ListChecks className="absolute left-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <textarea 
                    required 
                    rows={3}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all resize-none dark:text-white dark:placeholder:text-slate-700"
                    value={formData.features} 
                    onChange={e => setFormData({...formData, features: e.target.value})}
                    placeholder="Suporte 24h, Relatórios, Usuários ilimitados..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status do Plano</label>
                <div className="flex gap-2">
                  {['ACTIVE', 'INACTIVE'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({...formData, status})}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                        formData.status === status 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      {status === 'ACTIVE' ? 'Ativo (Vender)' : 'Pausado (Ocultar)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full text-white py-5 rounded-[1.5rem] font-black text-lg active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 ${isEditing ? 'bg-amber-500 shadow-amber-100 dark:shadow-none' : 'bg-black dark:bg-indigo-600 hover:bg-indigo-600 shadow-indigo-100 dark:shadow-none'}`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>{isEditing ? 'Salvar Alterações' : 'Criar Plano Agora'} <ArrowRight size={22} /></>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-indigo-500" /> Processamento Seguro Master
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;