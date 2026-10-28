/* Botão "Copiar prompt" do prompt mestre (arquivo próprio para a CSP não precisar liberar script inline). */
document.getElementById('copyPrompt').addEventListener('click', async function () {
  var btn = this, text = document.getElementById('promptText').innerText;
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copiado ✓'; }
  catch (e) {
    var r = document.createRange(); r.selectNodeContents(document.getElementById('promptText'));
    var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selecionado, use Ctrl+C';
  }
  setTimeout(function () { btn.textContent = 'Copiar prompt'; }, 2200);
});
