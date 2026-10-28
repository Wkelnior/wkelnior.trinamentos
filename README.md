# WKELNIOR Academy — Landing Page

Landing page de conversão (lista de espera) da WKELNIOR Academy. HTML/CSS/JS puros, sem build.

## Rodar local
```
npx serve .
```

## Configuração (`assets/js/config.js`)
- `waitlistEndpoint` — `"/api/lead"` grava os leads no Cloudflare D1 (veja abaixo). Também aceita a URL de um Web App do Apps Script (`apps-script/Waitlist.gs`).
- `video` — `youtubeId` ou `mp4` do vídeo de apresentação.
- `checkoutUrl` — quando a venda abrir (Asaas), todos os CTAs passam a apontar para o checkout.

## Leads no Cloudflare D1
`functions/api/lead.js` (Pages Function) recebe a lista de espera e os pedidos de aula particular e grava na tabela `leads` do banco `leads_wkelnior_academy`.
1. A tabela é criada sozinha no primeiro cadastro (`schema.sql` fica só como referência).
2. No projeto do Pages → Settings → Bindings → Add → D1 database: nome da variável `DB`, banco `leads_wkelnior_academy` (Production e Preview).
3. Opcional: variável secreta `IP_SALT` com um texto aleatório (usada no hash do IP).
4. Faça um novo deploy para o binding valer.

Consultas úteis no Console do D1:
```sql
SELECT * FROM leads ORDER BY criado_em DESC LIMIT 50;
SELECT tipo, origem, COUNT(*) FROM leads GROUP BY tipo, origem;
UPDATE leads SET status = 'contatado' WHERE id = 1;
```

## Deploy
Cloudflare Pages apontando para a raiz desta branch (sem comando de build). A pasta `functions/` é publicada automaticamente.

## Descadastro (LGPD)
- Página pública `descadastro.html` → `functions/api/descadastro.js`: marca o e-mail como `descadastrado` (ou `exclusao_solicitada`), zera `consentimento` e grava `descadastrado_em`. Responde sempre "ok", para não revelar se o e-mail existe.
- **Antes de cada envio** (e-mail ou WhatsApp), use só quem tem consentimento ativo:
  ```sql
  SELECT nome, email, whatsapp FROM leads WHERE tipo = 'lista_espera' AND consentimento = 1;
  ```
- Alguém respondeu **SAIR** no WhatsApp:
  ```sql
  UPDATE leads SET consentimento = 0, status = 'descadastrado', descadastrado_em = datetime('now') WHERE whatsapp LIKE '%45999990000%';
  ```
- Pedidos de exclusão: confirme com a pessoa (pelo e-mail ou WhatsApp dela) e então apague, em até 15 dias:
  ```sql
  SELECT id, nome, email, descadastrado_em FROM leads WHERE status = 'exclusao_solicitada';
  DELETE FROM leads WHERE id = 123;
  ```

## Quando mudar os Termos ou a Política de Privacidade
1. Edite o texto e a data "Última atualização" da página.
2. Acrescente uma linha no "Histórico de versões" no fim da página (versão = data, ex.: `2026-11-15`).
3. Se mudou a Política de Privacidade ou os Termos, troque `TERMO_VERSAO` em `functions/api/lead.js` para a mesma versão. Os novos aceites passam a registrar a versão nova; os antigos continuam com a versão que a pessoa aceitou.
4. Se a mudança alterar como os dados são usados (nova finalidade, novo canal, novo fornecedor que recebe os dados), avise a lista e peça novo aceite antes de usar os dados para a finalidade nova.
