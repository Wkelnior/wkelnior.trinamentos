/* Exemplos feitos com a skill: vídeo + prompt (.md) usado.
   Para adicionar um exemplo, acrescente um item em EXEMPLOS:
   - video.youtubeId: ID do YouTube (tem prioridade) | video.mp4 + video.poster: arquivo local
   - md: caminho do prompt em Markdown (revise antes: sem links internos, dados de clientes ou chaves) */
const EXEMPLOS = [
  {
    id: 'reel-comenta-mouse',
    titulo: 'Reel “Comenta MOUSE”',
    resumo: 'Reel de 53 s para o Instagram feito a partir de um sistema real: a interface vira cena 3D, os números animam e o CTA pede um comentário. Narração com clone autorizado da minha própria voz.',
    meta: ['Instagram Reels', '9:16 · 1080×1920', '53 s', 'Claude Opus 5.5', 'Voz clonada (ElevenLabs)'],
    video: { youtubeId: '', mp4: 'assets/video/reel-mouse-crm.mp4', poster: 'assets/video/reel-mouse-crm.jpg' },
    md: 'downloads/exemplos/reel-comenta-mouse.md'
  },
  {
    id: 'reel-comenta-skill',
    titulo: 'Reel “Comenta SKILL”',
    resumo: 'Demonstração ao vivo de direção criativa: o pedido genérico vira um celular 3D com KPIs saindo da tela, depois quadrado, círculo, pontas, energia e explosão, tudo sincronizado com a narração gravada.',
    meta: ['Instagram Reels', '9:16 · 60 fps', '61 s', 'Claude Opus 5.5', 'Narração original sincronizada'],
    video: { youtubeId: '', mp4: 'assets/video/reel-skill-motion.mp4', poster: 'assets/video/reel-skill-motion.jpg' },
    md: 'downloads/exemplos/reel-comenta-skill.md'
  }
];

(function () {
  const root = document.getElementById('exemplosList');
  if (!root) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const videoHtml = ex => ex.video.youtubeId
    ? `<button class="ex-yt" type="button" data-yt="${esc(ex.video.youtubeId)}" aria-label="Assistir no YouTube">
         <img src="https://i.ytimg.com/vi/${esc(ex.video.youtubeId)}/maxresdefault.jpg" alt="" loading="lazy"><span class="ex-play">▶</span>
         <small>O vídeo carrega do YouTube ao clicar</small></button>`
    : `<video controls playsinline preload="none" poster="${esc(ex.video.poster || '')}"><source src="${esc(ex.video.mp4)}" type="video/mp4"></video>`;

  root.innerHTML = EXEMPLOS.map(ex => `
    <article class="ex-card" id="ex-${ex.id}">
      <div class="ex-media">${videoHtml(ex)}</div>
      <div class="ex-body">
        <span class="sk-chip">EXEMPLO REAL</span>
        <h3>${esc(ex.titulo)}</h3>
        <p>${esc(ex.resumo)}</p>
        <div class="sk-badges">${ex.meta.map(m => `<span>${esc(m)}</span>`).join('')}</div>
        <div class="prompt-box">
          <header><span>${esc(ex.md.split('/').pop())}</span>
            <span class="ex-acts"><button type="button" data-act="copy">Copiar</button><a class="ex-dl" href="${esc(ex.md)}" download>Baixar .md</a></span></header>
          <pre class="ex-pre">Carregando o prompt…</pre>
        </div>
        <div class="sk-note">Use junto com a skill Premium Motion Designer: anexe os dois arquivos no Claude Opus 5.5, troque os dados pelos do seu produto e envie o material real (HTML, telas ou fotos).</div>
      </div>
    </article>`).join('');

  EXEMPLOS.forEach(ex => {
    const card = document.getElementById('ex-' + ex.id), pre = card.querySelector('.ex-pre');
    fetch(ex.md).then(r => { if (!r.ok) throw 0; return r.text(); })
      .then(t => { pre.textContent = t; })
      .catch(() => { pre.textContent = 'Não foi possível carregar o prompt. Atualize a página.'; });

    card.querySelector('[data-act="copy"]').addEventListener('click', async function () {
      const btn = this;
      try { await navigator.clipboard.writeText(pre.textContent); btn.textContent = 'Copiado ✓'; }
      catch (_) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Use Ctrl+C'; }
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2200);
    });

    const yt = card.querySelector('.ex-yt');
    if (yt) yt.addEventListener('click', () => {
      yt.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1&rel=0" title="${esc(ex.titulo)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
  });
})();
