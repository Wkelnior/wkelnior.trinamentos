/* Menu do celular: botão ☰ que abre os links do header em um painel com alvos grandes de toque. */
(function () {
  const header = document.querySelector('.header'), links = header && header.querySelector('.links'), actions = header && header.querySelector('.nav-actions');
  if (!links || !actions) return;

  links.id = links.id || 'menuLinks';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'menu-btn';
  btn.setAttribute('aria-label', 'Abrir menu'); btn.setAttribute('aria-controls', links.id); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<i aria-hidden="true"></i>';
  actions.appendChild(btn);

  // "Aula particular" some do header no celular; entra no fim do menu.
  const lesson = document.getElementById('openLesson');
  if (lesson) {
    const a = document.createElement('a');
    a.href = '#'; a.className = 'menu-lesson'; a.textContent = 'Agendar aula particular';
    a.addEventListener('click', e => { e.preventDefault(); close(); lesson.click(); });
    links.appendChild(a);
  }

  const set = open => {
    header.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  const close = () => set(false);

  btn.addEventListener('click', () => set(!header.classList.contains('menu-open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('menu-open')) { close(); btn.focus(); } });
  matchMedia('(min-width:1021px)').addEventListener('change', e => { if (e.matches) close(); });
})();
