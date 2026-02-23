
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Target,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { supabase } from '../lib/supabase';

const FinanceView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [profits, setProfits] = useState<any[]>([]);
  const [profitLoading, setProfitLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0,10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [financeData, setFinanceData] = useState({
    totalMRR: 0,
    activeCompanies: 0,
    arpu: 0,
    planDistribution: [] as any[]
  });

  useEffect(() => {
    fetchFinanceStats();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await supabase.from('companies').select('id,name').eq('status','ACTIVE');
      setCompanies(data || []);
      if (data && data.length > 0) setSelectedCompany(data[0].id);
    } catch (err) {
      console.error('Erro ao carregar companies', err);
    }
  };

  useEffect(() => {
    if (selectedCompany) fetchProfessionals(selectedCompany);
  }, [selectedCompany]);

  const fetchProfessionals = async (companyId: string) => {
    try {
      const { data } = await supabase.from('professionals').select('id,name').eq('company_id', companyId);
      setProfessionals(data || []);
      setSelectedProfessionals([]);
    } catch (err) {
      console.error('Erro ao carregar professionals', err);
    }
  };

  const fetchProfits = async () => {
    if (!selectedCompany) return;
    setProfitLoading(true);
    try {
      // Busca bookings completados no período para a empresa
      const { data: bookings } = await supabase
        .from('bookings')
        .select('professional_id, services(price)')
        .eq('company_id', selectedCompany)
        .eq('status', 'COMPLETED')
        .gte('start_time', `${startDate}T00:00:00Z`)
        .lte('start_time', `${endDate}T23:59:59Z`);

      const byProf: Record<string, { name: string; total: number; count: number }> = {};
      // initialize selected professionals map
      const profMap: Record<string,string> = {};
      professionals.forEach(p => profMap[p.id] = p.name);

      (bookings || []).forEach((b: any) => {
        const pid = b.professional_id || 'unassigned';
        const price = b.services?.price || 0;
        if (selectedProfessionals.length > 0 && !selectedProfessionals.includes(pid)) return;
        if (!byProf[pid]) byProf[pid] = { name: profMap[pid] || 'Sem Profissional', total: 0, count: 0 };
        byProf[pid].total += price;
        byProf[pid].count += 1;
      });

      const result = Object.entries(byProf).map(([id, v]) => ({ id, name: v.name, total: v.total, count: v.count }));
      setProfits(result);
    } catch (err) {
      console.error('Erro ao calcular lucros', err);
    } finally {
      setProfitLoading(false);
    }
  };

  const fetchFinanceStats = async () => {
    setLoading(true);
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('plan, status')
        .eq('status', 'ACTIVE');

      const { data: plans } = await supabase
        .from('plans')
        .select('name, price');

      if (companies && plans) {
        // Correção: Tipagem explícita para o acumulador do reduce para evitar erro de indexação
        const planPriceMap: Record<string, number> = plans?.reduce((acc: Record<string, number>, p: any) => ({ ...acc, [p.name]: p.price }), {}) || {};
        
        let totalMRR = 0;
        const distributionMap: Record<string, { count: number; revenue: number }> = {};

        companies.forEach(company => {
          const planName = (company.plan || 'Não Definido') as string;
          const price = planPriceMap[planName] || 0;
          
          totalMRR += price;
          
          if (!distributionMap[planName]) {
            distributionMap[planName] = { count: 0, revenue: 0 };
          }
          distributionMap[planName].count += 1;
          distributionMap[planName].revenue += price;
        });

        const chartData = Object.entries(distributionMap).map(([name, data]) => ({
          name: name,
          value: data.revenue,
          count: data.count
        }));

        setFinanceData({
          totalMRR,
          activeCompanies: companies.length,
          arpu: companies.length > 0 ? totalMRR / companies.length : 0,
          planDistribution: chartData
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E'];

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      
      <div>
        <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight mt-2">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end">
        <button 
          onClick={fetchFinanceStats} 
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Faturamento Mensal (MRR)" 
          value={`R$ ${financeData.totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          subtitle="Receita recorrente global"
          icon={DollarSign}
          trend={12.4}
        />
        <MetricCard 
          title="Empresas Ativas" 
          value={financeData.activeCompanies} 
          subtitle="Assinaturas pagas agora"
          icon={Users}
          trend={8.1}
        />
        <MetricCard 
          title="ARPU (Ticket Médio)" 
          value={`R$ ${financeData.arpu.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          subtitle="Receita média por empresa"
          icon={Target}
          trend={2.3}
        />
      </div>

      {/* Inserir seção Lucros por Barbeiro aqui */}
      <div className="mt-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Lucros por Barbeiro</h2>
          <div className="flex items-center gap-3">
            <select value={selectedCompany || ''} onChange={e => setSelectedCompany(e.target.value)} className="px-3 py-2 rounded-2xl border bg-white dark:bg-slate-900">
              <option value="">Selecione uma empresa</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="px-3 py-2 rounded-2xl border bg-white dark:bg-slate-900" />
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="px-3 py-2 rounded-2xl border bg-white dark:bg-slate-900" />
            <button onClick={fetchProfits} className="px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black">Calcular</button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-black mb-2">Barbeiros (selecione para filtrar):</p>
          <div className="flex flex-wrap gap-2">
            {professionals.map(p => (
              <label key={p.id} className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-2xl border">
                <input type="checkbox" checked={selectedProfessionals.includes(p.id)} onChange={e => {
                  if (e.target.checked) setSelectedProfessionals(prev=>[...prev,p.id]); else setSelectedProfessionals(prev=>prev.filter(x=>x!==p.id));
                }} />
                <span className="text-sm font-bold">{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          {profitLoading ? (
            <div>Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profits.length === 0 ? (
                <div className="col-span-1 text-sm text-slate-400">Nenhum resultado. Escolha período/empresa e clique em Calcular.</div>
              ) : (
                profits.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-black">{p.name}</p>
                      <p className="text-xs text-slate-500">Atendimentos: {p.count}</p>
                    </div>
                    <div className="text-right mt-3">
                      <p className="text-indigo-600 font-black">R$ {p.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <PieIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Receita por Plano</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Distribuição percentual do MRR</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {loading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-50 dark:bg-slate-800 rounded-full"></div>
              </div>
            ) : financeData.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={financeData.planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {financeData.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                      fontWeight: 900,
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
                   <DollarSign size={32} />
                </div>
                <p className="text-slate-400 dark:text-slate-600 font-black text-xs uppercase tracking-widest">Sem dados financeiros</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 h-full transition-colors">
           <div className="flex items-center justify-between mb-10">
             <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Ranking de Assinaturas</h2>
             <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-full uppercase tracking-widest">Total: {financeData.activeCompanies} empresas</span>
           </div>

           <div className="space-y-4">
             {financeData.planDistribution.sort((a,b) => b.value - a.value).map((plan, index) => (
               <div key={index} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all group">
                 <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex flex-col items-center justify-center shadow-sm font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                     <p className="text-xs">{plan.count}</p>
                     <p className="text-[8px] uppercase tracking-tighter">Empresas</p>
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{plan.name}</p>
                     <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">SaaS Plan Tier</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">R$ {plan.value.toFixed(2)}</p>
                   <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Faturamento</p>
                 </div>
               </div>
             ))}
             
             {financeData.planDistribution.length === 0 && !loading && (
               <div className="py-20 text-center">
                 <p className="text-slate-300 dark:text-slate-700 font-black uppercase text-xs tracking-[0.2em]">Aguardando dados de cobrança...</p>
               </div>
             )}
           </div>

           <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl dark:shadow-none">
                 Relatórios Completos <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
