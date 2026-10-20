WKELNIOR TREINAMENTOS — PROTÓTIPO VISUAL V1

Arquivos:
- index.html        = landing page comercial
- area-aluno.html   = catálogo / dashboard do aluno
- aula.html         = tela de aula, materiais e comentários
- admin.html        = painel administrativo demonstrativo

IMPORTANTE
Este pacote é um protótipo visual estático. O login, OTP, pagamento, progresso e comentários aparecem como experiência de interface, mas ainda não estão conectados ao backend.

ARQUITETURA RECOMENDADA PARA A VERSÃO REAL
1. Cloudflare Workers como backend/API.
2. D1 para usuários, compras, acessos, sessões, progresso, comentários e logs.
3. Asaas Webhook: liberar acesso somente no servidor após pagamento confirmado; usar idempotência para impedir liberação duplicada.
4. Acesso válido até paid_at + 365 dias, sempre validado no servidor.
5. Login por e-mail + código OTP de uso único; salvar apenas hash do código, com expiração curta e limite de tentativas.
6. Sessão em cookie HttpOnly + Secure + SameSite; nunca confiar em localStorage como autenticação.
7. Cloudflare Turnstile no login/OTP e rate limit para reduzir abuso.
8. Vídeos em solução privada com URL/token assinado e validade curta. Não publicar MP4 em URL pública.
9. Anexos privados em R2, entregues por URL assinada e expiração curta.
10. Todas as rotas de aluno e admin devem validar a sessão no Worker. Esconder botão no JavaScript não é segurança.
11. Role admin separada, com verificação server-side em todas as APIs administrativas.
12. Progresso salvo por aula: posição do vídeo, percentual, conclusão e último acesso.
13. Comentários/dúvidas vinculados à aula e ao usuário, com status aberto/respondido.
14. Cronômetro de expiração apenas exibe uma data vinda do servidor; ele não decide o acesso.

DIREÇÃO VISUAL USADA
- Identidade derivada do site atual: navy, quase preto, cyan, branco e prata.
- Linguagem: 01 IDEIA → 02 PROCESSO → 03 CÓDIGO → 04 SISTEMA.
- Catálogo inspirado na lógica de streaming, sem copiar a marca Netflix.
- Imagens reais dos seus sistemas para evitar estética genérica de IA.
- Layout responsivo para desktop e celular.

PRÓXIMA FASE SUGERIDA
Transformar este protótipo em aplicação real: Worker + D1 + Asaas + OTP + vídeo protegido + painel admin.
