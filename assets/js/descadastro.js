/* Página "Cancelar inscrição": envia o e-mail para /api/descadastro. */
(function () {
  const form = document.getElementById('unsubForm');
  if (!form) return;
  const email = document.getElementById('unsubEmail'), del = document.getElementById('unsubDel');
  const btn = document.getElementById('unsubBtn'), msg = document.getElementById('unsubMsg');
  const show = (text, ok) => { msg.textContent = text; msg.className = 'lg-msg ' + (ok ? 'ok' : 'err'); msg.hidden = false; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = email.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { email.focus(); return show('Informe um e-mail válido.', false); }
    const excluir = del.checked;
    btn.disabled = true;
    try {
      const res = await fetch('/api/descadastro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, excluir, website: form.elements.website.value })
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok || !r.ok) return show(r.erro || 'Não foi possível concluir agora. Tente de novo em instantes.', false);
      form.reset();
      show(excluir
        ? 'Pronto. Se este e-mail estiver na lista, ele não receberá mais mensagens e o pedido de exclusão foi registrado.'
        : 'Pronto. Se este e-mail estiver na lista, ele não receberá mais mensagens.', true);
    } catch (_) {
      show('Sem conexão no momento. Tente de novo ou responda SAIR no WhatsApp.', false);
    } finally { btn.disabled = false; }
  });
})();
