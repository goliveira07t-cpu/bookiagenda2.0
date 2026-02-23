-- lucros_por_profissional.sql
-- Consolidado: criação/CRUD de `services` + queries de agregação de receita por profissional
-- Instruções: copie a seção desejada, substitua os placeholders e execute em Supabase SQL Editor.

-- ==========================
-- 1) Tabela `services` (opcional)
-- ==========================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- ou use serial se preferir integer
  company_id uuid NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL DEFAULT 30, -- minutos
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);

-- ==========================
-- 2) Garantir colunas (se necessário)
-- ==========================
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration integer DEFAULT 30;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0.00;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- ==========================
-- 3) CRUD básico para `services`
-- ==========================
-- Inserir novo serviço (substitua :company_id)
INSERT INTO services (company_id, name, duration, price, created_at)
VALUES (:company_id, 'Corte', 30, 30.00, now());

-- Selecionar serviços de uma empresa
SELECT id, name, duration, price, created_at, updated_at
FROM services
WHERE company_id = :company_id
ORDER BY created_at DESC;

-- Atualizar um serviço (substitua :service_id)
UPDATE services
SET name = 'Corte Moderno', duration = 35, price = 35.00, updated_at = now()
WHERE id = :service_id;

-- Remover um serviço
DELETE FROM services WHERE id = :service_id;

-- ==========================
-- 4) Agregação: receita por profissional (genérico, entre datas)
-- Parâmetros: :company_id, :start (ISO), :end (ISO)
-- ==========================
SELECT
  p.id AS professional_id,
  p.name AS professional_name,
  SUM(s.price) AS total_revenue,
  COUNT(b.id) AS total_bookings
FROM bookings b
JOIN services s ON s.id = b.service_id
JOIN professionals p ON p.id = b.professional_id
WHERE b.company_id = :company_id
  AND b.status <> 'CANCELLED'
  AND b.start_time >= :start
  AND b.start_time <= :end
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- ==========================
-- 5) Agregação: receita mensal (forneça :start / :end para o mês desejado)
-- Exemplo: :start = '2026-02-01T00:00:00', :end = '2026-02-28T23:59:59'
-- ==========================
SELECT
  p.id,
  p.name,
  SUM(s.price) AS revenue_month
FROM bookings b
JOIN services s ON s.id = b.service_id
JOIN professionals p ON p.id = b.professional_id
WHERE b.company_id = :company_id
  AND b.status <> 'CANCELLED'
  AND b.start_time BETWEEN :start AND :end
GROUP BY p.id, p.name
ORDER BY revenue_month DESC;

-- ==========================
-- 6) Agregação: últimos 7 dias (usa now())
-- ==========================
SELECT
  p.id,
  p.name,
  SUM(s.price) AS revenue_7days
FROM bookings b
JOIN services s ON s.id = b.service_id
JOIN professionals p ON p.id = b.professional_id
WHERE b.company_id = :company_id
  AND b.status <> 'CANCELLED'
  AND b.start_time BETWEEN (now() - interval '7 days') AND now()
GROUP BY p.id, p.name
ORDER BY revenue_7days DESC;

-- ==========================
-- Observações / Filtros úteis
-- - Filtrar por conjunto de profissionais (UUIDs):
--     AND p.id = ANY(ARRAY['uuid1','uuid2']::uuid[])
-- - Se sua coluna `id` for integer, troque ::uuid[] para ::integer[] e use ids numéricos
-- - Substitua :company_id, :start e :end pelos valores reais antes de executar no SQL Editor
-- - Para evitar problemas com formatos, passe timestamps ISO: '2026-02-01T00:00:00Z'
-- - Execute cada bloco separadamente no Supabase SQL Editor (copiar → colar → substituir placeholders → Run)

