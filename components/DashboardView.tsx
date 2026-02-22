
import React, { useState, useEffect } from 'react';
import { Building2, Users, CalendarCheck, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { getSystemInsights } from '../services/geminiService';

interface DashboardViewProps {
  theme?: 'light' | 'dark';
}

const DashboardView: React.FC<DashboardViewProps> = ({ theme }) => {
  const [stats, setStats] = useState({
    companies: 0,
    professionals: 0,
    bookings: 0,
    revenue: 0
  });
  const [aiInsights, setAiInsights] = useState('Analisando o ecossistema...');
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: companyCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PROFESSIONAL');
      const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });

      const newStats = {
        companies: companyCount || 0,
        professionals: profCount || 0,
        bookings: bookingCount || 0,
        revenue: (companyCount || 0) * 49.90
      };

      setStats(newStats);
      const insight = await getSystemInsights(newStats);
      // Correção: Garante que undefined não seja passado para o estado
      setAiInsights(insight || 'Insights indisponíveis no momento.');
      setTimeout(() => setIsChartReady(true), 100);
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300">
      <div className={`p-4 rounded-2xl ${color} w-fit mb-6`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-3xl font-black text-black dark:text-white mt-1 tracking-tighter">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Empresas SaaS" value={stats.companies} icon={Building2} color="bg-indigo-600" />
        <StatCard title="Profissionais" value={stats.professionals} icon={Users} color="bg-violet-600" />
        <StatCard title="Agendamentos" value={stats.bookings} icon={CalendarCheck} color="bg-purple-600" />
        <StatCard title="MRR Estimado" value={`R$ ${stats.revenue.toFixed(2)}`} icon={TrendingUp} color="bg-fuchsia-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 min-h-[450px] flex flex-col transition-colors">
           <h2 className="text-xl font-black text-black dark:text-white mb-8 tracking-tighter">Fluxo Global</h2>
           <div className="flex-1 w-full min-h-[300px] relative">
            {isChartReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart 
                  data={[
                    {name: 'Ago', v: 2400}, {name: 'Set', v: 3000}, {name: 'Out', v: 2800},
                    {name: 'Nov', v: 3900}, {name: 'Dez', v: 4800}, {name: 'Jan', v: stats.bookings || 5000}
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                      fontWeight: 900,
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }} 
                    cursor={{ stroke: '#6366F1', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#6366F1" fillOpacity={1} fill="url(#colorV)" strokeWidth={4} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[300px] bg-slate-50 dark:bg-slate-800 rounded-3xl animate-pulse flex items-center justify-center">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Preparando Gráfico...</p>
              </div>
            )}
           </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-800 dark:from-indigo-800 dark:to-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between shadow-2xl transition-colors">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <Sparkles size={16} />
                <h3 className="font-black text-[10px] uppercase tracking-widest">IA Insight Master</h3>
              </div>
              <p className="text-indigo-50 text-xl font-bold leading-tight italic">
                "{aiInsights}"
              </p>
           </div>
           
           <div className="bg-black/20 p-6 rounded-3xl backdrop-blur-md border border-white/10 relative z-10 mt-8">
              <p className="text-[10px] uppercase font-black text-indigo-200 tracking-[0.2em] mb-2">Recomendação</p>
              <p className="text-sm font-bold">Considere implementar uma campanha de upgrade para empresas com alta densidade de agendamentos.</p>
           </div>
           <Zap className="absolute -right-16 -bottom-16 opacity-10" size={300} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
