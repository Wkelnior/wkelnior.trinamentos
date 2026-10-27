/* Exemplos feitos com a skill: vídeo + prompt (.md) usado, com opção de personalizar o prompt.
   Para adicionar um exemplo, acrescente um item em EXEMPLOS:
   - video.youtubeId: ID do YouTube (tem prioridade) | video.mp4 + video.poster: arquivo local
   - md: caminho do prompt em Markdown
   - campos[].troca: textos do prompt original que serão trocados pelo que a pessoa digitar
     (tudo em MAIÚSCULAS no original vira MAIÚSCULAS na troca; "Xxxx" vira com inicial maiúscula) */
const EXEMPLOS = [
  {
    id: 'reel-comenta-mouse',
    titulo: 'Reel “Comenta MOUSE”',
    resumo: 'Reel de 53 s para o Instagram feito a partir de um sistema real: a interface vira cena 3D, os números animam e o CTA pede um comentário. Narração com clone autorizado da minha própria voz.',
    meta: ['Instagram Reels', '9:16 · 1080×1920', '53 s', 'Claude Opus 5.5', 'Voz clonada (ElevenLabs)'],
    video: { youtubeId: '', mp4: 'assets/video/reel-mouse-crm.mp4', poster: 'assets/video/reel-mouse-crm.jpg' },
    md: 'downloads/exemplos/reel-comenta-mouse.md',
    campos: [
      { id: 'produto', label: 'Nome do seu produto, app ou serviço', ph: 'Ex.: Agenda Fácil', troca: ['PrintControl 3D', 'PrintControl'] },
      { id: 'descricao', label: 'Em poucas palavras, o que ele é', ph: 'Ex.: app de agendamento para salões', troca: ['3D-printing'] },
      { id: 'url', label: 'Link do site ou app (opcional)', ph: 'https://seusite.com.br', troca: ['https://wkelnior.com/precificacao-impressao-3d/'], seVazio: '(no URL: use only the assets I attach)' },
      { id: 'perfil', label: 'Seu @ no Instagram', ph: '@suamarca', troca: ['@wkelnior.academy', '@WKELNIOR.ACADEMY'] },
      { id: 'marca', label: 'Nome da sua marca', ph: 'Ex.: Studio Ana', troca: ['WKELNIOR ACADEMY', 'WKELNIOR Academy', 'WKELNIOR'] },
      { id: 'palavra', label: 'Palavra que o público deve comentar', ph: 'Ex.: QUERO', troca: ['MOUSE', 'Mouse'] },
      { id: 'cores', label: 'Cores da sua marca (separe por vírgula)', ph: 'Ex.: preto, dourado, branco', lista: '- deep navy;\n- near black;\n- cyan;\n- electric blue;\n- white;\n- subtle metallic silver.' },
      { id: 'objetivo', label: 'Objetivo do vídeo', opcoes: ['Ensinar / mostrar o processo (igual ao original)', 'Vender o meu produto ou serviço', 'Gerar seguidores e engajamento'] },
      { id: 'voz', label: 'Narração', opcoes: ['Clone autorizado da minha própria voz (ElevenLabs)', 'Voz pronta de IA', 'Sem narração: só texto na tela e música'] }
    ]
  }
];

(function () {
  const root = document.getElementById('exemplosList');
  if (!root) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meu-produto';
  const cache = {};
  const loadMd = ex => (cache[ex.id] ??= fetch(ex.md).then(r => { if (!r.ok) throw 0; return r.text(); }));

  const videoHtml = ex => ex.video.youtubeId
    ? `<button class="ex-yt" type="button" data-yt="${esc(ex.video.youtubeId)}" aria-label="Assistir no YouTube">
         <img src="https://i.ytimg.com/vi/${esc(ex.video.youtubeId)}/maxresdefault.jpg" alt="" loading="lazy"><span class="ex-play">▶</span>
         <small>O vídeo carrega do YouTube ao clicar</small></button>`
    : `<video controls playsinline preload="none" poster="${esc(ex.video.poster || '')}"><source src="${esc(ex.video.mp4)}" type="video/mp4"></video>`;

  const campoHtml = (ex, c) => `<label class="ex-field${c.lista || c.opcoes ? ' wide' : ''}"><span>${esc(c.label)}</span>${
    c.opcoes ? `<select name="${c.id}">${c.opcoes.map((o, i) => `<option value="${i}">${esc(o)}</option>`).join('')}</select>`
             : `<input name="${c.id}" type="${c.id === 'url' ? 'url' : 'text'}" maxlength="160" placeholder="${esc(c.ph)}" autocomplete="off">`}</label>`;

  root.innerHTML = EXEMPLOS.map(ex => `
    <article class="ex-card" id="ex-${ex.id}">
      <div class="ex-media">${videoHtml(ex)}</div>
      <div class="ex-body">
        <span class="sk-chip">EXEMPLO REAL</span>
        <h3>${esc(ex.titulo)}</h3>
        <p>${esc(ex.resumo)}</p>
        <div class="sk-badges">${ex.meta.map(m => `<span>${esc(m)}</span>`).join('')}</div>

        <div class="ex-choice" role="tablist" aria-label="Como você quer o prompt">
          <button type="button" role="tab" class="on" aria-selected="true" data-mode="cru">Prompt original</button>
          <button type="button" role="tab" aria-selected="false" data-mode="config">Configurar para o meu produto</button>
        </div>

        <form class="ex-form" hidden>
          <p class="ex-hint">Preencha só o que quiser trocar. O que ficar vazio continua como no original.</p>
          <div class="ex-grid">${ex.campos.map(c => campoHtml(ex, c)).join('')}</div>
        </form>

        <div class="prompt-box">
          <header><span class="ex-fname">${esc(ex.md.split('/').pop())}</span>
            <span class="ex-acts"><button type="button" data-act="copy">Copiar</button><button type="button" data-act="dl">Baixar .md</button></span></header>
          <pre class="ex-pre">Carregando o prompt…</pre>
        </div>
        <div class="sk-note">Use junto com a skill Premium Motion Designer: anexe os dois arquivos no Claude Opus 5.5 e envie também o material real do seu produto (HTML, telas ou fotos).</div>
      </div>
    </article>`).join('');

  EXEMPLOS.forEach(ex => {
    const card = document.getElementById('ex-' + ex.id);
    const pre = card.querySelector('.ex-pre'), form = card.querySelector('.ex-form'), fname = card.querySelector('.ex-fname');
    let modo = 'cru', original = '', atual = '';

    const personalizar = () => {
      const v = Object.fromEntries(new FormData(form).entries());
      let md = original;
      const usados = [];
      ex.campos.forEach(c => {
        if (c.opcoes) return;
        const digitado = (v[c.id] || '').trim();
        // Campo sem resposta mas que não pode ficar com o dado do original quando o produto mudou (ex.: link).
        const val = digitado || (c.seVazio && (v.produto || '').trim() ? c.seVazio : '');
        if (!val) return;
        if (digitado) usados.push(`- ${c.label}: ${val}`);
        if (c.lista) {
          const itens = val.split(',').map(s => s.trim()).filter(Boolean);
          md = md.split(c.lista).join(itens.map((s, i) => `- ${s}${i === itens.length - 1 ? '.' : ';'}`).join('\n'));
          return;
        }
        c.troca.forEach(t => {
          const rep = /[A-Z]/.test(t) && t === t.toUpperCase() ? val.toUpperCase() : (c.id === 'palavra' && t === cap(t) ? cap(val) : val);
          // "(?<!@)": a marca não mexe no @ do perfil quando só um dos dois foi preenchido
          md = md.replace(new RegExp('(?<!@)' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), () => rep);
        });
      });
      const op = c => { const campo = ex.campos.find(x => x.id === c); return campo.opcoes[+v[c] || 0]; };
      const obj = +v.objetivo || 0, voz = +v.voz || 0;
      const regras = [];
      if (obj === 1) regras.push('The goal of THIS video is to SELL the product described above. Ignore every instruction that says not to sell it, rewrite scene 03 and the final CTA to present the offer, and keep it honest: no invented features, prices or results.');
      if (obj === 2) regras.push('The goal of THIS video is to grow followers and engagement. Keep the comment CTA as the main action and adapt the voiceover so it does not promise a product or a free skill unless I confirm that.');
      if (voz === 1) regras.push('Narration: use a ready-made AI voice in Brazilian Portuguese with the same tone described in section 9. Skip the voice-clone steps.');
      if (voz === 2) regras.push('No narration: drop the voiceover, turn the key lines of section 10 into on-screen text and let music + sound design carry the timing.');
      if (!usados.length && !regras.length) return original;
      const head = ['# CONFIGURAÇÃO DO MEU PROJETO', '', 'These settings take priority over anything below. Adapt every scene, text and the voiceover script to my product, keeping the same structure, pacing and quality bar.', '',
        ...usados, `- ${ex.campos.find(c => c.id === 'objetivo').label}: ${op('objetivo')}`, `- ${ex.campos.find(c => c.id === 'voz').label}: ${op('voz')}`,
        ...(regras.length ? ['', ...regras.map(r => '> ' + r)] : []), '', '---', '', ''].join('\n');
      return head + md;
    };

    const render = () => {
      atual = modo === 'config' ? personalizar() : original;
      pre.textContent = atual;
      const prod = (form.elements.produto && form.elements.produto.value.trim()) || '';
      fname.textContent = modo === 'config' && prod ? `prompt-${slug(prod)}.md` : ex.md.split('/').pop();
    };

    loadMd(ex).then(t => { original = t; render(); }).catch(() => { pre.textContent = 'Não foi possível carregar o prompt. Atualize a página.'; });

    card.querySelectorAll('.ex-choice button').forEach(b => b.addEventListener('click', () => {
      modo = b.dataset.mode;
      card.querySelectorAll('.ex-choice button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      form.hidden = modo !== 'config';
      if (modo === 'config') form.querySelector('input,select').focus();
      render();
    }));
    form.addEventListener('input', render);
    form.addEventListener('submit', e => e.preventDefault());

    card.querySelector('[data-act="copy"]').addEventListener('click', async function () {
      const btn = this;
      try { await navigator.clipboard.writeText(atual); btn.textContent = 'Copiado ✓'; }
      catch (_) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Use Ctrl+C'; }
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2200);
    });
    card.querySelector('[data-act="dl"]').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([atual], { type: 'text/markdown;charset=utf-8' }));
      a.download = fname.textContent; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      if (window.gtag) gtag('event', 'file_download', { file_name: a.download, link_text: modo });
    });

    const yt = card.querySelector('.ex-yt');
    if (yt) yt.addEventListener('click', () => {
      yt.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1&rel=0" title="${esc(ex.titulo)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
  });
})();
