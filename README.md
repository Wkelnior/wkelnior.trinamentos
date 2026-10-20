# WKELNIOR Academy — Landing Page

Landing page de conversão (lista de espera) da WKELNIOR Academy. HTML/CSS/JS puros, sem build.

## Rodar local
```
npx serve .
```

## Configuração (`assets/js/config.js`)
- `waitlistEndpoint` — URL do Web App do Google Apps Script (`apps-script/Waitlist.gs`) que grava a lista na planilha e envia o e-mail de confirmação.
- `video` — `youtubeId` ou `mp4` do vídeo de apresentação.
- `checkoutUrl` — quando a venda abrir (Asaas), todos os CTAs passam a apontar para o checkout.

## Deploy
Qualquer hospedagem estática (Cloudflare Pages, Netlify, GitHub Pages) apontando para a raiz desta branch.
