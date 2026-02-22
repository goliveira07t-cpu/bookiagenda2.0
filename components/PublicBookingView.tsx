
import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Calendar as CalendarIcon, 
  User, 
  Clock, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  MapPin, 
  Phone,
  UserCircle,
  Mail,
  Lock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  CalendarCheck,
  LayoutDashboard,
  History,
  UserCog,
  CalendarDays,
  CalendarX,
  Instagram,
  Facebook,
  Globe,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BookiLogo } from '../App';

interface PublicBookingViewProps {
  companyId?: string;
  slug?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'LOGGED_IN';

// Função auxiliar para garantir data local correta (YYYY-MM-DD)
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PublicBookingView: React.FC<PublicBookingViewProps> = ({ companyId, slug, theme, onToggleTheme }) => {
  const [company, setCompany] = useState<any>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [bookingsForDate, setBookingsForDate] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'booking' | 'my_bookings' | 'account'>('booking');
  const [clientBookings, setClientBookings] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(true);
  
  const [bookingForm, setBookingForm] = useState({ professional_id: '', service_id: '', start_time: '' });
  const timeSlots = ['09:00', '09:40', '10:20', '11:00', '11:40', '12:20', '13:00', '13:40', '14:20', '15:00', '15:40', '16:20', '17:00'];

  useEffect(() => {
    checkUser();
    fetchCompanyData();
  }, [companyId, slug]);

  useEffect(() => {
    if (user && company) {
      fetchBookingsForDate(selectedDate);
      fetchBlockedSlots(selectedDate);
    }
  }, [selectedDate, user, company]);

  useEffect(() => {
    if (user && activeTab === 'my_bookings') {
      fetchClientBookings();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHelpMessage(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Efeito para Realtime: Atualiza a tela assim que algo muda no banco
  useEffect(() => {
    if (!company) return;
    const channel = supabase
      .channel('public-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `company_id=eq.${company.id}` },
        () => {
          // Pequeno delay para garantir que o banco já processou a transação
          setTimeout(() => {
            fetchBookingsForDate(selectedDate);
            if (user && activeTab === 'my_bookings') fetchClientBookings();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company, selectedDate, user, activeTab]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      setAuthMode('LOGGED_IN');
    }
  };

  const fetchCompanyData = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      let query = supabase.from('companies').select('*');
      if (companyId) query = query.eq('id', companyId);
      else if (slug) query = query.eq('slug', slug);
      
      const { data: comp, error } = await query.maybeSingle();
      if (!comp || error) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setCompany(comp);
      const { data: profs } = await supabase.from('professionals').select('*').eq('company_id', comp.id);
      const { data: servs } = await supabase.from('services').select('*').eq('company_id', comp.id);
      setProfessionals(profs || []);
      setServices(servs || []);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsForDate = async (date: Date) => {
    const day = getLocalDateString(date); // Usa a função auxiliar para data local
    const { data } = await supabase
      .from('bookings')
      .select('start_time, professional_id')
      .eq('company_id', company.id)
      .neq('status', 'CANCELLED') // Ignora cancelados para liberar o horário
      .gte('start_time', `${day}T00:00:00`)
      .lte('start_time', `${day}T23:59:59`);
    if (data) setBookingsForDate(data);
  };

  const fetchBlockedSlots = async (date: Date) => {
    const day = getLocalDateString(date); // Usa a função auxiliar para data local
    const { data } = await supabase.from('blocked_slots').select('*').eq('company_id', company.id).eq('slot_date', day);
    if (data) setBlockedSlots(data);
  };

  const fetchClientBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, services(name, price, duration), professionals(name)')
        .eq('client_id', user.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      if (data) setClientBookings(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      const { error } = await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);
      if (error) throw error;
      alert('Agendamento cancelado com sucesso. A empresa foi notificada.');
      fetchClientBookings();
      fetchBookingsForDate(selectedDate);
    } catch (err: any) { alert(err.message); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'REGISTER') {
        const { error } = await supabase.auth.signUp({ 
          email: authForm.email, 
          password: authForm.password, 
          options: { 
            data: { 
              full_name: authForm.name, 
              phone: authForm.phone,
              role: 'CLIENT'
            } 
          } 
        });
        if (error) throw error;
        alert('Cadastro realizado! Faça login.');
        setAuthMode('LOGIN');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
        if (error) throw error;
        setUser(data.user);
        setAuthMode('LOGGED_IN');
      }
    } catch (err: any) { alert(err.message); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setAuthMode('LOGIN'); setActiveTab('booking'); };

  const handleCreateBooking = async () => {
    if (!bookingForm.service_id || !bookingForm.start_time) { alert('Selecione serviço e horário.'); return; }
    setSubmitting(true);
    
    // CORREÇÃO DE FUSO HORÁRIO:
    // Criamos um objeto Date a partir da data selecionada e definimos as horas/minutos locais
    const [h, m] = bookingForm.start_time.split(':').map(Number);
    const startD = new Date(selectedDate);
    startD.setHours(h, m, 0, 0);
    const startTimeIso = startD.toISOString(); // O toISOString() converterá corretamente para UTC

    const service = services.find(s => s.id === bookingForm.service_id);
    const duration = service ? Number(service.duration || 40) : 40;
    const endD = new Date(startD);
    endD.setMinutes(startD.getMinutes() + duration);
    const endTimeIso = endD.toISOString();

    try {
      const { error } = await supabase.from('bookings').insert([{
        company_id: company.id,
        client_id: user.id,
        client_name: user.user_metadata?.full_name || authForm.name || user.email || 'Cliente',
        client_phone: user.user_metadata?.phone || authForm.phone || '', 
        professional_id: bookingForm.professional_id || null,
        service_id: bookingForm.service_id,
        start_time: startTimeIso,
        end_time: endTimeIso,
        status: 'CONFIRMED'
      }]);
      if (error) throw error;
      fetchBookingsForDate(selectedDate);
      setBookingForm(prev => ({ ...prev, start_time: '' }));
      setShowSuccessModal(true);
    } catch (err: any) { alert(err.message); } finally { setSubmitting(false); }
  };

  const generateCalendarDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (notFound) return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center dark:bg-slate-950"><h1 className="text-4xl font-black mb-4 dark:text-white">Salão Não Encontrado</h1><p className="text-slate-500 mb-8">O link acessado é inválido ou a empresa não existe.</p><button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black">Voltar ao Início</button></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans transition-colors duration-500">
      
      {/* Floating Social Icons */}
      {(company?.whatsapp_url || company?.instagram_url) && (
        <div className="fixed bottom-24 md:bottom-8 right-6 z-[60] flex flex-col gap-3 animate-in slide-in-from-right duration-700 items-end">
           {company?.instagram_url && (
             <a 
               href={company.instagram_url} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="w-12 h-12 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
             >
               <Instagram size={24} />
             </a>
           )}
           {company?.whatsapp_url && (
             <div className="relative flex items-center">
               {showHelpMessage && (
                 <div className="absolute right-16 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap font-black text-[10px] uppercase tracking-wide animate-in fade-in slide-in-from-right-4 duration-700">
                   Precisa de ajuda?
                   <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-t border-r border-slate-100 dark:border-slate-700"></div>
                 </div>
               )}
               <a 
                 href={company.whatsapp_url} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-110 transition-transform active:scale-95 relative z-10"
               >
                 <MessageCircle size={28} />
               </a>
             </div>
           )}
        </div>
      )}
      
        {authMode !== 'LOGGED_IN' ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600 rounded-b-[4rem] z-0 shadow-2xl"></div>
            <div className="absolute top-10 right-10 z-10">
               <button onClick={onToggleTheme} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
            </div>

            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-200 dark:shadow-none -mt-20 border-4 border-white dark:border-slate-900">
                 <span className="text-3xl font-black">{company?.name?.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{company?.name}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Portal do Cliente</p>

              <h2 className="text-2xl font-black dark:text-white mb-8 self-start w-full">{authMode === 'REGISTER' ? 'Criar Conta' : 'Bem-vindo de volta!'}</h2>
              
              <form onSubmit={handleAuth} className="w-full space-y-4">
                {authMode === 'REGISTER' && (
                  <>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input required className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold dark:text-white outline-none transition-all" placeholder="Nome Completo" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input required className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold dark:text-white outline-none transition-all" placeholder="Seu WhatsApp" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                    </div>
                  </>
                )}
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="email" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold dark:text-white outline-none transition-all" placeholder="E-mail" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="password" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold dark:text-white outline-none transition-all" placeholder="Senha" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                </div>
                
                <button type="submit" disabled={authLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 mt-4">
                  {authLoading ? 'Processando...' : (authMode === 'REGISTER' ? 'Criar Conta' : 'Acessar')}
                </button>
                
                <div className="text-center pt-4">
                  <button type="button" onClick={() => setAuthMode(authMode === 'REGISTER' ? 'LOGIN' : 'REGISTER')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    {authMode === 'REGISTER' ? 'Já possui uma conta? Faça Login' : 'Não tem conta? Cadastre-se agora'}
                  </button>
                </div>
              </form>
            </div>
            <footer className="absolute bottom-6 w-full flex flex-col items-center gap-4 z-20">
               <div className="flex items-center gap-4">
                  {company?.whatsapp_url && (
                    <a href={company.whatsapp_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm"><MessageCircle size={20} /></a>
                  )}
                  {company?.instagram_url && (
                    <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-pink-600 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm"><Instagram size={20} /></a>
                  )}
                  {company?.facebook_url && (
                    <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm"><Facebook size={20} /></a>
                  )}
                  {company?.website_url && (
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm"><Globe size={20} /></a>
                  )}
               </div>
               <p className="opacity-30 font-black text-[10px] tracking-widest uppercase text-slate-500">Powered by BOOKI SaaS</p>
            </footer>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar / Mobile Nav */}
            <aside className="bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 md:w-72 flex-shrink-0 z-40 flex flex-col justify-between fixed md:sticky bottom-0 w-full md:h-screen order-2 md:order-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
               <div className="p-8 hidden md:flex flex-col items-center border-b border-slate-50 dark:border-slate-800">
                 <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">{company?.name?.charAt(0)}</div>
                 <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-center">{company?.name}</h2>
               </div>
               
               <nav className="flex md:flex-col justify-around md:justify-start p-2 md:p-6 gap-1 md:gap-2">
                 <button onClick={() => setActiveTab('booking')} className={`flex flex-col md:flex-row items-center md:gap-4 p-3 md:px-6 md:py-4 rounded-2xl transition-all ${activeTab === 'booking' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                   <CalendarDays size={24} />
                   <span className="text-[10px] md:text-sm font-black uppercase tracking-wide mt-1 md:mt-0">Agendar</span>
                 </button>
                 <button onClick={() => setActiveTab('my_bookings')} className={`flex flex-col md:flex-row items-center md:gap-4 p-3 md:px-6 md:py-4 rounded-2xl transition-all ${activeTab === 'my_bookings' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                   <History size={24} />
                   <span className="text-[10px] md:text-sm font-black uppercase tracking-wide mt-1 md:mt-0">Meus Agendamentos</span>
                 </button>
                 <button onClick={() => setActiveTab('account')} className={`flex flex-col md:flex-row items-center md:gap-4 p-3 md:px-6 md:py-4 rounded-2xl transition-all ${activeTab === 'account' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                   <UserCog size={24} />
                   <span className="text-[10px] md:text-sm font-black uppercase tracking-wide mt-1 md:mt-0">Minha Conta</span>
                 </button>
               </nav>

               <div className="p-6 hidden md:block border-t border-slate-50 dark:border-slate-800">
                 <div className="flex justify-center gap-3 mb-6">
                    {company?.whatsapp_url && (
                      <a href={company.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors"><MessageCircle size={18} /></a>
                    )}
                    {company?.instagram_url && (
                      <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
                    )}
                    {company?.facebook_url && (
                      <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook size={18} /></a>
                    )}
                    {company?.website_url && (
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors"><Globe size={18} /></a>
                    )}
                 </div>
                 <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-black uppercase text-xs transition-all">
                   <LogOut size={20} /> Sair
                 </button>
               </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 overflow-y-auto order-1 md:order-2">
              <header className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Olá, {user.user_metadata.full_name?.split(' ')[0] || 'Cliente'}!</h1>
                  <p className="text-slate-400 font-bold text-sm mt-1">Bem-vindo ao {company?.name}</p>
                </div>
                <button onClick={onToggleTheme} className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-500 shadow-sm">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
              </header>

              {activeTab === 'booking' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-black mb-6 dark:text-white uppercase flex items-center gap-3"><CalendarDays className="text-indigo-600"/> Selecione a Data</h3>
                    <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
                      {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="text-[10px] md:text-xs font-black text-slate-300 uppercase py-2">{d}</div>)}
                      {generateCalendarDays().map((day, i) => {
                        if (!day) return <div key={i}></div>;
                        const isSelected = day.toDateString() === selectedDate.toDateString();
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <button key={i} onClick={() => setSelectedDate(day)} className={`aspect-square flex flex-col items-center justify-center text-sm md:text-lg font-bold rounded-2xl transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-110' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isToday ? 'border-2 border-indigo-600 text-indigo-600' : ''}`}>
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none h-fit">
                    <h3 className="text-lg font-black mb-6 dark:text-white uppercase flex items-center gap-3"><Clock className="text-indigo-600"/> Horários</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profissional</label>
                        <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-bold text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" value={bookingForm.professional_id} onChange={e => setBookingForm({...bookingForm, professional_id: e.target.value})}>
                          <option value="">Qualquer disponível</option>
                          {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Serviço</label>
                        <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-bold text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" value={bookingForm.service_id} onChange={e => setBookingForm({...bookingForm, service_id: e.target.value})}>
                          <option value="">Selecione...</option>
                          {services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Disponibilidade</label>
                        <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                          {timeSlots.map(time => {
                            // Filtra agendamentos para este horário específico
                            const bookingsAtSlot = bookingsForDate.filter(b => {
                                const d = new Date(b.start_time);
                                const slotH = d.getHours().toString().padStart(2, '0');
                                const slotM = d.getMinutes().toString().padStart(2, '0');
                                return `${slotH}:${slotM}` === time;
                            });

                            let isSlotTaken = false;

                            if (bookingForm.professional_id) {
                                // Se um profissional específico foi selecionado, verifica apenas ele
                                isSlotTaken = bookingsAtSlot.some(b => b.professional_id === bookingForm.professional_id);
                            } else {
                                // Se "Qualquer" foi selecionado, só bloqueia se TODOS os profissionais estiverem ocupados
                                // (Assumindo que se o número de agendamentos for igual ao número de profissionais, está cheio)
                                if (professionals.length > 0) {
                                    isSlotTaken = bookingsAtSlot.length >= professionals.length;
                                }
                            }

                            const isBlocked = blockedSlots.find(s => s.slot_time === time);
                            const isSelected = bookingForm.start_time === time;
                            
                            if (isSlotTaken || isBlocked) return null;
                            
                            return <button key={time} onClick={() => setBookingForm({...bookingForm, start_time: time})} className={`py-3 rounded-xl border font-black text-xs transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}>{time}</button>;
                          })}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleCreateBooking} disabled={submitting || !bookingForm.start_time || !bookingForm.service_id} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase mt-8 transition-all shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? 'Reservando...' : 'Confirmar Agendamento'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'my_bookings' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                  <h2 className="text-2xl font-black dark:text-white mb-6 flex items-center gap-3"><History className="text-indigo-600"/> Histórico de Agendamentos</h2>
                  {clientBookings.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <CalendarX size={40} />
                      </div>
                      <p className="text-slate-500 font-bold text-lg">Você ainda não tem agendamentos.</p>
                      <button onClick={() => setActiveTab('booking')} className="mt-6 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">Fazer meu primeiro agendamento</button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {clientBookings.map(booking => {
                        // Proteção contra dados inválidos para evitar Crash
                        if (!booking || !booking.start_time) return null;

                        const date = new Date(booking.start_time);
                        // CORREÇÃO CRÍTICA: Impede crash se a data for inválida
                        if (isNaN(date.getTime())) return null;
                        
                        const isPast = date < new Date();

                        // Helper para extrair dados com segurança (Supabase pode retornar array ou objeto)
                        const getProp = (obj: any, field: string) => {
                           if (!obj) return null;
                           if (Array.isArray(obj)) return obj[0]?.[field];
                           return obj[field];
                        };

                        const serviceName = getProp(booking.services, 'name');
                        const servicePrice = getProp(booking.services, 'price');
                        const professionalName = getProp(booking.professionals, 'name');

                        return (
                          <div key={booking.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none ${isPast ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${isPast ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-900 dark:text-indigo-400'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">{date.toLocaleString('pt-BR', { month: 'short' }).replace('.','')}</span>
                                <span className="text-2xl font-black">{date.getDate()}</span>
                              </div>
                              <div>
                                <h4 className="font-black text-lg text-slate-900 dark:text-white">{serviceName || 'Serviço'}</h4>
                                <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400">
                                  <span className="flex items-center gap-1"><Clock size={14}/> {date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span className="flex items-center gap-1"><User size={14}/> {professionalName || 'Profissional'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                                {booking.status === 'CONFIRMED' ? 'Confirmado' : booking.status === 'CANCELLED' ? 'Cancelado' : booking.status}
                              </span>
                              <p className="font-black text-slate-900 dark:text-white">R$ {servicePrice}</p>
                              {!isPast && booking.status !== 'CANCELLED' && (
                                <button onClick={() => handleCancelBooking(booking.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'account' && (
                <div className="max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center">
                      <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-indigo-200 dark:shadow-none">
                        {user.user_metadata.full_name?.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.user_metadata.full_name}</h2>
                      <p className="text-slate-400 font-bold mb-8">{user.email}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                          <p className="font-bold text-slate-900 dark:text-white">{user.user_metadata.phone || 'Não informado'}</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membro Desde</p>
                          <p className="font-bold text-slate-900 dark:text-white">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      <button onClick={handleLogout} className="w-full mt-8 py-4 rounded-2xl border-2 border-rose-100 text-rose-500 font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">
                        Sair da Conta
                      </button>
                   </div>
                </div>
              )}
            </main>
            {showSuccessModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Agendado!</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Seu horário foi reservado com sucesso. Te esperamos lá!</p>
                      <button onClick={() => { setShowSuccessModal(false); setActiveTab('my_bookings'); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                          Ver Meus Agendamentos
                      </button>
                  </div>
              </div>
            )}
            </div>
        )}
    </div>
  );
};

export default PublicBookingView;
