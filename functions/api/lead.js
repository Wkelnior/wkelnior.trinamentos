/* POST /api/lead — grava leads da landing no Cloudflare D1 (binding "DB" → leads_wkelnior_academy). */

const TIPOS = ['lista_espera', 'aula_particular'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITE = { envios: 8, minutos: 10 }; // por IP

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

// Limpa texto: corta tamanho, remove controles e evita fórmula se o CSV for aberto no Excel/Sheets.
const txt = (v, max = 200) => {
  let s = String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s || null;
};

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, erro: 'D1 não configurado (binding DB).' }, 500);

  // Só aceita envios do próprio site.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, erro: 'Origem não permitida.' }, 403);

  const raw = await request.text();
  if (raw.length > 4000) return json({ ok: false, erro: 'Envio muito grande.' }, 413);
  let d;
  try { d = JSON.parse(raw); } catch { return json({ ok: false, erro: 'JSON inválido.' }, 400); }

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
    `INSERT INTO leads (tipo, nome, email, whatsapp, interesse, periodo, origem, utm_medium, utm_campaign, pagina, pais, consentimento, ip_hash)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
     ON CONFLICT (tipo, email) DO UPDATE SET
       nome = excluded.nome,
       whatsapp = COALESCE(excluded.whatsapp, leads.whatsapp),
       interesse = COALESCE(excluded.interesse, leads.interesse),
       periodo = COALESCE(excluded.periodo, leads.periodo),
       consentimento = MAX(leads.consentimento, excluded.consentimento),
       ip_hash = excluded.ip_hash,
       envios = leads.envios + 1,
       atualizado_em = datetime('now')`
  ).bind(
    tipo, nome, email, whats,
    txt(d.interesse, 300), txt(d.periodo, 60),
    txt(d.origem, 80), txt(d.utm_medium, 80), txt(d.utm_campaign, 120),
    txt(d.pagina, 300), request.cf?.country || null,
    d.consentimento ? 1 : 0, ipHash
  ).run();

  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, erro: 'Use POST.' }, 405);
