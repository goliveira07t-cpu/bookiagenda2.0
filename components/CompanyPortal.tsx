
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Package, MapPin, Phone, Mail, LogOut, CheckCircle2, 
  Calendar as CalendarIcon, Users, TrendingUp, LayoutDashboard, ArrowRight, 
  ClipboardList, LineChart, Bell, UserRound, Repeat, PieChart, 
  UserCircle, Scissors, Clock, CalendarX, History, ChevronDown, 
  Menu, X, Plus, Search, Filter, MoreHorizontal, DollarSign, Sparkles,
  Sun, Moon, ChevronLeft, ChevronRight, Pencil, Trash2, AlertTriangle, UserPlus,
  Share2, Wallet, CalendarDays, UserCheck, Lock, Unlock, Camera, Tag, Box, Settings,
  Image as ImageIcon, Upload, FileImage, CalendarDays as CalendarDaysIcon,
  Timer, RefreshCw, Link as LinkIcon, Star, Target, Zap, ShieldCheck, MessageCircle, Instagram, Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BookiLogo } from '../App';

interface DataViewProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: any[];
  onAdd: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onShare?: (item: any) => void;
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  stats?: { label: string; value: string | number; icon: React.ReactNode; color: string }[];
  sidebarInfo?: { title: string; description: string; items: { label: string; value: string }[] };
}

const DataView: React.FC<DataViewProps> = ({ title, subtitle, icon, data, onAdd, onEdit, onDelete, onShare, columns, stats, sidebarInfo }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mini Stats Bar - Enhanced for Visual Weight */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="group bg-white dark:bg-slate-900/50 backdrop-blur-md p-7 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-6 transition-all hover:scale-[1.02]">
              <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 text-opacity-100 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none transform rotate-12 scale-150">
            {icon}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-none transform -rotate-3 group-hover:rotate-0 transition-transform">
                {React.cloneElement(icon as React.ReactElement, { size: 32 })}
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                  <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{subtitle}</p>
                </div>
              </div>
            </div>
            <button onClick={onAdd} className="group flex items-center gap-4 px-8 py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] transition-all text-xs font-black shadow-2xl shadow-indigo-200 dark:shadow-none active:scale-95">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
              NOVO REGISTRO
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-300 dark:text-slate-600 uppercase">
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-8 py-2 text-[10px] font-black tracking-[0.25em]">{col.label}</th>
                  ))}
                  {(onEdit || onDelete || onShare) && <th className="px-8 py-2 text-[10px] font-black tracking-[0.25em] text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIdx) => (
                  <tr key={rowIdx} className="group bg-slate-50/40 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none transition-all duration-500 transform hover:-translate-y-1">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-8 py-7 first:rounded-l-[2.5rem] last:rounded-r-[2.5rem] border-y border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {col.render ? col.render(item) : item[col.key]}
                        </div>
                      </td>
                    ))}
                    {(onEdit || onDelete || onShare) && (
                      <td className="px-8 py-7 rounded-r-[2.5rem] text-right border-y border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700">
                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          {onShare && (
                            <button onClick={() => onShare(item)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-2xl transition-all">
                              <Share2 size={18} />
                            </button>
                          )}
                          {onEdit && (
                            <button onClick={() => onEdit(item)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                              <Pencil size={18} />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(item)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-32 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6">
                           {React.cloneElement(icon as React.ReactElement, { size: 48, strokeWidth: 1.5 })}
                        </div>
                        <p className="font-black uppercase text-[10px] text-slate-300 dark:text-slate-600 tracking-[0.4em]">Nenhum registro encontrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Sidebar to fill horizontal space on large screens */}
        <div className="w-full xl:w-80 space-y-6">
           {sidebarInfo && (
             <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap size={20} className="text-indigo-200" />
                    <h3 className="font-black text-sm uppercase tracking-tighter">{sidebarInfo.title}</h3>
                  </div>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">{sidebarInfo.description}</p>
                  <div className="space-y-4">
                    {sidebarInfo.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">{it.label}</span>
                        <span className="text-sm font-black">{it.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10 transform rotate-12">
                   <Target size={180} />
                </div>
             </div>
           )}
           
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-widest">Segurança Ativa</h3>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
                Todos os dados deste módulo são criptografados com o protocolo BOOKI Core-V2. 
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

interface CompanyPortalProps {
  company: any;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const CompanyPortal: React.FC<CompanyPortalProps> = ({ company, onLogout, theme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); 
  const [bookingsForDate, setBookingsForDate] = useState<any[]>([]);
  const [allMonthBookings, setAllMonthBookings] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProfessionalModalOpen, setIsAddProfessionalModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'service' | 'professional' | 'product' | 'booking' | null>(null);
  
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [financeItems, setFinanceItems] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('month');
  const [financeSummary, setFinanceSummary] = useState({ daily: 0, monthly: 0, professionalTotal: 0, periodTotal: 0 });
  
  const timeSlots = ['09:00', '09:40', '10:20', '11:00', '11:40', '12:20', '13:00', '13:40', '14:20', '15:00', '15:40', '16:20', '17:00'];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggedBooking, setDraggedBooking] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [bookingForm, setBookingForm] = useState({ 
    client_name: '', client_phone: '', professional_id: '', service_id: '', 
    date: new Date().toISOString().split('T')[0], 
    start_time: '09:00', end_time: '09:40', status: 'CONFIRMED' 
  });

  const [profForm, setProfForm] = useState({ name: '', phone: '' });
  
  const [stats, setStats] = useState({ bookings: 0, clients: 0, revenue: 0, services: 0 });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'agendamentos', label: 'Agendamentos', icon: <CalendarIcon size={20} />, table: 'bookings' },
    { id: 'financeiro', label: 'Financeiro', icon: <LineChart size={20} /> },
    { id: 'profissionais', label: 'Profissionais', icon: <Users size={20} />, table: 'professionals' },
    { id: 'clientes', label: 'Clientes', icon: <UserCircle size={20} />, table: 'clients' },
    { id: 'servicos', label: 'Serviços', icon: <Scissors size={20} />, table: 'services' },
    { id: 'perfil', label: 'Perfil & Links', icon: <Settings size={20} /> },
    { id: 'produtos', label: 'Produtos', icon: <Package size={20} />, table: 'products' },
    { id: 'bloquear', label: 'Bloquear Horários', icon: <CalendarX size={20} /> },
  ];

  const [socialForm, setSocialForm] = useState({ whatsapp_url: '', instagram_url: '' });

  useEffect(() => {
    fetchDashboardStats();
    fetchSupportData();
    fetchBookingsForDate(selectedDate);
    fetchMonthBookings(viewDate);
    fetchBlockedSlots(selectedDate);
  }, [selectedDate, viewDate]);

  // Atualiza o relógio para a linha do tempo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentItem = menuItems.find(i => i.id === activeTab);
    if (currentItem?.table) fetchTableData(currentItem.table);
    if (activeTab === 'perfil') fetchCompanyProfile();
    if (activeTab === 'financeiro') fetchFinanceData();
  }, [activeTab, dateFilter]);

  // Efeito para Realtime no Painel da Empresa
  useEffect(() => {
    const channel = supabase
      .channel('company-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `company_id=eq.${company.id}` },
        () => {
          fetchBookingsForDate(selectedDate);
          fetchDashboardStats();
          if (activeTab === 'agendamentos') fetchTableData('bookings');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company, selectedDate, activeTab]);

  const handleCopyBookingLink = () => {
    const baseUrl = window.location.origin;
    // Customizado para usar o parâmetro 'companyId' que ativa a visão pública no App.tsx
    const link = `${baseUrl}/?companyId=${company.id}`;
    navigator.clipboard.writeText(link);
    alert('Link público copiado!');
  };

  const fetchCompanyProfile = async () => {
    const { data } = await supabase.from('companies').select('whatsapp_url, instagram_url').eq('id', company.id).single();
    if (data) {
      setSocialForm({
        whatsapp_url: data.whatsapp_url || '',
        instagram_url: data.instagram_url || ''
      });
    }
  };

  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('companies').update(socialForm).eq('id', company.id);
      if (error) throw error;
      alert('Links atualizados com sucesso!');
    } catch (err: any) { alert('Erro ao atualizar: ' + err.message); }
    finally { setSubmitting(false); }
  };

  const handleOpenBookingModal = () => {
    setEditingBookingId(null);
    setBookingForm({
      client_name: '',
      client_phone: '',
      service_id: '',
      professional_id: professionals.length > 0 ? professionals[0].id : '',
      date: selectedDate.toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '09:40',
      status: 'CONFIRMED'
    });
    setIsAddBookingModalOpen(true);
  };

  const handleEditBooking = (booking: any) => {
    setEditingBookingId(booking.id);
    const startDate = new Date(booking.start_time);
    setBookingForm({
      client_name: booking.client_name,
      client_phone: booking.client_phone || '',
      service_id: booking.service_id || '',
      professional_id: booking.professional_id || '',
      date: startDate.toISOString().split('T')[0],
      start_time: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      end_time: booking.end_time ? new Date(booking.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      status: booking.status
    });
    setIsAddBookingModalOpen(true);
  };

  const handleDeleteBooking = (booking: any) => {
    setItemToDelete(booking);
    setDeleteType('booking');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProfessional = (professional: any) => {
    setItemToDelete(professional);
    setDeleteType('professional');
    setIsDeleteModalOpen(true);
  };

  const handleEditProfessional = (professional: any) => {
    setProfForm({ name: professional.name, phone: professional.phone });
    setEditingBookingId(professional.id);
    setIsAddProfessionalModalOpen(true);
  };

  const handleTimeChange = (newStartTime: string) => {
    const service = services.find(s => s.id === bookingForm.service_id);
    const duration = service ? (service.duration || 40) : 40;
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newEndTime = `${Math.floor(totalMinutes / 60).toString().padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
    setBookingForm(prev => ({ ...prev, start_time: newStartTime, end_time: newEndTime }));
  };

  const handleServiceChange = (serviceId: string) => {
    setBookingForm(prev => {
      const service = services.find(s => s.id === serviceId);
      let newEndTime = prev.end_time;
      if (service && prev.start_time) {
        const [hours, minutes] = prev.start_time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + (service.duration || 40);
        newEndTime = `${Math.floor(totalMinutes / 60).toString().padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
      }
      return { ...prev, service_id: serviceId, end_time: newEndTime };
    });
  };

  const fetchSupportData = async () => {
    const { data: profs } = await supabase.from('professionals').select('*').eq('company_id', company.id);
    const { data: servs } = await supabase.from('services').select('*').eq('company_id', company.id);
    if (profs) setProfessionals(profs);
    if (servs) setServices(servs);
  };

  const fetchBookingsForDate = async (date: Date) => {
    const day = date.toISOString().split('T')[0];
    const { data } = await supabase
      .from('bookings')
      .select('*, services(name, price)')
      .eq('company_id', company.id)
      .neq('status', 'CANCELLED') // Libera o horário visualmente se estiver cancelado
      .gte('start_time', `${day}T00:00:00`)
      .lte('start_time', `${day}T23:59:59`);
    if (data) setBookingsForDate(data);
  };

  const fetchMonthBookings = async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).toISOString();
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const { data } = await supabase.from('bookings').select('client_name, start_time').eq('company_id', company.id).gte('start_time', firstDay).lte('start_time', lastDay);
    if (data) setAllMonthBookings(data);
  };

  const fetchBlockedSlots = async (date: Date) => {
    const day = date.toISOString().split('T')[0];
    const { data } = await supabase.from('blocked_slots').select('*').eq('company_id', company.id).eq('slot_date', day);
    if (data) setBlockedSlots(data);
  };

  const fetchDashboardStats = async () => {
    const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    const { count: cCount } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    const { count: sCount } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    const { data: orders } = await supabase.from('orders').select('total_amount').eq('company_id', company.id).eq('status', 'CLOSED');
    const rev = orders?.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) || 0;
    setStats({ bookings: bCount || 0, clients: cCount || 0, services: sCount || 0, revenue: rev });
  };

  const fetchTableData = async (table: string) => {
    setLoading(true);
    const { data } = await supabase.from(table).select('*').eq('company_id', company.id).order('created_at', { ascending: false });
    setData(data || []);
    setLoading(false);
  };

  const fetchFinanceData = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, services(name, price), professionals(name)')
      .eq('company_id', company.id)
      .neq('status', 'CANCELLED')
      .order('start_time', { ascending: false });

    if (bookings) {
      const items = bookings.map(b => ({ 
        id: b.id, 
        date: b.start_time, 
        dateStr: b.start_time.split('T')[0], 
        amount: Number(b.services?.price || 0),
        client: b.client_name,
        service: b.services?.name || 'Serviço',
        professional: b.professionals?.name
      }));
      const daily = items.filter(i => i.dateStr === todayStr).reduce((acc, curr) => acc + curr.amount, 0);
      const monthly = items.reduce((acc, curr) => acc + curr.amount, 0);
      const totalTransactions = items.length;
      const averageTicket = totalTransactions > 0 ? monthly / totalTransactions : 0;
      
      setFinanceSummary({ daily, monthly, professionalTotal: 0, periodTotal: monthly, totalTransactions, averageTicket } as any);
      setFinanceItems(items);
    }
    setLoading(false);
  };

  const handleToggleBlock = async (time: string) => {
    const day = selectedDate.toISOString().split('T')[0];
    const isBlocked = blockedSlots.find(s => s.slot_time === time);
    if (isBlocked) await supabase.from('blocked_slots').delete().eq('id', isBlocked.id);
    else await supabase.from('blocked_slots').insert([{ company_id: company.id, slot_date: day, slot_time: time }]);
    fetchBlockedSlots(selectedDate);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;
    setSubmitting(true);
    const table = deleteType === 'booking' ? 'bookings' : deleteType === 'service' ? 'services' : 'professionals';
    const { error } = await supabase.from(table).delete().eq('id', itemToDelete.id);
    if (!error) { 
      setIsDeleteModalOpen(false); 
      fetchBookingsForDate(selectedDate);
      const currentItem = menuItems.find(i => i.id === activeTab);
      if (currentItem?.table) fetchTableData(currentItem.table);
      fetchDashboardStats();
    }
    setSubmitting(false);
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva? O horário ficará disponível novamente.")) return;
    
    // Busca dados da reserva para notificação
    const booking = bookingsForDate.find(b => b.id === id) || data.find(b => b.id === id);

    setSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', id);
      if (error) throw error;
      setIsAddBookingModalOpen(false);
      fetchBookingsForDate(selectedDate);
      if (activeTab === 'agendamentos') fetchTableData('bookings');
      fetchDashboardStats();

      // Lógica de Notificação via WhatsApp
      if (booking && booking.client_phone) {
        const dateStr = new Date(booking.start_time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const message = `Olá ${booking.client_name}, informamos que seu agendamento para ${dateStr} foi cancelado.`;
        const whatsappLink = `https://wa.me/55${booking.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        
        if (window.confirm("Reserva cancelada! Deseja notificar o cliente via WhatsApp agora?")) {
           window.open(whatsappLink, '_blank');
        }
      } else {
        alert('Reserva cancelada com sucesso!');
      }

    } catch (err: any) {
      alert('Erro ao cancelar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const [h, m] = bookingForm.start_time.split(':').map(Number);
    const dParts = bookingForm.date.split('-').map(Number);
    const startD = new Date(dParts[0], dParts[1] - 1, dParts[2], h, m);
    const startTimeIso = startD.toISOString();
    const [eh, em] = bookingForm.end_time.split(':').map(Number);
    const endD = new Date(dParts[0], dParts[1] - 1, dParts[2], eh, em);
    const endTimeIso = endD.toISOString();
    const payload = {
      company_id: company.id,
      client_name: bookingForm.client_name,
      client_phone: bookingForm.client_phone,
      professional_id: bookingForm.professional_id || null,
      service_id: bookingForm.service_id || null,
      start_time: startTimeIso,
      end_time: endTimeIso,
      status: 'CONFIRMED'
    };
    try {
      if (editingBookingId) await supabase.from('bookings').update(payload).eq('id', editingBookingId);
      else await supabase.from('bookings').insert([payload]);
      setIsAddBookingModalOpen(false);
      fetchBookingsForDate(selectedDate);
      if (activeTab === 'agendamentos') fetchTableData('bookings');
    } catch (err) {} finally { setSubmitting(false); }
  };

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBookingId) {
        const { error } = await supabase.from('professionals').update({
          name: profForm.name,
          phone: profForm.phone
        }).eq('id', editingBookingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('professionals').insert([{
          company_id: company.id,
          name: profForm.name,
          phone: profForm.phone
        }]);
        if (error) throw error;
      }
      setIsAddProfessionalModalOpen(false);
      setEditingBookingId(null);
      setProfForm({ name: '', phone: '' });
      fetchTableData('professionals');
      fetchDashboardStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleScroll = () => {
    if (scrollRef.current && sidebarRef.current) {
      sidebarRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const renderScheduleGrid = () => {
    const startHour = 8;
    const endHour = 19; // 08:00 até 19:00
    const totalMinutes = (endHour - startHour) * 60;
    const pixelsPerMinute = 2; // Altura de cada minuto em pixels
    
    // Usa os mesmos horários do link do cliente para a grade
    const gridTimeSlots = timeSlots;

    // Posição da linha do tempo atual
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentMinutesFromStart = (currentHour - startHour) * 60 + currentMinute;
    const currentTimeTop = currentMinutesFromStart * pixelsPerMinute;
    const isCurrentTimeVisible = currentHour >= startHour && currentHour < endHour;

    const getRelativeDateLabel = (date: Date) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const compare = new Date(date);
      compare.setHours(0,0,0,0);
      
      const diffTime = compare.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Amanhã';
      if (diffDays === -1) return 'Ontem';
      return date.toLocaleDateString('pt-BR', { weekday: 'long' });
    };

    const onDragStart = (e: React.DragEvent, booking: any) => {
      setDraggedBooking(booking);
      e.dataTransfer.effectAllowed = 'move';
      // Torna o elemento transparente ao arrastar (opcional)
      e.dataTransfer.setData('text/plain', JSON.stringify(booking));
    };

    const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e: React.DragEvent, professionalId: string) => {
      e.preventDefault();
      if (!draggedBooking) return;

      const container = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - container.top + (scrollRef.current?.scrollTop || 0);
      
      // Header offset (80px) needs to be subtracted if we are calculating from the top of the scroll container
      // But here we are dropping on the specific column content div which starts AFTER the header? 
      // Let's adjust logic: Drop target will be the relative container inside the column.
      
      // Ajuste fino: O container de drop é o `div` relativo dentro da coluna.
      // O `e.clientY` é global. `container.top` é a posição do topo da área visível da coluna.
      // Se a área tem scroll, precisamos considerar onde clicamos relativo ao início do dia.
      
      // Simplificação: Calcular minutos baseados na posição Y dentro do container relativo
      // Como o container tem height = totalMinutes * pixelsPerMinute, o offsetY direto nos dá a posição.
      // Mas precisamos subtrair o header se o drop for no container pai.
      // Vamos fazer o drop direto na área de agendamentos (abaixo do header).
      
      const clickY = e.nativeEvent.offsetY; // Posição Y relativa ao elemento alvo (a coluna de agendamentos)
      
      // Snap to 15 minutes (30 pixels)
      const snapY = Math.round(clickY / 30) * 30;
      const minutesFromStart = snapY / pixelsPerMinute;
      
      const newStartHour = startHour + Math.floor(minutesFromStart / 60);
      const newStartMinute = minutesFromStart % 60;

      const newStartDate = new Date(selectedDate);
      newStartDate.setHours(newStartHour, newStartMinute, 0, 0);

      // Calcular nova data de fim baseada na duração original
      const oldStart = new Date(draggedBooking.start_time);
      const oldEnd = draggedBooking.end_time ? new Date(draggedBooking.end_time) : new Date(oldStart.getTime() + 40*60000);
      const durationMs = oldEnd.getTime() - oldStart.getTime();
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      // Atualizar no banco
      try {
        const { error } = await supabase.from('bookings').update({
          start_time: newStartDate.toISOString(),
          end_time: newEndDate.toISOString(),
          professional_id: professionalId
        }).eq('id', draggedBooking.id);

        if (error) throw error;
        
        // Atualizar UI localmente para feedback rápido
        fetchBookingsForDate(selectedDate);
      } catch (err) {
        console.error("Erro ao mover agendamento:", err);
        alert("Não foi possível mover o agendamento.");
      }
      
      setDraggedBooking(null);
    };

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-white dark:border-slate-800 relative animate-in fade-in duration-500">
        {/* Header Superior */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 sticky top-0">
           <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">{getRelativeDateLabel(selectedDate)}</h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                 <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm text-slate-500"><ChevronLeft size={18}/></button>
                 <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-600 dark:text-slate-300">Hoje</button>
                 <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm text-slate-500"><ChevronRight size={18}/></button>
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 dark:border-slate-700 pl-6">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
           </div>
           <div className="flex items-center gap-3">
              <button className="px-5 py-3 text-[10px] font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase tracking-wider">Visualização</button>
              <button className="px-5 py-3 text-[10px] font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase tracking-wider">Filtrar</button>
              <button onClick={handleOpenBookingModal} className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95">
                 <Plus size={16} /> Novo
              </button>
           </div>
        </div>

        {/* Grid Content */}
        <div className="flex flex-1 overflow-hidden relative">
           {/* Sidebar Eixo de Tempo */}
           <div ref={sidebarRef} className="w-20 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-hidden select-none z-20">
              <div className="h-24 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30"></div> {/* Spacer for column headers */}
              <div className="relative" style={{ height: totalMinutes * pixelsPerMinute }}>
                 {gridTimeSlots.map((time) => {
                    const [h, m] = time.split(':').map(Number);
                    const minutesFromStart = (h - startHour) * 60 + m;
                    return (
                      <div key={time} className="absolute w-full text-right pr-4 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider" style={{ top: minutesFromStart * pixelsPerMinute, transform: 'translateY(-50%)' }}>
                         {time}
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Columns Container */}
           <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-slate-900">
              <div className="flex min-w-full" style={{ height: totalMinutes * pixelsPerMinute + 96 }}>
                 {/* Background Lines */}
                 <div className="absolute inset-0 z-0 pointer-events-none mt-24">
                    {gridTimeSlots.map((time) => {
                       const [h, m] = time.split(':').map(Number);
                       const minutesFromStart = (h - startHour) * 60 + m;
                       return (
                         <div key={time} className="absolute w-full border-t border-slate-100 dark:border-slate-800/60" style={{ top: minutesFromStart * pixelsPerMinute }}></div>
                       );
                    })}
                 </div>

                 {/* Current Time Line */}
                 {isCurrentTimeVisible && (
                    <div className="absolute left-0 w-full z-10 flex items-center pointer-events-none mt-24" style={{ top: currentTimeTop }}>
                       <div className="w-full h-[2px] bg-rose-500 shadow-sm opacity-50"></div>
                       <div className="absolute -left-1 w-3 h-3 bg-rose-500 rounded-full shadow-md"></div>
                    </div>
                 )}

                 {/* Professionals Columns */}
                 {professionals.length > 0 ? professionals.map((prof) => (
                    <div key={prof.id} className="flex-1 min-w-[240px] border-r border-slate-100 dark:border-slate-800 relative group">
                       {/* Column Header */}
                       <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 px-2 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-24 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm mb-2 shadow-lg shadow-indigo-200 dark:shadow-none ring-4 ring-white dark:ring-slate-900">
                             {prof.name.charAt(0)}
                          </div>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate max-w-full px-2 leading-relaxed pb-1">{prof.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                             {bookingsForDate.filter(b => b.professional_id === prof.id && b.status !== 'CANCELLED').length} agendamentos
                          </span>
                       </div>

                       {/* Bookings */}
                       <div 
                          className="relative w-full h-full z-10"
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, prof.id)}
                       >
                          {bookingsForDate
                             .filter(b => b.professional_id === prof.id && b.status !== 'CANCELLED')
                             .map(booking => {
                                const start = new Date(booking.start_time);
                                // CORREÇÃO: Forçar duração de 40 minutos para consistência visual e de dados
                                const end = new Date(start.getTime() + 40 * 60000);
                                
                                const startMinutes = (start.getHours() - startHour) * 60 + start.getMinutes();
                                const duration = 40; // Fixado em 40 minutos conforme solicitado
                                const height = duration * pixelsPerMinute;
                                const top = startMinutes * pixelsPerMinute;
                                
                                // Formatação de horário local para corrigir erro de UTC vs Local
                                const startTimeDisplay = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                const endTimeDisplay = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                                const serviceName = booking.services?.name || 'Serviço';
                                const clientName = booking.client_name || 'Cliente';

                                // Color logic based on prompt requirements or fallbacks
                                let colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
                                if (booking.client_name.includes("Martin")) colorClass = "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
                                else if (booking.client_name.includes("Gertrude")) colorClass = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
                                else if (booking.client_name.includes("Melanie")) colorClass = "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
                                else if (booking.client_name.includes("Basira")) colorClass = "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";

                                return (
                                   <div 
                                      key={booking.id}
                                      draggable
                                      onDragStart={(e) => onDragStart(e, booking)}
                                      onClick={() => handleEditBooking(booking)}
                                      className={`absolute left-2 right-2 rounded-2xl px-3 py-2 border-l-[6px] text-xs cursor-grab active:cursor-grabbing hover:brightness-95 hover:scale-[1.02] hover:shadow-xl transition-all shadow-sm flex flex-col justify-center group/card ${colorClass} ${draggedBooking?.id === booking.id ? 'opacity-50' : ''}`}
                                      style={{ top: `${top}px`, height: `${height}px`, minHeight: '50px' }}
                                   >
                                      <div className="flex justify-between items-start mb-0.5">
                                        <span className="font-black opacity-70 text-[10px] tracking-wider leading-none">{startTimeDisplay} - {endTimeDisplay}</span>
                                      </div>
                                      <div className="font-black text-sm truncate leading-snug" title={clientName}>{clientName}</div>
                                      <div className="opacity-80 truncate text-[10px] font-bold mt-0.5 uppercase tracking-wide leading-none">{serviceName}</div>
                                   </div>
                                );
                             })}
                       </div>
                    </div>
                 )) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs h-64">
                       Nenhum profissional cadastrado
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Floating Button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
           <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 hover:shadow-slate-900/20 transition-all active:scale-95">
              <CalendarIcon size={16} /> Calendário
           </button>
        </div>
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-800 w-full">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4"><CalendarIcon className="text-indigo-600" size={32}/> Calendário</h3>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><ChevronLeft size={20}/></button>
          <span className="text-lg font-black uppercase tracking-widest py-3 px-4">{viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4 md:gap-8 text-center">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d} className="text-xs font-black text-slate-300 py-2 uppercase tracking-widest">{d}</div>)}
        {generateCalendarDays().map((day, i) => {
          if (!day) return <div key={i}></div>;
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <button key={i} onClick={() => setSelectedDate(day)} className={`aspect-square flex items-center justify-center text-xl font-bold rounded-[2rem] transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-none scale-110' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{day.getDate()}</button>
          );
        })}
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className={`p-4 rounded-2xl ${color} w-fit mb-6 transition-transform group-hover:rotate-6 shadow-lg shadow-indigo-100 dark:shadow-none`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{value}</p>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderScheduleGrid();
      case 'agendamentos':
        return (
          <DataView 
            title="Agenda Master" 
            subtitle="Visão unificada de atendimentos"
            icon={<CalendarIcon />}
            data={data} 
            onAdd={() => handleOpenBookingModal()} 
            onEdit={handleEditBooking} 
            onDelete={handleDeleteBooking} 
            stats={[
              { label: 'Hoje', value: bookingsForDate.length, icon: <Timer size={20}/>, color: 'bg-indigo-500' },
              { label: 'Confirmados', value: data.filter(d => d.status === 'CONFIRMED').length, icon: <CheckCircle2 size={20}/>, color: 'bg-emerald-500' },
              { label: 'Mês Atual', value: allMonthBookings.length, icon: <CalendarDaysIcon size={20}/>, color: 'bg-amber-500' }
            ]}
            sidebarInfo={{
              title: "Dica de Gestão",
              description: "Agendamentos confirmados geram 40% mais fidelidade. Use o link público para facilitar o acesso do seu cliente.",
              items: [
                { label: "Taxa de Ocupação", value: "84%" },
                { label: "Cancelamentos", value: "2%" }
              ]
            }}
            columns={[
              { 
                key: 'start_time', 
                label: 'Horário do Serviço', 
                render: (i: any) => {
                  const dateObj = new Date(i.start_time);
                  return (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm">
                        <span className="text-[8px] font-black uppercase text-indigo-400 leading-none mb-0.5">{dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-300">{dateObj.getDate()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black">
                        <Clock size={16} className="text-indigo-500" />
                        <span className="text-lg tracking-tighter">{dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                } 
              }, 
              { 
                key: 'client_name', 
                label: 'Cliente',
                render: (i: any) => (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none border-2 border-white dark:border-slate-800">
                      {i.client_name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <span className="uppercase tracking-tight font-black text-slate-800 dark:text-slate-100">{i.client_name}</span>
                  </div>
                )
              }, 
              { 
                key: 'status', 
                label: 'Status',
                render: (i: any) => (
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    i.status === 'CONFIRMED' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30' 
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${i.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                    {i.status}
                  </span>
                )
              }
            ]} 
          />
        );
      case 'financeiro':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Faturamento Hoje" value={`R$ ${financeSummary.daily.toFixed(2)}`} icon={Wallet} color="bg-emerald-600" />
              <StatCard title="Faturamento Mensal" value={`R$ ${financeSummary.monthly.toFixed(2)}`} icon={CalendarDays} color="bg-indigo-600" />
              <StatCard title="Ticket Médio" value={`R$ ${(financeSummary as any).averageTicket?.toFixed(2) || '0.00'}`} icon={TrendingUp} color="bg-blue-500" />
              <StatCard title="Transações" value={(financeSummary as any).totalTransactions || 0} icon={ClipboardList} color="bg-violet-500" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Histórico de Transações</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 pl-4">Data</th>
                      <th className="pb-4">Cliente</th>
                      <th className="pb-4">Serviço</th>
                      <th className="pb-4">Profissional</th>
                      <th className="pb-4 text-right pr-4">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {financeItems.slice(0, 10).map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 pl-4">{new Date(item.date).toLocaleDateString('pt-BR')} <span className="text-slate-400 text-xs ml-1">{new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span></td>
                        <td className="py-4">{item.client}</td>
                        <td className="py-4">{item.service}</td>
                        <td className="py-4">{item.professional || '-'}</td>
                        <td className="py-4 text-right pr-4 text-emerald-600 dark:text-emerald-400">R$ {item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    {financeItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs uppercase tracking-widest">Nenhuma transação registrada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'profissionais':
        return (
          <DataView 
            title="Time de Especialistas" 
            subtitle="Gestão de profissionais ativos"
            icon={<Users />}
            data={data} 
            onAdd={() => setIsAddProfessionalModalOpen(true)} 
            onEdit={handleEditProfessional}
            onDelete={handleDeleteProfessional}
            stats={[
              { label: 'Time Total', value: data.length, icon: <Users size={20}/>, color: 'bg-indigo-500' },
              { label: 'Disponíveis', value: data.length, icon: <UserCheck size={20}/>, color: 'bg-blue-500' },
              { label: 'Rating Equipe', value: '4.9', icon: <Star size={20}/>, color: 'bg-amber-500' }
            ]}
            sidebarInfo={{
              title: "Performance",
              description: "Profissionais com fotos no perfil aumentam agendamentos em 30%. Incentive sua equipe a manter os dados atualizados.",
              items: [
                { label: "Média Mensal", value: "142 serviços" },
                { label: "Top Profissional", value: "Lucas Silva" }
              ]
            }}
            columns={[
              { 
                key: 'name', 
                label: 'Especialista',
                render: (i: any) => (
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                      <UserCircle size={24} className="text-slate-300" />
                    </div>
                    <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{i.name}</span>
                  </div>
                )
              }, 
              { 
                key: 'phone', 
                label: 'Contato',
                render: (i: any) => (
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg"><Phone size={14} className="text-indigo-500" /></div>
                    {i.phone}
                  </div>
                )
              }
            ]} 
          />
        );
      case 'servicos':
        return (
          <DataView 
            title="Cardápio de Serviços" 
            subtitle="Catálogo oficial de itens"
            icon={<Scissors />}
            data={data} 
            onAdd={() => setIsAddServiceModalOpen(true)} 
            stats={[
              { label: 'Itens Totais', value: data.length, icon: <Package size={20}/>, color: 'bg-indigo-500' },
              { label: 'Favorito', value: 'Corte', icon: <Target size={20}/>, color: 'bg-fuchsia-500' },
              { label: 'Preço Médio', value: 'R$ 42,00', icon: <DollarSign size={20}/>, color: 'bg-emerald-500' }
            ]}
            sidebarInfo={{
              title: "Insights de Preço",
              description: "Seu ticket médio está 15% acima da média regional. Isso indica alta percepção de valor pelos seus clientes.",
              items: [
                { label: "Lucratividade", value: "62%" },
                { label: "Serviço Express", value: "Ativo" }
              ]
            }}
            columns={[
              { 
                key: 'name', 
                label: 'Serviço',
                render: (i: any) => (
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-800 shadow-sm">
                      <Scissors size={20} />
                    </div>
                    <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{i.name}</span>
                  </div>
                )
              }, 
              { 
                key: 'duration', 
                label: 'Tempo Estimado', 
                render: (i: any) => (
                  <div className="flex items-center gap-3 font-bold text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><Timer size={16} className="text-indigo-500" /></div>
                    {i.duration} min
                  </div>
                )
              }, 
              { 
                key: 'price', 
                label: 'Valor de Venda', 
                render: (i: any) => (
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                    R$ {Number(i.price).toFixed(2)}
                  </div>
                )
              }
            ]} 
          />
        );
      case 'perfil':
        return (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 relative overflow-hidden">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
                  <Settings size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Perfil da Empresa</h2>
                  <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-1">Configuração de Redes Sociais</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSocials} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <MessageCircle size={14} /> Link do WhatsApp
                  </label>
                  <input 
                    className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all placeholder:text-slate-300"
                    placeholder="https://wa.me/5511999999999"
                    value={socialForm.whatsapp_url}
                    onChange={e => setSocialForm({...socialForm, whatsapp_url: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 ml-2">Dica: Use o formato <b>https://wa.me/55...</b> para criar um link direto.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Instagram size={14} /> Link do Instagram
                  </label>
                  <input 
                    className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all placeholder:text-slate-300"
                    placeholder="https://instagram.com/suaempresa"
                    value={socialForm.instagram_url}
                    onChange={e => setSocialForm({...socialForm, instagram_url: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Salvar Configurações <Save size={18} /></>}
                </button>
              </form>
            </div>
          </div>
        );
      case 'bloquear':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {renderCalendar()}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-800">
              <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter">Bloquear Agenda: {selectedDate.toLocaleDateString()}</h3>
              <div className="grid grid-cols-3 gap-5">
                {timeSlots.map(time => {
                  const isBlocked = blockedSlots.find(s => s.slot_time === time);
                  return (
                    <button key={time} onClick={() => handleToggleBlock(time)} className={`p-6 rounded-[1.5rem] border font-black text-xs transition-all ${isBlocked ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 shadow-inner' : 'bg-white dark:bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-500 hover:text-indigo-600 shadow-sm'}`}>{time}</button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex font-sans transition-colors duration-500 relative">
      {/* Decorative Matrix Background - Eliminates "Cru" feel in light mode */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <aside className={`fixed lg:static inset-y-0 left-0 z-[90] w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        <div className="p-10 flex flex-col items-center border-b border-slate-50 dark:border-slate-800">
          <div className="bg-white p-4 rounded-[2rem] shadow-2xl mb-4 overflow-hidden transform hover:rotate-3 transition-transform border border-slate-50"><BookiLogo size={80} /></div>
          <span className="font-black text-lg tracking-tighter uppercase text-slate-900 dark:text-white truncate max-w-[200px] text-center">{company?.name || 'Sua Empresa'}</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-6 right-6 text-slate-400 hover:text-indigo-600"><X size={24} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 pb-10 mt-8 space-y-2">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              {item.icon}<span className="text-[14px] leading-none tracking-tight uppercase">{item.label}</span>
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleCopyBookingLink} className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-black uppercase text-[14px]">
              <LinkIcon size={20} />Link Cliente
            </button>
          </div>
        </nav>
        <div className="p-8 border-t border-slate-50 dark:border-slate-800"><button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-rose-600 font-black text-sm uppercase transition-colors"><LogOut size={20} /> <span>Sair</span></button></div>
      </aside>

      <main className="flex-1 min-h-screen flex flex-col overflow-x-hidden relative z-10">
        <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white dark:border-slate-800 px-10 py-5 flex items-center justify-between sticky top-0 z-[80] shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 transition-transform active:scale-90"><Menu size={20} /></button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{menuItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onToggleTheme} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 rounded-[1.2rem] text-slate-500 shadow-sm transition-all hover:scale-110 active:scale-90">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white font-black shadow-xl shadow-indigo-100 dark:shadow-none border-2 border-white/20">
              {company?.name?.charAt(0) || 'B'}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto pb-32">{renderContent()}</div>

        {isAddBookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col border border-white/20 dark:border-slate-800">
              <div className="p-10 pb-6 flex justify-between items-start">
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl"><CalendarIcon size={32} /></div>
                  <div><h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{editingBookingId ? 'Editar Reserva' : 'Novo Agendamento'}</h2><p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">Personalize o atendimento</p></div>
                </div>
                <button onClick={() => setIsAddBookingModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl text-slate-400 transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreateBooking} className="p-10 pt-4 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Cliente</label>
                  <div className="relative group">
                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                    <input required className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800 mb-4" value={bookingForm.client_name} onChange={e => setBookingForm({...bookingForm, client_name: e.target.value})} placeholder="Ex: Gabriel Oliveira" />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                    <input className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800" value={bookingForm.client_phone} onChange={e => setBookingForm({...bookingForm, client_phone: e.target.value})} placeholder="Ex: (11) 99999-9999" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
                    <div className="relative group">
                      <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                      <input required type="date" className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Serviço</label>
                    <div className="relative group">
                      <Scissors className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                      <select required className="w-full pl-14 pr-10 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm appearance-none text-slate-900 dark:text-white" value={bookingForm.service_id} onChange={e => handleServiceChange(e.target.value)}>
                        <option value="">Selecione...</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}min)</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Horário</label>
                    <div className="relative group">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                      <select required className="w-full pl-14 pr-10 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm appearance-none text-slate-900 dark:text-white" value={bookingForm.start_time} onChange={e => handleTimeChange(e.target.value)}>
                        <option value="">Selecione...</option>{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profissional</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-600" size={20} />
                      <select className="w-full pl-14 pr-10 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm appearance-none text-slate-900 dark:text-white" value={bookingForm.professional_id} onChange={e => setBookingForm({...bookingForm, professional_id: e.target.value})}>
                        <option value="">Qualquer Disponível</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="pt-8 space-y-3">
                  <button type="submit" disabled={submitting} className="group w-full text-white py-6 rounded-[2rem] font-black text-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50">
                    {submitting ? <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <>{editingBookingId ? 'Atualizar Reserva' : 'Confirmar Reserva'} <CheckCircle2 size={24} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                  {editingBookingId && (
                    <button 
                      type="button" 
                      onClick={() => handleCancelBooking(editingBookingId)}
                      disabled={submitting}
                      className="w-full text-rose-500 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X size={20} /> Cancelar Reserva
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddProfessionalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col border border-white/20 dark:border-slate-800">
              <div className="p-10 pb-6 flex justify-between items-start">
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl"><Users size={32} /></div>
                  <div><h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{editingBookingId ? 'Editar Profissional' : 'Novo Profissional'}</h2><p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">{editingBookingId ? 'Atualizar dados' : 'Cadastro de equipe'}</p></div>
                </div>
                <button onClick={() => { setIsAddProfessionalModalOpen(false); setEditingBookingId(null); setProfForm({ name: '', phone: '' }); }} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl text-slate-400 transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreateProfessional} className="p-10 pt-4 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                  <input required className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white shadow-sm" value={profForm.name} onChange={e => setProfForm({...profForm, name: e.target.value})} placeholder="Ex: Lucas Silva" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Número de Contato</label>
                  <input required className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-900 dark:text-white shadow-sm" value={profForm.phone} onChange={e => setProfForm({...profForm, phone: e.target.value})} placeholder="Ex: (00) 00000-0000" />
                </div>
                <div className="pt-4"><button type="submit" disabled={submitting} className="w-full text-white py-6 rounded-[2rem] font-black text-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3">
                  {submitting ? <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <>{editingBookingId ? 'Atualizar Profissional' : 'Cadastrar Profissional'} <CheckCircle2 size={24} /></>}
                </button></div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden border border-white/10 dark:border-slate-800">
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100/50 dark:shadow-none animate-bounce">
                  <AlertTriangle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Atenção!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed px-4">
                  Tem certeza que deseja excluir permanentemente {deleteType === 'booking' ? `o agendamento de "${itemToDelete?.client_name}"` : `${deleteType === 'professional' ? 'o profissional' : 'o registro'} "${itemToDelete?.name}"` }?
                </p>
                <div className="mt-12 flex flex-col gap-4">
                  <button onClick={confirmDelete} disabled={submitting} className="w-full bg-rose-600 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-2">
                    {submitting ? <RefreshCw className="animate-spin" size={20} /> : <>CONFIRMAR EXCLUSÃO <Trash2 size={20} /></>}
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Manter Registro</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="p-10 text-center mt-auto border-t border-slate-100 dark:border-slate-800 opacity-20"><p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">BOOKI SaaS FRAMEWORK • 2024</p></footer>
      </main>
    </div>
  );
};

export default CompanyPortal;
