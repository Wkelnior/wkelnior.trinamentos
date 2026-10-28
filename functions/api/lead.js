/* POST /api/lead — grava leads da landing no Cloudflare D1 (binding "DB" → leads_wkelnior_academy). */

const TIPOS = ['lista_espera', 'aula_particular'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITE = { envios: 8, minutos: 10 }; // por IP
// Versão dos Termos de Uso / Política de Privacidade aceita no formulário. Troque quando os textos mudarem.
const TERMO_VERSAO = '2026-10-28';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

// Limpa texto: corta tamanho, remove controles e evita fórmula se o CSV for aberto no Excel/Sheets.
const txt = (v, max = 200) => {
  let s = String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s || null;
};

// Cria a tabela e os índices na primeira requisição (não precisa rodar schema.sql à mão).
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL, nome TEXT, email TEXT, whatsapp TEXT, interesse TEXT, periodo TEXT,
    origem TEXT, utm_medium TEXT, utm_campaign TEXT, pagina TEXT, pais TEXT,
    consentimento INTEGER NOT NULL DEFAULT 0, termo_versao TEXT, consentido_em TEXT, descadastrado_em TEXT, ip_hash TEXT,
    status TEXT NOT NULL DEFAULT 'novo', envios INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_tipo_email ON leads (tipo, email)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_criado ON leads (criado_em)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads (ip_hash, criado_em)`,
];
// Colunas adicionadas depois da primeira versão: entram em tabelas que já existiam.
const COLUNAS_NOVAS = ['termo_versao TEXT', 'consentido_em TEXT', 'descadastrado_em TEXT'];
let schemaPronto = null;
const garantirTabela = db => (schemaPronto ??= (async () => {
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  for (const col of COLUNAS_NOVAS) {
    try { await db.prepare(`ALTER TABLE leads ADD COLUMN ${col}`).run(); }
    catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; }
  }
})().catch(e => { schemaPronto = null; throw e; }));

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Envio vindo de navegador precisa ser do próprio site; Origin "null" ou malformado é recusado.
const origemOk = (origin, url) => {
  if (!origin) return true;
  try { return new URL(origin).host === new URL(url).host; } catch { return false; }
};

export async function onRequestPost(ctx) {
  try {
    return await gravar(ctx);
  } catch (e) {
    console.error('lead: falha ao gravar', e && e.message); // detalhe só no log, nunca na resposta
    return json({ ok: false, erro: 'Não foi possível enviar agora. Tente novamente em instantes.' }, 500);
  }
}

async function gravar({ request, env }) {
  if (!env.DB) return json({ ok: false, erro: 'Serviço indisponível.' }, 503);

  if (!origemOk(request.headers.get('Origin'), request.url)) return json({ ok: false, erro: 'Origem não permitida.' }, 403);

  const raw = await request.text();
  if (raw.length > 4000) return json({ ok: false, erro: 'Envio muito grande.' }, 413);
  let d;
  try { d = JSON.parse(raw); } catch { return json({ ok: false, erro: 'JSON inválido.' }, 400); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return json({ ok: false, erro: 'JSON inválido.' }, 400);

  if (d.website) return json({ ok: true }); // honeypot: finge sucesso para o bot

  const tipo = TIPOS.includes(d.tipo) ? d.tipo : 'lista_espera';
  const email = (txt(d.email, 160) || '').toLowerCase() || null;
  const nome = txt(d.nome, 120);

  if (tipo === 'lista_espera') {
    if (!nome || nome.length < 2) return json({ ok: false, erro: 'Informe seu nome.' }, 400);
    if (!email || !EMAIL.test(email)) return json({ ok: false, erro: 'Informe um e-mail válido.' }, 400);
    if (!d.consentimento) return json({ ok: false, erro: 'Consentimento obrigatório.' }, 400);
  } else if (email && !EMAIL.test(email)) {
    return json({ ok: false, erro: 'E-mail inválido.' }, 400);
  }

  await garantirTabela(env.DB);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = ip ? (await sha256(ip + '|' + (env.IP_SALT || 'wk-academy'))).slice(0, 32) : null;

  if (ipHash) {
    const r = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND atualizado_em > datetime('now', ?)`
    ).bind(ipHash, `-${LIMITE.minutos} minutes`).first();
    if (r && r.n >= LIMITE.envios) return json({ ok: false, erro: 'Muitos envios. Tente novamente em alguns minutos.' }, 429);
  }

  const whats = (String(d.whatsapp ?? '').replace(/\D/g, '').slice(0, 13)) || null;

  await env.DB.prepare(
    `INSERT INTO leads (tipo, nome, email, whatsapp, interesse, periodo, origem, utm_medium, utm_campaign, pagina, pais, consentimento, ip_hash, termo_versao, consentido_em)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, CASE WHEN ?12 = 1 THEN datetime('now') END)
     ON CONFLICT (tipo, email) DO UPDATE SET
       -- Quem só conhece o e-mail não pode sobrescrever os dados já gravados: só preenche o que estava vazio.
       nome = COALESCE(leads.nome, excluded.nome),
       whatsapp = COALESCE(leads.whatsapp, excluded.whatsapp),
       interesse = COALESCE(leads.interesse, excluded.interesse),
       periodo = COALESCE(leads.periodo, excluded.periodo),
       consentimento = MAX(leads.consentimento, excluded.consentimento),
       -- Novo aceite registra a versão e a data mais recentes; sem aceite, mantém o registro anterior.
       termo_versao = CASE WHEN excluded.consentimento = 1 THEN excluded.termo_versao ELSE leads.termo_versao END,
       consentido_em = CASE WHEN excluded.consentimento = 1 THEN excluded.consentido_em ELSE leads.consentido_em END,
       -- Quem tinha cancelado e se inscreve de novo, aceitando os termos, volta para a lista.
       status = CASE WHEN excluded.consentimento = 1 AND leads.status IN ('descadastrado', 'exclusao_solicitada') THEN 'novo' ELSE leads.status END,
       descadastrado_em = CASE WHEN excluded.consentimento = 1 THEN NULL ELSE leads.descadastrado_em END,
       ip_hash = excluded.ip_hash,
       envios = leads.envios + 1,
       atualizado_em = datetime('now')`
  ).bind(
    tipo, nome, email, whats,
    txt(d.interesse, 300), txt(d.periodo, 60),
    txt(d.origem, 80), txt(d.utm_medium, 80), txt(d.utm_campaign, 120),
    txt(d.pagina, 300), request.cf?.country || null,
    d.consentimento ? 1 : 0, ipHash, d.consentimento ? TERMO_VERSAO : null
  ).run();

  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, erro: 'Use POST.' }, 405);
