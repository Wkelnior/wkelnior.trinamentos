-- Tabela de leads da WKELNIOR Academy (Cloudflare D1: leads_wkelnior_academy)
-- Rode uma vez no console do D1 (aba "Console") ou com:
--   npx wrangler d1 execute leads_wkelnior_academy --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo          TEXT    NOT NULL,              -- 'lista_espera' | 'aula_particular'
  nome          TEXT,
  email         TEXT,                          -- obrigatório na lista de espera
  whatsapp      TEXT,
  interesse     TEXT,                          -- o que quer criar / tema da aula
  periodo       TEXT,                          -- melhor período (aula particular)
  origem        TEXT,                          -- instagram, google, utm_source...
  utm_medium    TEXT,
  utm_campaign  TEXT,
  pagina        TEXT,
  pais          TEXT,                          -- país detectado pela Cloudflare
  consentimento INTEGER NOT NULL DEFAULT 0,    -- 1 = aceitou receber novidades
  ip_hash       TEXT,                          -- hash do IP (antispam), nunca o IP puro
  status        TEXT    NOT NULL DEFAULT 'novo', -- novo | contatado | cliente | descartado
  envios        INTEGER NOT NULL DEFAULT 1,    -- quantas vezes a pessoa se cadastrou
  criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Um cadastro por e-mail em cada tipo (e-mails vazios não conflitam).
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_tipo_email ON leads (tipo, email);
CREATE INDEX IF NOT EXISTS idx_leads_criado ON leads (criado_em);
CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads (ip_hash, criado_em);
