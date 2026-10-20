/**
 * WKELNIOR Academy — Lista de espera (Google Apps Script)
 *
 * Como publicar:
 * 1. Crie uma planilha no Google Sheets e copie o ID da URL (entre /d/ e /edit).
 * 2. Extensões > Apps Script, cole este arquivo e troque SHEET_ID abaixo.
 * 3. Implantar > Nova implantação > App da Web
 *      Executar como: Eu | Quem tem acesso: Qualquer pessoa
 * 4. Copie a URL /exec e cole em landing/assets/js/config.js (waitlistEndpoint).
 */
const SHEET_ID = 'COLE_O_ID_DA_PLANILHA_AQUI';
const ABA = 'Lista de espera';
const COLS = ['Data', 'Nome', 'E-mail', 'WhatsApp', 'Interesse', 'Origem', 'Campanha', 'Meio', 'Página'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return resp({ ok: false, error: 'email' });

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    if (sh.getLastRow() === 0) { sh.appendRow(COLS); sh.setFrozenRows(1); }

    // evita duplicados pelo e-mail
    const emails = sh.getLastRow() > 1 ? sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues().flat() : [];
    if (emails.indexOf(email) === -1) {
      sh.appendRow([
        new Date(), clean(d.nome), email, clean(d.whatsapp), clean(d.interesse),
        clean(d.origem), clean(d.utm_campaign), clean(d.utm_medium), clean(d.pagina)
      ]);
      confirmar(email, clean(d.nome));
    }
    return resp({ ok: true });
  } catch (err) {
    return resp({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function confirmar(email, nome) {
  MailApp.sendEmail({
    to: email,
    name: 'WKELNIOR Academy',
    subject: 'Você está na lista da WKELNIOR Academy 🚀',
    htmlBody: '<p>Olá, ' + esc(nome.split(' ')[0]) + '!</p>' +
      '<p>Seu cadastro na lista de espera foi confirmado. Assim que a primeira turma abrir, você será um dos primeiros a saber.</p>' +
      '<p>Até lá, bons projetos!<br><b>Wesley Kelnior</b></p>'
  });
}

// Remove fórmulas/HTML injetados nos campos (proteção contra CSV/formula injection).
function clean(v) {
  const s = String(v || '').trim().slice(0, 300);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function resp(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
