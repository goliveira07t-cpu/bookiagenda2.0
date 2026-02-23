
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  XCircle, 
  CheckCircle2, 
  X, 
  MapPin, 
  Phone, 
  User, 
  Building, 
  Mail, 
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  ArrowRight,
  Lock,
  Pencil,
  Power,
  PowerOff,
  AlertTriangle,
  Trash2,
  Package,
  Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const CompaniesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados de Edição/Exclusão
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    responsible_name: '',
    phone: '',
    address: '',
    owner_email: '',
    access_password: '',
    category: 'Barbearia',
    plan: '',
    logo_url: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('plans')
      .select('name')
      .eq('status', 'ACTIVE');
    if (data) setAvailablePlans(data);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar empresas:", error.message);
    } else if (data) {
      setCompanies(data);
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ 
      name: '', 
      responsible_name: '', 
      phone: '', 
      address: '', 
      owner_email: '', 
      access_password: '',
      category: 'Barbearia',
      plan: availablePlans.length > 0 ? availablePlans[0].name : '',
      logo_url: ''
    });
    setLogoPreview(null);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({...formData, logo_url: url});
    if (url) {
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  };

  const handleLogoUrlBlur = (url: string) => {
    if (url) {
      setLogoPreview(url);
    }
  };

  const handleOpenEditModal = (company: any) => {
    setIsEditing(true);
    setEditingId(company.id);
    setFormData({
      name: company.name || '',
      responsible_name: company.responsible_name || '',
      phone: company.phone || '',
      address: company.address || '',
      owner_email: company.owner_email || '',
      access_password: company.access_password || '',
      category: company.category || 'Barbearia',
      plan: company.plan || '',
      logo_url: company.logo_url || ''
    });
    setLogoPreview(company.logo_url || null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (company: any) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const handleCreateOrUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de senha: mínimo 8 caracteres, letras e números
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(formData.access_password)) {
      alert("Segurança: A senha deve ter no mínimo 8 caracteres e conter pelo menos uma letra e um número.");
      return;
    }

    if (!formData.plan && availablePlans.length > 0) {
      alert("Por favor, selecione um plano para a empresa.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const payload = { 
        name: formData.name,
        responsible_name: formData.responsible_name,
        phone: formData.phone,
        address: formData.address,
        owner_email: formData.owner_email,
        access_password: formData.access_password,
        category: formData.category,
        plan: formData.plan,
        logo_url: formData.logo_url || null,
        status: isEditing ? undefined : 'ACTIVE'
      };

      let error;
      if (isEditing && editingId) {
        const { error: updateError } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('companies')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setIsModalOpen(false);
      setLogoPreview(null);
      await fetchCompanies();
    } catch (error: any) {
      alert('Erro ao processar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const { error } = await supabase
      .from('companies')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      fetchCompanies();
    } else {
      alert('Erro ao alterar status: ' + error.message);
    }
  };

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsSubmitting(true);
    
    const { error } = await supabase.from('companies').delete().eq('id', companyToDelete.id);
    
    if (!error) {
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 font-medium text-sm transition-all shadow-sm dark:text-white dark:placeholder:text-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCompanies} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] hover:bg-indigo-700 active:scale-95 transition-all text-sm font-black shadow-lg shadow-indigo-100 dark:shadow-none w-full md:w-auto"
          >
            <Plus size={20} /> Nova Empresa
          </button>
        </div>
      </div>

      {/* Main Grid/Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Empresa & Responsável</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Segmento</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Status SaaS</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())).map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform overflow-hidden ${company.status === 'INACTIVE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'}`}>
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          company.name?.charAt(0) || 'B'
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-black leading-none mb-1 ${company.status === 'INACTIVE' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'}`}>{company.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1">
                          <User size={10} /> {company.responsible_name || 'Admin'} • <Package size={10} className="ml-1" /> {company.plan || 'Sem Plano'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${company.status === 'INACTIVE' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-indigo-400'}`}></div>
                      <span className={`text-xs font-black uppercase ${company.status === 'INACTIVE' ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>{company.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleStatus(company.id, company.status)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                        company.status === 'ACTIVE' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                      }`}
                    >
                      {company.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <PowerOff size={12} />}
                      {company.status || 'Ativo'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(company)} 
                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        title="Editar Informações"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(company.id, company.status)} 
                        className={`p-2.5 rounded-xl transition-all ${company.status === 'ACTIVE' ? 'text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                        title={company.status === 'ACTIVE' ? "Inativar Empresa" : "Ativar Empresa"}
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(company)} 
                        className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                        title="Excluir Permanentemente"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase text-xs tracking-widest">Nenhuma empresa encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmar Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20 dark:border-slate-800">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100/50 dark:shadow-none">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Confirmar Exclusão?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                Você está prestes a excluir <span className="text-slate-900 dark:text-slate-200 font-black">"{companyToDelete?.name}"</span>. Esta ação é irreversível e removerá todos os dados vinculados.
              </p>
              
              <div className="mt-10 flex flex-col gap-3">
                <button 
                  onClick={confirmDeleteCompany}
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>Sim, Excluir Agora <Trash2 size={18} /></>
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

      {/* Modern Modal "Nova/Editar Empresa" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden flex flex-col border border-white/20 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="relative p-8 pb-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isEditing ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'} dark:shadow-none`}>
                  {isEditing ? <Pencil size={28} /> : <Building size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Configuração do SaaS</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateOrUpdateCompany} className="p-8 pt-4 space-y-6 overflow-y-auto max-h-[75vh]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Barber Shop Pro"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Responsável</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.responsible_name} 
                      onChange={e => setFormData({...formData, responsible_name: e.target.value})}
                      placeholder="Nome do Dono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">URL da Logomarca</label>
                <div className="relative group">
                  {logoPreview && (
                    <div className="mb-4 flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg bg-white dark:bg-slate-900 p-2" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Preview da Logo</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 font-mono">{logoPreview}</p>
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="url"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.logo_url} 
                      onChange={handleLogoChange}
                      onBlur={(e) => handleLogoUrlBlur(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-600 font-medium mt-2">Cole aqui a URL da logomarca (recomendado: PNG ou JPG)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      type="email"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.owner_email} 
                      onChange={e => setFormData({...formData, owner_email: e.target.value})}
                      placeholder="email@acesso.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      type="password"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.access_password} 
                      onChange={e => setFormData({...formData, access_password: e.target.value})}
                      placeholder="Mín. 8 chars, letras e números"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Segmento</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <select 
                      className="w-full pl-11 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all appearance-none cursor-pointer dark:text-white"
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Barbearia</option>
                      <option>Salão de Beleza</option>
                      <option>Estética</option>
                      <option>Esmalteria</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Plano SaaS Associado</label>
                <div className="relative group">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <select 
                    required
                    className="w-full pl-11 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all appearance-none cursor-pointer disabled:opacity-50 dark:text-white"
                    value={formData.plan} 
                    onChange={e => setFormData({...formData, plan: e.target.value})}
                    disabled={availablePlans.length === 0}
                  >
                    {availablePlans.length > 0 ? (
                      <>
                        <option value="" disabled>Selecione um plano</option>
                        {availablePlans.map((p, idx) => (
                          <option key={idx} value={p.name}>{p.name}</option>
                        ))}
                      </>
                    ) : (
                      <option value="">Nenhum plano ativo cadastrado</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    required 
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder:text-slate-700"
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`w-full text-white py-5 rounded-[1.5rem] font-black text-lg active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 dark:shadow-none' : 'bg-black dark:bg-indigo-600 hover:bg-indigo-600 shadow-indigo-100 dark:shadow-none'}`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>{isEditing ? 'Salvar Alterações' : 'Registrar Empresa'} <ArrowRight size={22} /></>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-4">
                  <ShieldCheck size={12} className="inline mr-1 mb-0.5" /> Segurança BOOKI Ativada
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesView;