
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  Menu, 
  X, 
  Package, 
  Building, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from './lib/supabase';
import DashboardView from './components/DashboardView';
import CompaniesView from './components/CompaniesView';
import PlansView from './components/PlansView';
import FinanceView from './components/FinanceView';
import SettingsView from './components/SettingsView';
import CompanyPortal from './components/CompanyPortal';
import PublicBookingView from './components/PublicBookingView';

const MASTER_ADMIN_ID = '3d577496-f12a-4cb8-abda-e2fc2ea24987';

/**
 * URL Oficial da Logomarca hospedada no Supabase Storage.
 */
const OFFICIAL_LOGO_URL = "https://rvocbjrzruiohrxuiqnq.supabase.co/storage/v1/object/public/logos/Booki%20LOGOMARCA%20-%20Copia.png";

/**
 * Logomarca BOOKI - Versão Oficial PNG
 */
export const BookiLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src={OFFICIAL_LOGO_URL} 
    alt="BOOKI Official Logo"
    className={`object-contain ${className}`}
    style={{ 
      maxWidth: size, 
      maxHeight: size,
      width: 'auto',
      height: 'auto',
      display: 'block'
    }}
    onError={(e) => {
      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x150?text=BOOKI";
    }}
  />
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [companySession, setCompanySession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Detecção de link público de agendamento
  const [publicCompanyId, setPublicCompanyId] = useState<string | null>(null);

  // Estado do Tema com persistência
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('booki_theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Debug: Log all renders
  console.log('=== APP RENDER ===');
  console.log('State:', { session, companySession, loading, publicCompanyId });
  console.log('=================');

  // Efeito para detectar companyId na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('companyId');
    if (cid) setPublicCompanyId(cid);
  }, []);

  // Efeito para aplicar o tema no HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('booki_theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    const savedCompany = localStorage.getItem('booki_company_session');
    if (savedCompany) {
      setCompanySession(JSON.parse(savedCompany));
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUserProfile(data);
    setLoading(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setCompanySession(null);
    localStorage.removeItem('booki_company_session');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const { data: authData, error: authErrorMsg } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (!authErrorMsg && authData.session?.user.id === MASTER_ADMIN_ID) {
        setSession(authData.session);
        setLoading(false);
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_email', cleanEmail)
        .eq('access_password', password)
        .maybeSingle();

      if (companyError) throw companyError;

      if (companyData) {
        if (companyData.status === 'INACTIVE') {
          setAuthError("Empresa Inativa.");
        } else {
          setCompanySession(companyData);
          localStorage.setItem('booki_company_session', JSON.stringify(companyData));
        }
      } else {
        setAuthError("Senha incorreta. Verifique suas credenciais.");
      }
    } catch (err: any) {
      setAuthError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (publicCompanyId) {
    return <PublicBookingView companyId={publicCompanyId} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (loading && !session && !companySession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (companySession) {
    return <CompanyPortal company={companySession} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (session && session.user.id === MASTER_ADMIN_ID) {
    const navItems = [
      { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
      { id: 'companies', label: 'Empresas SaaS', icon: <Building2 size={20} /> },
      { id: 'plans', label: 'Planos SaaS', icon: <Package size={20} /> },
      { id: 'finance', label: 'Financeiro', icon: <CreditCard size={20} /> },
      { id: 'settings', label: 'Ajustes', icon: <Settings size={20} /> },
    ];

    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors">
        <aside className={`fixed inset-y-0 left-0 z-[70] bg-indigo-600 text-white flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-72 shadow-2xl shadow-indigo-500/10`}>
          <div className="p-8 flex flex-col items-center border-b border-white/10">
            <div className="bg-white p-4 rounded-[1.5rem] shadow-2xl mb-4 hover:scale-105 transition-transform cursor-pointer flex items-center justify-center min-w-[120px] min-h-[60px]">
              <BookiLogo size={140} />
            </div>
            <span className="font-black text-[10px] tracking-[0.3em] uppercase text-indigo-100/60 mt-1">SaaS Core Manager</span>
          </div>
          <nav className="flex-1 px-4 mt-8 space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white text-indigo-600 shadow-xl font-black' : 'text-indigo-100 hover:bg-white/10 font-bold'}`}>
                {item.icon}
                <span className="text-sm uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-white/10 rounded-2xl transition-all font-bold text-sm">
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col lg:ml-72 min-h-screen">
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between sticky top-0 z-[60]">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-black text-black dark:text-white tracking-tighter uppercase">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-black dark:text-white leading-none">Master Admin</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Status: Online</p>
                </div>
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                  {userProfile?.full_name?.charAt(0) || 'M'}
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && <DashboardView theme={theme} />}
            {activeTab === 'companies' && <CompaniesView />}
            {activeTab === 'plans' && <PlansView />}
            {activeTab === 'finance' && <FinanceView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
        
        {isSidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] lg:hidden animate-in fade-in duration-300"></div>
        )}
      </div>
    );
  }

  if (session && session.user.id !== MASTER_ADMIN_ID) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-center">
        <Lock className="text-rose-600 mb-6" size={64} />
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter">Acesso Não Autorizado</h1>
        <p className="text-slate-500 mt-2">Esta conta não possui privilégios master.</p>
        <button onClick={handleLogout} className="mt-8 bg-black dark:bg-white dark:text-black text-white px-8 py-4 rounded-2xl font-black">Sair e Tentar Novamente</button>
      </div>
    );
  }

  if (!session && !companySession && !publicCompanyId && !loading) {
    // Login page - make sure it renders with visible styles
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans antialiased transition-colors" style={{ minHeight: '100vh', display: 'flex' }}>
        <div className="lg:flex-1 bg-indigo-600 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden" style={{ backgroundColor: '#4f46e5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div className="absolute top-0 right-0 p-8 md:p-12 z-50">
            <button 
              onClick={toggleTheme} 
              title="Alternar Tema"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-[1.5rem] backdrop-blur-md transition-all active:scale-90 border border-white/10"
            >
              {theme === 'light' ? <Moon size={24} className="animate-in fade-in zoom-in duration-300" /> : <Sun size={24} className="animate-in fade-in zoom-in duration-300" />}
            </button>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-8 inline-block animate-in zoom-in duration-700">
              <BookiLogo size={200} />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tighter mb-4 antialiased">Booki Agenda</h1>
            <p className="text-indigo-100 text-lg font-medium opacity-80 max-w-md mx-auto">
              A solução inteligente para gestão de agendamentos e serviços em tempo real.
            </p>
          </div>

          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="lg:flex-1 bg-white dark:bg-slate-900 p-10 flex flex-col justify-center animate-in slide-in-from-right duration-500 shadow-2xl transition-colors">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 antialiased">Seja bem-vindo!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base mb-12 antialiased">Identifique-se para acessar seu painel de gestão.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 font-bold transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="exemplo@booki.com.br"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 font-bold transition-all text-slate-900 dark:text-white placeholder:text-slate-400 pr-14 ${
                      authError 
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-50 dark:focus:ring-rose-900/20' 
                        : 'border-slate-100 dark:border-slate-700 focus:ring-indigo-50 dark:focus:ring-indigo-900/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {authError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <Lock size={14} /> {authError}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Acessar Plataforma <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              <ShieldCheck size={14} /> 
              <span>Criptografia BOOKI Unificada Ativa</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
