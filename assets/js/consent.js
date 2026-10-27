/*
 * Consentimento de cookies — LGPD / Guia Orientativo de Cookies da ANPD
 * - 1º nível: banner com "Aceitar todos", "Rejeitar não essenciais" (mesmo destaque) e "Personalizar"
 * - 2º nível: categorias com finalidade descrita, não essenciais DESLIGADOS por padrão
 * - Nada de análise/marketing é carregado antes do consentimento
 * - Revogação a qualquer momento: qualquer elemento [data-cookie-settings] ou o botão flutuante
 * - Registro do consentimento (versão + data) no navegador; validade de 12 meses
 */
(function () {
  var CFG = window.WK_CONFIG || {};
  var TRK = CFG.tracking || {};
  var KEY = 'wk_consent', VERSION = 1, MAX_AGE = 365 * 864e5;
  var LINKS = { privacy: 'politica-de-privacidade.html', cookies: 'politica-de-cookies.html' };
  var loaded = {};

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.v === VERSION && Date.now() - c.ts < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function write(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  /* ---------- carregamento condicionado ---------- */
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadAnalytics() {
    if (loaded.ga || !TRK.gaId) return; loaded.ga = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    gtag('js', new Date()); gtag('config', TRK.gaId, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(TRK.gaId));
  }
  function loadMarketing() {
    if (window.gtag) gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    if (loaded.fb || !TRK.metaPixelId) return; loaded.fb = true;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', TRK.metaPixelId); fbq('track', 'PageView');
  }
  function apply(c) {
    if (c.analytics) loadAnalytics();
    if (c.marketing) loadMarketing();
    document.dispatchEvent(new CustomEvent('wk:consent', { detail: c }));
  }
  function clearTrackingCookies() {
    var host = location.hostname, parts = host.split('.'), domains = ['', host];
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (raw) {
      var name = raw.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name)) return;
      domains.forEach(function (d) { document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : ''); });
    });
  }
  function save(analytics, marketing) {
    var prev = read();
    var c = { v: VERSION, ts: Date.now(), necessary: true, analytics: !!analytics, marketing: !!marketing };
    write(c); hideBanner(); closePrefs();
    var revoked = prev && ((prev.analytics && !c.analytics) || (prev.marketing && !c.marketing));
    if (revoked) { clearTrackingCookies(); location.reload(); return; }
    apply(c);
  }

  /* ---------- interface ---------- */
  var banner, overlay, lastFocus;
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function showBanner() {
    if (banner) return;
    banner = el(
      '<div class="ck-banner" role="region" aria-label="Aviso de cookies"><div class="ck-card">' +
      '<div><h2>Sua privacidade importa</h2><p>Usamos cookies necessários para o site funcionar. Com a sua permissão, também usamos cookies de estatística, para entender como o site é usado, e de marketing, para medir nossos anúncios. Você pode aceitar, rejeitar ou escolher por categoria e mudar de ideia quando quiser. Saiba mais na <a href="' + LINKS.cookies + '">Política de Cookies</a> e na <a href="' + LINKS.privacy + '">Política de Privacidade</a>.</p></div>' +
      '<div class="ck-actions"><button type="button" class="ck-btn solid" data-ck="reject">Rejeitar não essenciais</button><button type="button" class="ck-btn solid" data-ck="accept">Aceitar todos</button><button type="button" class="ck-btn link" data-ck="prefs">Personalizar</button></div>' +
      '</div></div>');
    document.body.appendChild(banner);
    banner.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-ck');
      if (a === 'accept') save(true, true); else if (a === 'reject') save(false, false); else if (a === 'prefs') openPrefs();
    });
  }
  function hideBanner() { if (banner) { banner.remove(); banner = null; } }

  function cat(id, title, text, fixed, on) {
    return '<div class="ck-cat"><div class="ck-cat-top"><b id="ck-l-' + id + '">' + title + '</b>' +
      (fixed ? '<span class="ck-fixed">SEMPRE ATIVOS</span>' :
        '<label class="ck-switch"><input type="checkbox" id="ck-' + id + '" aria-labelledby="ck-l-' + id + '"' + (on ? ' checked' : '') + '><span></span></label>') +
      '</div><p>' + text + '</p></div>';
  }
  function openPrefs() {
    var c = read() || {};
    lastFocus = document.activeElement;
    if (overlay) overlay.remove();
    overlay = el(
      '<div class="ck-overlay"><div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-title">' +
      '<header><h2 id="ck-title">Preferências de cookies</h2><p>Escolha quais categorias você autoriza. Os cookies não essenciais ficam desligados até você ativar. Detalhes de cada cookie na <a href="' + LINKS.cookies + '">Política de Cookies</a>.</p></header>' +
      '<div class="ck-cats">' +
      cat('nec', 'Necessários', 'Essenciais para o site funcionar e ficar seguro: guardar esta sua escolha, proteção contra ataques e o funcionamento de formulários. Não podem ser desligados.', true) +
      cat('analytics', 'Estatística', 'Nos ajudam a entender, de forma agregada, quantas pessoas visitam o site, de onde vêm e quais páginas usam, para melhorar o conteúdo. Ex.: Google Analytics.', false, c.analytics) +
      cat('marketing', 'Marketing', 'Permitem medir o resultado dos nossos anúncios e mostrar conteúdo mais relevante em outras plataformas. Ex.: Meta Pixel (Instagram/Facebook) e Google Ads.', false, c.marketing) +
      '</div><footer><button type="button" class="ck-btn" data-ck="reject">Rejeitar não essenciais</button><button type="button" class="ck-btn" data-ck="accept">Aceitar todos</button><button type="button" class="ck-btn solid" data-ck="save">Salvar minhas escolhas</button></footer>' +
      '</div></div>');
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { closePrefs(); return; }
      var a = e.target.getAttribute && e.target.getAttribute('data-ck');
      if (a === 'accept') save(true, true);
      else if (a === 'reject') save(false, false);
      else if (a === 'save') save(overlay.querySelector('#ck-analytics').checked, overlay.querySelector('#ck-marketing').checked);
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePrefs();
      if (e.key !== 'Tab') return;
      var f = overlay.querySelectorAll('a,button,input'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    overlay.querySelector('#ck-analytics').focus();
  }
  function closePrefs() {
    if (!overlay) return; overlay.remove(); overlay = null;
    if (!read()) showBanner();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); openPrefs(); }
    });
    if (!document.querySelector('[data-cookie-settings]')) {
      var fab = el('<button type="button" class="ck-fab" data-cookie-settings aria-label="Preferências de cookies" title="Preferências de cookies"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><path d="M8.5 8.5h.01M16 15.5h.01M12 12h.01M11 17h.01M7 14h.01"/></svg></button>');
      document.body.appendChild(fab);
    }
    var c = read();
    if (c) apply(c); else showBanner();
  }

  window.WKConsent = { open: openPrefs, get: read };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
