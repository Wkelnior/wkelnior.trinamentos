/* Hero da skill: toca o Reel em loop e move a timeline (cena, câmera, som) junto com o vídeo. */
(function () {
  const stage = document.getElementById('moStage');
  if (!stage) return;
  const video = stage.querySelector('video'), head = stage.querySelector('.mo-playhead'), tracks = stage.querySelector('.mo-tracks');
  const sceneEl = stage.querySelector('.mo-scene'), tc = stage.querySelector('.mo-tc');
  const DUR = 61.2;
  // Marcações do Reel "Comenta SKILL" (segundos), na ordem do prompt usado.
  const CENAS = [[0, 4.5, 'Dar vida'], [4.5, 14, 'Genérico'], [14, 31, 'Celular 3D + KPIs'], [31, 44.5, 'Forma → explosão'], [44.5, 50, 'Mensagem'], [50, 61.2, 'Skill + CTA']];
  const CAM = [2, 14.5, 20, 25, 29, 33, 41, 44, 51];
  const SOM = [4.5, 10, 14, 25, 31, 38, 44, 50, 55];
  const pct = s => (s / DUR * 100) + '%';
  const lane = n => stage.querySelector(`[data-lane="${n}"]`);

  lane('cena').innerHTML = CENAS.map(([a, b, t]) => `<span class="mo-clip" style="left:${pct(a)};width:calc(${pct(b - a)} - 2px)">${t}</span>`).join('');
  lane('cam').innerHTML = CAM.map(s => `<i class="mo-key" style="left:${pct(s)}"></i>`).join('');
  lane('som').innerHTML = SOM.map(s => `<i class="mo-hit" style="left:${pct(s)}"></i>`).join('');
  const clips = [...lane('cena').children];

  const fmt = s => '00:' + String(Math.floor(s)).padStart(2, '0');
  let atual = -1;
  const tick = () => {
    const t = video.currentTime || 0, lw = lane('cena');
    head.style.left = (lw.offsetLeft + lw.offsetWidth * Math.min(t / DUR, 1)) + 'px';
    tc.textContent = (t >= 60 ? '01:' + String(Math.floor(t - 60)).padStart(2, '0') : fmt(t)) + ' / 01:01';
    const i = CENAS.findIndex(([a, b]) => t >= a && t < b);
    if (i !== atual && i > -1) { atual = i; clips.forEach((c, k) => c.classList.toggle('on', k === i)); sceneEl.textContent = 'Cena · ' + CENAS[i][2]; }
    if (!video.paused) requestAnimationFrame(tick);
  };
  video.addEventListener('play', () => requestAnimationFrame(tick));
  video.addEventListener('seeked', tick);
  tick();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Só toca quando o hero está visível (economiza dados e bateria).
  const play = () => video.play().catch(() => {});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play() : video.pause())), { threshold: .25 }).observe(stage);
  } else play();
  setTimeout(() => { if (video.paused && stage.getBoundingClientRect().top < innerHeight) play(); }, 1200);
})();

/* Motion graphics do hero: entra quando aparece na tela e conta os números com easing. */
(function () {
  const stage = document.getElementById('moStage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n, el) => {
    const dec = +(el.dataset.dec || 0), v = dec ? (n / 1).toFixed(dec).replace('.', ',') : Math.round(n).toLocaleString('pt-BR');
    return (el.dataset.prefix || '') + v + (el.dataset.suffix || '');
  };
  const count = el => {
    const alvo = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(alvo * e, el);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const start = () => {
    if (stage.classList.contains('go')) return;
    stage.classList.add('go');
    stage.querySelectorAll('[data-count]').forEach((el, i) => reduce ? (el.textContent = fmt(+el.dataset.count, el)) : setTimeout(() => count(el), 500 + i * 350));
  };
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { start(); o.disconnect(); } }, { threshold: .2 }).observe(stage);
  else start();
  setTimeout(start, 1500); // garante a entrada mesmo se o observer não disparar
})();
