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
