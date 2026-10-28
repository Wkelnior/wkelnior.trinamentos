/* POST /api/descadastro — tira um e-mail da lista de espera (revoga o consentimento, LGPD art. 8º §5º).
   Responde sempre "ok" para não revelar se o e-mail está cadastrado. Pedido de exclusão só é marcado:
   quem apaga o registro é o responsável, depois de confirmar que o pedido veio do dono do e-mail. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const origemOk = (origin, url) => {
  if (!origin) return true;
  try { return new URL(origin).host === new URL(url).host; } catch { return false; }
};

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ ok: false, erro: 'Serviço indisponível.' }, 503);
    if (!origemOk(request.headers.get('Origin'), request.url)) return json({ ok: false, erro: 'Origem não permitida.' }, 403);

    const raw = await request.text();
    if (raw.length > 1000) return json({ ok: false, erro: 'Envio muito grande.' }, 413);
    let d;
    try { d = JSON.parse(raw); } catch { return json({ ok: false, erro: 'JSON inválido.' }, 400); }
    if (!d || typeof d !== 'object' || Array.isArray(d)) return json({ ok: false, erro: 'JSON inválido.' }, 400);
    if (d.website) return json({ ok: true }); // honeypot

    const email = String(d.email ?? '').trim().toLowerCase().slice(0, 160);
    if (!EMAIL.test(email)) return json({ ok: false, erro: 'Informe um e-mail válido.' }, 400);
    const excluir = d.excluir === true;

    try {
      // Garante a coluna em tabelas criadas antes desta versão (sem ela o pedido seria perdido).
      try { await env.DB.prepare(`ALTER TABLE leads ADD COLUMN descadastrado_em TEXT`).run(); }
      catch (e) { if (!/duplicate column|no such table/i.test(String(e && e.message))) throw e; }
      await env.DB.prepare(
        `UPDATE leads SET consentimento = 0,
           status = CASE WHEN ?2 = 1 THEN 'exclusao_solicitada' ELSE 'descadastrado' END,
           descadastrado_em = datetime('now'), atualizado_em = datetime('now')
         WHERE tipo = 'lista_espera' AND email = ?1`
      ).bind(email, excluir ? 1 : 0).run();
    } catch (e) {
      // Tabela ainda não existe (nenhum cadastro feito): não há o que descadastrar.
      if (!/no such table/i.test(String(e && e.message))) throw e;
    }
    return json({ ok: true });
  } catch (e) {
    console.error('descadastro: falha', e && e.message);
    return json({ ok: false, erro: 'Não foi possível concluir agora. Tente novamente ou fale com a gente pelo WhatsApp.' }, 500);
  }
}

export const onRequest = () => json({ ok: false, erro: 'Use POST.' }, 405);
