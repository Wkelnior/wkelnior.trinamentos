(() => {
  const CFG = window.WK_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const brl = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');

  $('#year').textContent = new Date().getFullYear();

  /* ---- modo venda aberta: troca CTAs pelo checkout ---- */
  if (CFG.checkoutUrl) {
    $$('[data-cta]').forEach(a => { a.href = CFG.checkoutUrl; a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ---- scroll: progress, header, sticky cta ---- */
  const bar = $('#progress'), header = $('#header'), sticky = $('#stickyCta'), form = $('#lista');
  const onScroll = () => {
    const h = document.documentElement, y = h.scrollTop;
    bar.style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + '%';
    header.classList.toggle('scrolled', y > 30);
    const fr = form.getBoundingClientRect();
    sticky.classList.toggle('show', y > 700 && !(fr.top < innerHeight && fr.bottom > 0));
    journey();
  };

  /* ---- journey line ---- */
  const jr = $('#journey'), jf = $('#journeyFill');
  function journey() {
    if (!jr) return;
    const r = jr.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    jf.style.height = (p * 100) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- reveal + counters ---- */
  const countUp = el => {
    const to = +el.dataset.count, t0 = performance.now(), d = 1400;
    const f = t => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  let pending = $$('.reveal');
  const revealCheck = () => {
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top > innerHeight * .92) return true;
      el.classList.add('in');
      $$('[data-count]', el).forEach(countUp);
      return false;
    });
  };
  addEventListener('scroll', revealCheck, { passive: true }); addEventListener('resize', revealCheck);
  revealCheck(); setTimeout(revealCheck, 120); setTimeout(revealCheck, 600);

  /* ---- cards tilt + spotlight ---- */
  if (fine && !reduced) {
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
        c.style.transform = `perspective(800px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    });
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .25 - 2}px)`;
      });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* ---- hero: rede de partículas ---- */
  const cv = $('#net');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d'); let W, H, pts = [], mouse = { x: -999, y: -999 };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      const n = Math.min(90, Math.floor(innerWidth * innerHeight / 17000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35 * dpr, vy: (Math.random() - .5) * .35 * dpr }));
    };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', e => { const d = devicePixelRatio || 1; mouse.x = e.clientX * Math.min(d, 2); mouse.y = e.clientY * Math.min(d, 2); });
    const link = 150 * Math.min(devicePixelRatio || 1, 2);
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = 'rgba(80,210,255,.7)'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.3); ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
          if (d < link) { ctx.strokeStyle = `rgba(40,170,255,${(1 - d / link) * .28})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
        }
        const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
        if (dm < link * 1.3) { ctx.strokeStyle = `rgba(23,220,255,${(1 - dm / (link * 1.3)) * .5})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      requestAnimationFrame(frame);
    })();
  }

  /* ---- hero: demo "do prompt à primeira venda" ---- */
  (function buildDemo() {
    const term = $('#buildTerm'), app = $('#buildApp'), status = $('#buildStatus'), toast = $('#saleToast');
    if (!term) return;
    const k1 = $('#kpi1'), k2 = $('#kpi2');
    const lines = [
      ['p', '> Crie um sistema de gestão para impressão 3D com dashboard, estoque e vendas.'],
      ['dim', 'Analisando requisitos…'],
      ['ok', '✓ Estrutura de dados criada'],
      ['ok', '✓ Telas e componentes gerados'],
      ['ok', '✓ Login e permissões configurados'],
      ['ok', '✓ Publicado no ar'],
      ['p', '> Preparar proposta de venda…'],
      ['ok', '✓ Proposta enviada ao cliente']
    ];
    const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
    const money = (el, to) => { const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / 1600); el.textContent = brl(to * k); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
    let running = false;
    async function run() {
      if (running) return; running = true;
      for (;;) {
        term.innerHTML = ''; app.classList.remove('on'); toast.classList.remove('show'); k1.textContent = 'R$ 0'; k2.textContent = 'R$ 0';
        status.textContent = 'pensando…';
        for (let i = 0; i < lines.length; i++) {
          const [c, t] = lines[i]; const row = document.createElement('div'); row.className = c; term.appendChild(row);
          if (c === 'p' && !reduced) { for (const ch of t) { row.textContent += ch; await wait(16); } } else row.textContent = t;
          if (i === 1) status.textContent = 'construindo…';
          if (i === 4) { app.classList.add('on'); money(k1, 2858); money(k2, 1358); }
          await wait(c === 'p' ? 450 : 520);
        }
        status.textContent = 'no ar ✓';
        await wait(500); toast.classList.add('show');
        if (reduced) return;
        await wait(5200);
      }
    }
    setTimeout(run, 700);
  })();

  /* ---- vídeo ---- */
  (function video() {
    const shell = $('#videoShell'), btn = $('#playBtn'), soon = $('#videoSoon');
    if (!shell) return; // seção de vídeo desativada
    const v = CFG.video || {};
    if (v.youtubeId || v.mp4) soon.hidden = true;
    btn.addEventListener('click', () => {
      const frame = $('.video-frame', shell);
      if (v.youtubeId) {
        frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Apresentação WKELNIOR Academy"></iframe>`;
      } else if (v.mp4) {
        frame.innerHTML = `<video src="${v.mp4}" controls autoplay playsinline></video>`;
      } else {
        location.hash = '#lista';
      }
    });
  })();

  /* ---- simulador ---- */
  (function sim() {
    const r1 = $('#r1'), r2 = $('#r2'); if (!r1) return;
    const upd = () => {
      const a = +r1.value, b = +r2.value;
      [r1, r2].forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'));
      $('#o1').textContent = brl(a); $('#o2').textContent = b;
      $('#simMonth').textContent = brl(a * b); $('#simYear').textContent = brl(a * b * 12);
    };
    r1.addEventListener('input', upd); r2.addEventListener('input', upd); upd();
  })();

  /* ---- aula particular (WhatsApp) ---- */
  (function lesson() {
    const dlg = $('#lessonModal'), go = $('#lessonGo'); if (!dlg || !CFG.whatsapp) return;
    $('#lessonPhone').textContent = CFG.whatsappLabel || CFG.whatsapp;
    const link = () => {
      const nome = $('#lNome').value.trim(), tema = $('#lTema').value, per = $('#lPeriodo').value;
      let msg = 'Olá, Wesley! Vim pela landing da WKELNIOR Academy e quero agendar uma aula particular.';
      if (nome) msg += '\nNome: ' + nome;
      if (tema) msg += '\nQuero criar/aprender: ' + tema;
      if (per) msg += '\nMelhor período: ' + per;
      go.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg);
    };
    const open = () => { link(); dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); if (window.gtag) gtag('event', 'open_lesson_modal'); };
    const close = () => dlg.close ? dlg.close() : dlg.removeAttribute('open');
    $('#openLesson').addEventListener('click', open);
    $('#closeLesson').addEventListener('click', close);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    $$('input,select', dlg).forEach(el => { el.addEventListener('input', link); el.addEventListener('change', link); });
    go.addEventListener('click', () => { if (window.gtag) gtag('event', 'contact', { method: 'whatsapp_aula' }); if (window.fbq) fbq('track', 'Contact'); });
  })();

  /* ---- máscara de WhatsApp ---- */
  $('#whats').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    e.target.value = v;
  });

  /* ---- formulário da lista de espera ---- */
  const params = new URLSearchParams(location.search);
  const guessSource = () => {
    const ref = document.referrer || '';
    if (params.get('utm_source')) return params.get('utm_source');
    if (/instagram|l\.instagram/i.test(ref)) return 'instagram';
    if (/google/i.test(ref)) return 'google';
    return ref ? new URL(ref).hostname : 'direto';
  };
  const fm = $('#leadForm'), err = $('#formErr'), ok = $('#formOk'), btn = $('#submitBtn');
  const showErr = m => { err.textContent = m; err.hidden = false; };
  const confetti = () => {
    if (reduced) return;
    const cols = ['#17dcff', '#2d7bff', '#3fe092', '#f3c969', '#fff'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length];
      c.style.animationDuration = 2 + Math.random() * 2.2 + 's'; c.style.animationDelay = Math.random() * .6 + 's';
      c.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
      document.body.appendChild(c); setTimeout(() => c.remove(), 5000);
    }
  };
  fm.addEventListener('submit', async e => {
    e.preventDefault(); err.hidden = true;
    const f = Object.fromEntries(new FormData(fm).entries());
    $$('input', fm).forEach(i => i.classList.remove('bad'));
    if ((f.nome || '').trim().length < 2) { $('#nome').classList.add('bad'); return showErr('Informe seu nome.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((f.email || '').trim())) { $('#email').classList.add('bad'); return showErr('Informe um e-mail válido.'); }
    if (!$('#consent').checked) return showErr('Marque a caixa de consentimento para continuar.');
    if (f.website) return; // honeypot: bot
    const payload = {
      nome: f.nome.trim(), email: f.email.trim().toLowerCase(), whatsapp: f.whatsapp || '', interesse: f.interesse || '',
      origem: guessSource(), utm_medium: params.get('utm_medium') || '', utm_campaign: params.get('utm_campaign') || '',
      pagina: location.href.split('#')[0], data: new Date().toISOString()
    };
    btn.classList.add('loading'); btn.disabled = true;
    try {
      if (CFG.waitlistEndpoint) {
        await fetch(CFG.waitlistEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      } else {
        try { const q = JSON.parse(localStorage.getItem('wk_waitlist') || '[]'); q.push(payload); localStorage.setItem('wk_waitlist', JSON.stringify(q)); } catch (_) {}
        console.info('[WK] waitlistEndpoint vazio — cadastro salvo apenas localmente (modo teste).', payload);
      }
      ok.hidden = false; confetti();
      if (window.gtag) gtag('event', 'generate_lead', { method: payload.origem });
      if (window.fbq) fbq('track', 'Lead');
    } catch (_) {
      showErr('Não foi possível enviar agora. Tente novamente em instantes.');
    } finally { btn.classList.remove('loading'); btn.disabled = false; }
  });
})();
