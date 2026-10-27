/* Configuração da landing page — edite aqui, sem mexer no resto do código. */
window.WK_CONFIG = {
  // WhatsApp para aula particular (DDI+DDD+número, só dígitos) e como exibir.
  whatsapp: "5545998100107",
  whatsappLabel: "(45) 99810-0107",

  // Para onde vão os leads (lista de espera e aula particular).
  // "/api/lead" = Cloudflare D1 (functions/api/lead.js). Também aceita a URL de um Web App do Apps Script.
  // Vazio = os cadastros ficam salvos só no navegador (modo de teste).
  waitlistEndpoint: "/api/lead",

  // Vídeo de apresentação. Use um ID do YouTube ("dQw4w9WgXcQ") ou um link .mp4 / Vimeo embed.
  // Vazio = mostra o poster com o aviso "vídeo em breve".
  video: { youtubeId: "", mp4: "" },

  // Quando a venda abrir: coloque o link de checkout (Asaas) e todos os CTAs viram "Garantir minha vaga".
  checkoutUrl: "",

  // Rastreamento — só carrega depois que o visitante aceitar a categoria no aviso de cookies.
  // gaId: ID do Google Analytics 4 ("G-XXXXXXX"). metaPixelId: ID do Pixel da Meta (Instagram/Facebook).
  tracking: { gaId: "", metaPixelId: "" }
};
