-- SQL para adicionar coluna logo_url na tabela companies
-- Execute isso no Supabase SQL Editor

ALTER TABLE companies ADD COLUMN logo_url TEXT DEFAULT NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN companies.logo_url IS 'URL pública da logomarca da empresa';

-- Se quiser adicionar um índice para melhor performance
CREATE INDEX idx_companies_logo_url ON companies(logo_url);
