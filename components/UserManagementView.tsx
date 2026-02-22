
import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, User, ShieldCheck, Search, RefreshCw, UserPlus, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'MASTER': return <ShieldAlert className="text-rose-500" size={18} />;
      case 'ADMIN': return <ShieldCheck className="text-indigo-500" size={18} />;
      case 'PROFESSIONAL': return <Shield className="text-emerald-500" size={18} />;
      default: return <User className="text-slate-400" size={18} />;
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-4 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-black tracking-tighter">Usuários & Permissões</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Controle de acesso do ecossistema</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-bold"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchUsers}
              className="p-3.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex-1 sm:flex-none">
              <UserPlus size={18} /> <span className="sm:inline hidden">Novo Usuário</span><span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Consultando Supabase...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold">Nenhum usuário encontrado.</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-50 rounded-3xl hover:border-indigo-100 transition-all group hover:bg-indigo-50/20 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shadow-inner shrink-0">
                    {u.full_name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-black truncate">{u.full_name || 'Sem Nome'}</p>
                      {getRoleIcon(u.role)}
                    </div>
                    <p className="text-xs text-slate-400 font-bold truncate">{u.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Papel</p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase inline-block mt-1 ${
                      u.role === 'MASTER' ? 'bg-rose-100 text-rose-600' : 
                      u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID Único</p>
                    <p className="text-[10px] text-slate-300 font-mono mt-1">{u.id.substring(0, 8)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="text-indigo-600 font-black text-xs px-5 py-2.5 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                      Editar
                    </button>
                    <button className="sm:hidden p-2 text-slate-400 hover:text-black">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
