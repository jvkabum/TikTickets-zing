# Integração API Externa

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Serviço headless para integração de ERPs e sistemas externos (Hubspot, RD Station) dos clientes que precisem postar ou ler mensagens usando os motores internos do SaaS sem interagir com a UI React/Vue.

## Responsabilidades
- Receber disparos de terceiros no endpoint genérico.
- Autenticar os consumidores cruzando ID do Tenant e API Token sem usar a sessão do front.
- Tratar requisições HTTP empacotando-as rápido em filas de BackGround para evitar Timeout nas integrações terceiras.
- Fornecer meio externo passivo para reativar uma conexão de WhatsApp desfalecida.

## Regras de Negócio
- A requisição requer autorização explícita via Middleware customizado `isAPIAuth` contendo a Token String associada na base 🟢
- Entradas textuais ou links binários URL são validados como Polimórficos, convertendo links diretos em Buffer para disparar mídia pelo WhatsApp WebJS 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/APIConfigController.ts` | Disparos Headless (`sendMessageAPI`) | 🟢 |
| `backend/src/middleware/isAPIAuth.ts` | Validador da sessão do Token | 🟢 |
