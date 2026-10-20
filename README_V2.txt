WKELNIOR ACADEMY — PROTÓTIPO VISUAL V2

Este pacote é um protótipo front-end para TESTE VISUAL E DE EXPERIÊNCIA.
Ainda não contém D1, autenticação real, webhook Asaas, envio real de OTP ou proteção de vídeo.

ABRA PRIMEIRO:
- area-aluno.html    -> dashboard do aluno em estilo catálogo/streaming
- aula.html          -> aula + playlist + materiais + nova área de dúvidas/comentários
- admin.html         -> gestão de módulos, turmas, matriz de liberação, alunos, Asaas e moderação
- index.html         -> landing comercial da V1 (mantida para comparação)

INTERAÇÕES DE TESTE:
- aula.html: trocar abas; publicar uma dúvida; filtrar dúvidas; marcar aula concluída.
- admin.html: criar módulo; criar turma; ocultar/publicar módulos; alterar célula da matriz de liberação.

ARQUITETURA DEFINITIVA PREVISTA:
Cloudflare Pages/Workers + D1 + R2/Stream + Asaas Webhooks + OTP por e-mail + sessão HttpOnly.

IMPORTANTE:
Os dados, turmas, métricas, pagamentos e comentários desta versão são fictícios e servem apenas para prototipação.
