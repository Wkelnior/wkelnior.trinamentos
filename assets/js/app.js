(() => {
  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];

  qsa('[data-login]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    qs('#loginModal')?.classList.add('open');
  }));
  qsa('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => qs('#loginModal')?.classList.remove('open')));
  qs('#loginModal')?.addEventListener('click', e => { if(e.target.id === 'loginModal') e.currentTarget.classList.remove('open'); });

  const send = qs('#sendCode');
  const otpStep = qs('#otpStep');
  if(send) send.addEventListener('click', () => {
    otpStep.hidden = false;
    send.textContent = 'Reenviar código';
    const first = otpStep.querySelector('input');
    setTimeout(() => first?.focus(), 120);
  });

  qsa('.otp input').forEach((el, i, all) => el.addEventListener('input', () => {
    el.value = el.value.replace(/\D/g,'').slice(0,1);
    if(el.value && all[i+1]) all[i+1].focus();
  }));

  qsa('[data-tab]').forEach(t => t.addEventListener('click', () => {
    qsa('[data-tab]').forEach(x => x.classList.remove('active'));
    qsa('[data-panel]').forEach(x => x.hidden = true);
    t.classList.add('active');
    const p = qs(`[data-panel="${t.dataset.tab}"]`);
    if(p) p.hidden = false;
  }));

  qsa('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
    const rail = qs(btn.dataset.scroll);
    rail?.scrollBy({left: 360, behavior:'smooth'});
  }));

  // visual countdown demo (not tied to a real purchase yet)
  qsa('[data-countdown]').forEach(el => {
    let seconds = 31482000;
    const render = () => {
      const d = Math.floor(seconds/86400), h = Math.floor((seconds%86400)/3600), m = Math.floor((seconds%3600)/60);
      el.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
      seconds--;
    };
    render(); setInterval(render,60000);
  });
})();

(() => {
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  // Student access countdown demo.
  qsa('[data-days-countdown]').forEach(el => {
    let end = Date.now() + 327 * 86400000 + 7 * 3600000;
    const render = () => {
      const ms = Math.max(0, end - Date.now());
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      el.textContent = h ? `${d} dias · ${h}h` : `${d} dias`;
    };
    render(); setInterval(render, 60000);
  });

  // Lesson tabs.
  qsa('[data-lesson-tab]').forEach(btn => btn.addEventListener('click', () => {
    qsa('[data-lesson-tab]').forEach(x => x.classList.remove('active'));
    qsa('[data-lesson-panel]').forEach(x => x.hidden = true);
    btn.classList.add('active');
    const panel = qs(`[data-lesson-panel="${btn.dataset.lessonTab}"]`);
    if(panel) panel.hidden = false;
  }));

  // Mark lesson as complete.
  qsa('[data-complete-lesson]').forEach(btn => btn.addEventListener('click', () => {
    const done = btn.dataset.done === '1';
    btn.dataset.done = done ? '0' : '1';
    btn.textContent = done ? '✓ Marcar como concluída' : '✓ Aula concluída';
    btn.classList.toggle('completed', !done);
  }));

  // Question type selector.
  let currentQuestionType = 'Dúvida';
  qsa('[data-question-type]').forEach(btn => btn.addEventListener('click', () => {
    qsa('[data-question-type]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    currentQuestionType = btn.dataset.questionType;
  }));

  // Publish a demo question into the feed.
  qs('#publishQuestion')?.addEventListener('click', () => {
    const field = qs('#questionText');
    const text = field?.value.trim();
    if(!text){ field?.focus(); return; }
    const feed = qs('#discussionFeed');
    const article = document.createElement('article');
    article.className = 'qa-card';
    article.dataset.status = 'open';
    article.innerHTML = `<div class="qa-head"><div class="avatar-fallback">EU</div><div><b>Você</b><small>agora · ${currentQuestionType}</small></div><span class="badge open-badge">Sem resposta</span></div><h3>${text.replace(/[<>]/g,'')}</h3><p>Sua publicação foi adicionada ao protótipo. No sistema real ela será salva no D1 e aparecerá na fila do administrador.</p><div class="qa-actions"><button>♡ 0</button><button>↩ Responder</button></div>`;
    feed?.prepend(article);
    field.value = '';
  });

  // Discussion filters.
  qsa('[data-discussion-filter]').forEach(btn => btn.addEventListener('click', () => {
    qsa('[data-discussion-filter]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.discussionFilter;
    qsa('.qa-card').forEach(card => {
      const status = card.dataset.status || '';
      card.hidden = filter !== 'all' && !status.includes(filter);
    });
  }));

  // Admin modal helpers.
  qsa('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => {
    qs(`#${btn.dataset.openModal}`)?.classList.add('open');
  }));
  qsa('.admin-modal [data-close-modal]').forEach(btn => btn.addEventListener('click', () => btn.closest('.admin-modal')?.classList.remove('open')));
  qsa('.admin-modal').forEach(modal => modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('open'); }));

  // Toggle visibility of module rows.
  qsa('[data-module-toggle]').forEach(btn => btn.addEventListener('click', () => {
    btn.classList.toggle('on');
    const row = btn.closest('tr');
    const pill = row?.querySelector('.status-pill');
    if(!pill) return;
    if(btn.classList.contains('on')){
      pill.textContent = 'Publicado'; pill.className = 'status-pill green';
    } else {
      pill.textContent = 'Oculto'; pill.className = 'status-pill gray';
    }
  }));

  // Release matrix cycles between released / blocked / scheduled.
  qsa('.release-pill').forEach(btn => btn.addEventListener('click', () => {
    if(btn.classList.contains('yes')){
      btn.className = 'release-pill no'; btn.textContent = '◉ Bloqueado';
    } else if(btn.classList.contains('no')){
      btn.className = 'release-pill scheduled'; btn.textContent = '◷ Programado';
    } else {
      btn.className = 'release-pill yes'; btn.textContent = '✓ Liberado';
    }
  }));

  // Create module simulation.
  qs('#createModule')?.addEventListener('click', () => {
    const name = qs('#newModuleName')?.value.trim() || 'Novo módulo';
    const lessons = qs('#newModuleLessons')?.value || '0';
    const release = qs('#newModuleRelease')?.value || 'Por turma';
    const tbody = qs('#moduleRows');
    if(!tbody) return;
    const idx = String(tbody.children.length + 1).padStart(2,'0');
    const tr = document.createElement('tr');
    tr.dataset.module = name;
    tr.innerHTML = `<td>${idx}</td><td><img src="assets/img/reference-dashboard.png" alt=""><b>${name.replace(/[<>]/g,'')}</b></td><td>${lessons} aulas</td><td><button class="switch on" data-module-toggle></button></td><td>${release}</td><td><span class="status-pill blue">Rascunho</span></td><td><button class="mini-action">✎</button><button class="mini-action">☷</button><button class="mini-action">◉</button></td>`;
    tbody.appendChild(tr);
    const sw = tr.querySelector('[data-module-toggle]');
    sw?.addEventListener('click', () => {
      sw.classList.toggle('on');
      const pill = tr.querySelector('.status-pill');
      if(sw.classList.contains('on')){ pill.textContent='Publicado'; pill.className='status-pill green'; }
      else { pill.textContent='Oculto'; pill.className='status-pill gray'; }
    });
    qs('#moduleModal')?.classList.remove('open');
    tr.scrollIntoView({behavior:'smooth',block:'center'});
  });

  // Create cohort simulation.
  qs('#createCohort')?.addEventListener('click', () => {
    const name = qs('#newCohortName')?.value.trim() || 'Nova turma';
    const desc = qs('#newCohortDesc')?.value.trim() || 'Grupo de alunos';
    const months = qs('#newCohortMonths')?.value || '12';
    const list = qs('#cohortCards');
    if(!list) return;
    const card = document.createElement('article');
    card.innerHTML = `<span class="cohort-symbol blue-symbol">◇</span><div class="cohort-main"><div><h3>${name.replace(/[<>]/g,'')}</h3><span class="status-pill blue">NOVA</span></div><p>${desc.replace(/[<>]/g,'')}</p><div class="cohort-stats"><b>0<small>alunos</small></b><b>0<small>módulos ativos</small></b><b>${months} meses<small>janela de acesso</small></b></div></div>`;
    list.appendChild(card);
    qs('#cohortModal')?.classList.remove('open');
    card.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();

// Sales landing FAQ interaction
(() => {
  document.querySelectorAll('.faq-item button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const list = item?.parentElement;
    if(!item) return;
    list?.querySelectorAll('.faq-item').forEach(x => { if(x !== item) x.classList.remove('open'); });
    item.classList.toggle('open');
  }));
})();
