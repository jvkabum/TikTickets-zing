// Arquivo: minimalArgs.js
// Define uma lista de argumentos mínimos para configuração de instâncias do navegador
const minimalArgs = [
  "--autoplay-policy=user-gesture-required", // Política de autoplay que requer interação do usuário
  "--disable-infobars", // Desativa as infobars do navegador
  "--disable-web-security", // Desativa a segurança da web
  "--disable-background-networking", // Desativa o networking em segundo plano
  "--disable-background-timer-throttling", // Desativa a limitação de timers em segundo plano
  "--disable-backgrounding-occluded-windows", // Desativa o backgrounding de janelas ocultas
  "--disable-breakpad", // Desativa o Breakpad (relatório de falhas)
  "--disable-client-side-phishing-detection", // Desativa a detecção de phishing do lado do cliente
  "--disable-component-update", // Desativa atualizações de componentes
  "--disable-default-apps", // Desativa aplicativos padrão
  "--disable-dev-shm-usage", // Desativa o uso de /dev/shm
  "--disable-domain-reliability", // Desativa a confiabilidade do domínio
  "--disable-extensions", // Desativa extensões do navegador
  "--disable-features=AudioServiceOutOfProcess", // Desativa o serviço de áudio em processo separado
  "--disable-gpu", // Desativa a aceleração de GPU
  "--disable-hang-monitor", // Desativa o monitor de travamentos
  "--disable-ipc-flooding-protection", // Desativa a proteção contra flooding IPC
  "--disable-notifications", // Desativa notificações
  "--disable-offer-store-unmasked-wallet-cards", // Desativa a oferta de armazenar cartões de crédito não mascarados
  "--disable-popup-blocking", // Desativa o bloqueio de pop-ups
  "--disable-print-preview", // Desativa a pré-visualização de impressão
  "--disable-prompt-on-repost", // Desativa o prompt ao repostar
  "--disable-renderer-backgrounding", // Desativa o backgrounding do renderizador
  "--disable-setuid-sandbox", // Desativa o sandbox setuid
  "--disable-speech-api", // Desativa a API de fala
  "--disable-sync", // Desativa a sincronização
  "--hide-scrollbars", // Oculta as barras de rolagem
  "--ignore-gpu-blacklist", // Ignora a lista negra de GPU
  "--metrics-recording-only", // Apenas grava métricas
  "--mute-audio", // Muta o áudio
  "--no-default-browser-check", // Desativa a verificação de navegador padrão
  "--no-first-run", // Desativa a execução inicial
  "--no-pings", // Desativa pings
  "--no-sandbox", // Desativa o sandbox
  "--no-zygote", // Desativa o zygote
  "--password-store=basic", // Armazena senhas de forma básica
  "--use-gl=swiftshader", // Usa SwiftShader para renderização
  "--disable-site-isolation-trials", // Desativa testes de isolamento de site
  "--no-experiments", // Desativa experimentos
  "--ignore-certificate-errors", // Ignora erros de certificado
  "--ignore-certificate-errors-spki-list", // Ignora erros de certificado SPKI
  "--enable-features=NetworkService", // Habilita o serviço de rede
  "--disable-webgl", // Desativa WebGL
  "--disable-threaded-animation", // Desativa animação em threads
  "--disable-threaded-scrolling", // Desativa rolagem em threads
  "--disable-in-process-stack-traces", // Desativa rastreamentos de pilha em processo
  "--disable-histogram-customizer", // Desativa o personalizador de histograma
  "--disable-gl-extensions", // Desativa extensões GL
  "--disable-composited-antialiasing", // Desativa antialiasing composto
  "--disable-canvas-aa", // Desativa antialiasing de canvas
  "--disable-3d-apis", // Desativa APIs 3D
  "--disable-accelerated-2d-canvas", // Desativa canvas 2D acelerado
  "--disable-accelerated-jpeg-decoding", // Desativa decodificação JPEG acelerada
  "--disable-accelerated-mjpeg-decode", // Desativa decodificação MJPEG acelerada
  "--disable-app-list-dismiss-on-blur", // Desativa o fechamento da lista de aplicativos ao perder o foco
  "--disable-accelerated-video-decode", // Desativa decodificação de vídeo acelerada
  "--use-mock-keychain" // Usa um keychain simulado
];

module.exports = minimalArgs; // Exporta a lista de argumentos mínimos
