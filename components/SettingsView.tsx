
import React from 'react';
import { Lock, Bell, Database, Globe, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Auditoria de Segurança Master */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase">Status de Segurança Master</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Políticas RLS</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="font-bold text-sm">Proteção Ativa</p>
              <p className="text-[10px] text-indigo-100 mt-1 uppercase">Apenas o Master Admin tem acesso total.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Autenticação</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="font-bold text-sm">Leaked Password Protection</p>
              <p className="text-[10px] text-indigo-100 mt-1 uppercase">Verificação de senhas vazadas ativada.</p>
            </div>
          </div>
        </div>
        <ShieldAlert className="absolute -right-10 -bottom-10 text-white/5" size={200} />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Segurança da Plataforma</h2>
          <p className="text-sm text-slate-400 font-medium">Ajustes críticos de segurança e criptografia BOOKI</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600"><Lock size={20} /></div>
              <div>
                <p className="text-sm font-black text-slate-800">Autenticação de Dois Fatores (2FA)</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Obrigatório para Master Admin</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-sm font-black text-slate-800">Monitoramento de Invasão</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Alertas em tempo real via IA</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Infraestrutura Cloud</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="flex items-center gap-4 p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all text-left group">
            <Database className="text-indigo-500 group-hover:scale-110 transition-transform" size={24} />
            <div>
              <p className="font-black text-sm text-slate-800">Backup do Banco</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Snapshots Diários</p>
            </div>
          </button>
          <button className="flex items-center gap-4 p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all text-left group">
            <Globe className="text-indigo-500 group-hover:scale-110 transition-transform" size={24} />
            <div>
              <p className="font-black text-sm text-slate-800">Regiões e CDN</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Latência Global</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
