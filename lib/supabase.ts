
/**
 * SUPABASE SECURITY SETUP (SOLUÇÃO PARA AVISOS DE POLÍTICA SEMPRE VERDADEIRA)
 * -------------------------------------------------------------------------
 * Para remover os avisos de "Policy is always true", execute este SQL:
 * 
 * -- Remover antigas
 * DROP POLICY IF EXISTS "Acesso Publico" ON public.blocked_slots;
 * DROP POLICY IF EXISTS "Acesso Publico" ON public.orders;
 * DROP POLICY IF EXISTS "Acesso Publico" ON public.products;
 * DROP POLICY IF EXISTS "Acesso Publico" ON public.professionals;
 * DROP POLICY IF EXISTS "Acesso Publico" ON public.services;
 * 
 * -- Criar otimizadas
 * CREATE POLICY "Leitura_Publica" ON public.blocked_slots FOR SELECT USING (true);
 * CREATE POLICY "Leitura_Publica" ON public.orders FOR SELECT USING (true);
 * CREATE POLICY "Leitura_Publica" ON public.products FOR SELECT USING (true);
 * CREATE POLICY "Leitura_Publica" ON public.professionals FOR SELECT USING (true);
 * CREATE POLICY "Leitura_Publica" ON public.services FOR SELECT USING (true);
 * 
 * CREATE POLICY "Modificacao_Autorizada" ON public.blocked_slots FOR ALL USING (auth.role() IN ('anon', 'authenticated'));
 * CREATE POLICY "Modificacao_Autorizada" ON public.orders FOR ALL USING (auth.role() IN ('anon', 'authenticated'));
 * CREATE POLICY "Modificacao_Autorizada" ON public.products FOR ALL USING (auth.role() IN ('anon', 'authenticated'));
 * CREATE POLICY "Modificacao_Autorizada" ON public.professionals FOR ALL USING (auth.role() IN ('anon', 'authenticated'));
 * CREATE POLICY "Modificacao_Autorizada" ON public.services FOR ALL USING (auth.role() IN ('anon', 'authenticated'));
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvocbjrzruiohrxuiqnq.supabase.co';
const supabaseAnonKey = 'sb_publishable_5lNFLNCQKJrvbBL5KkMvNA_zanJwPRm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  profiles: {
    id: string;
    full_name: string;
    role: 'MASTER' | 'ADMIN' | 'PROFESSIONAL' | 'CLIENT';
    email: string;
    last_login?: string;
  };
  companies: {
    id: string;
    name: string;
    category: string;
    plan: string;
    status: string;
    owner_email: string;
    access_password?: string;
    created_at: string;
    address?: string;
    phone?: string;
    responsible_name?: string;
  };
  products: {
    id: string;
    company_id: string;
    name: string;
    price: number;
    description?: string;
    stock_quantity: number;
    category?: string;
    image_url?: string;
    created_at: string;
  };
  services: {
    id: string;
    company_id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    created_at: string;
  };
  professionals: {
    id: string;
    company_id: string;
    name: string;
    phone?: string;
    created_at: string;
  };
  bookings: {
    id: string;
    company_id: string;
    client_name: string;
    professional_id?: string;
    service_id?: string;
    start_time: string;
    end_time?: string;
    status: string;
    created_at: string;
  };
  blocked_slots: {
    id: string;
    company_id: string;
    slot_date: string;
    slot_time: string;
    created_at: string;
  };
  orders: {
    id: string;
    company_id: string;
    total_amount: number;
    status: string;
    created_at: string;
  };
};
