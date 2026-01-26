# TikTickets-zing v3.0.1 🚀
[![Grupo do WhatsApp](https://img.shields.io/badge/Grupo_Whatsapp-IzingFlow-blue)](https://chat.whatsapp.com/GHNJVQRoLzrGuO1lmCr7vR)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Quasar Framework](https://img.shields.io/badge/Quasar-2.17%2B-1976D2?style=flat-square&logo=quasar&logoColor=white)](https://quasar.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD75E?style=flat-square&logo=pinia&logoColor=white)](https://pinia.vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

Um ecossistema **SaaS Multi-tenant** avançado para gestão de atendimento multicanais centralizado, agora totalmente modernizado e otimizado para performance e experiência do usuário (UX).

---

## 💎 Inovações da Versão 3.0.0

A v3 representou um salto tecnológico e de usabilidade para o projeto:

- **🔥 Vue 3.5 & Composition API**: Refatoração completa do frontend para o motor mais moderno do Vue, garantindo reatividade de alta performance.
- **🛰️ State Management (Pinia)**: Transição do Vuex para Pinia. Agora a interface é controlada por uma arquitetura de "Stores" descentralizadas e leves, eliminando bugs de sincronização.
- **🎙️ Engine Real-MP3 (LameJS)**: Novo sistema de gravação de áudio nativo. Codificação MP3 em tempo real diretamente no navegador, garantindo compatibilidade universal em todos os dispositivos.
- **🎨 Design Arredondado & Premium**:
    - **Cards Estilizados (12px)**: Interface visual limpa e moderna.
    - **Glassmorphism**: Efeitos de transparência em barras e drawers.
    - **Timeline Inteligente**: Detecção automática de protocolos e visualização cronológica de atendimentos.
- **⚡ Sincronização Satélite**: O painel lateral de contatos e os cabeçalhos de chat agora operam em sincronia total via Store Global, reagindo instantaneamente a qualquer mudança.

---

## 🛠️ Ecossistema Tecnológico

### **Frontend**
- **Vue.js 3.5**: Core framework.
- **Quasar Framework 2**: UI Components & Build system.
- **Pinia**: Gestão de estado reativa.
- **Vite**: Build tool de ultra velocidade.
- **Wavesurfer.js**: Visualização de áudio premium.

### **Backend**
- **Node.js 22**: Runtime estável e veloz.
- **Express**: Framework web robusto.
- **Sequelize / PostgreSQL**: Persistência de dados profissional.
- **Redis & Bull**: Fila de processos e cache de alta velocidade.
- **Socket.io v3+**: Comunicação realtime bidirecional.
- **RabbitMQ**: Mensageria avançada para alta escala.

**IMPORTANTE**: verifique sempre o .env.example e ajuste o seu .env antes de atualizar, uma vez que algumas novas variáveis podem ser adicionadas.

## 🚀 Funcionalidades Principais

- **Multicanais**: WhatsApp (WebJS & WABA), Telegram, Instagram e Messenger.
- **Multi-tenant**: Suporte nativo a múltiplas empresas no mesmo banco (SaaS).
- **Chatbot Inteligente**: Construtor de fluxos interativos (FlowBuilder).
- **Mídias**: Envio e recepção de imagens, áudios (MP3), documentos e vídeos.
- **Agendamentos**: Sistema integrado de mensagens agendadas e lembretes.
- **Gestão de Equipe**: Departamentos/Filas, transferência de tickets e auditoria de logs.

## FIQUE ATENTO

A utilização desta ferramenta é feita por sua conta e risco. O código é aberto e todos podem contribuir.

## ⚙️ Instalação e Setup

1. **Requisitos**: Docker (opcional) ou Instalação manual de Node 22 / Postgres / Redis.
2. **Ambiente**: Utilize os arquivos `.env.example` tanto no `/backend` quanto no `/frontend-vue-3` como guia.
3. **Instalação**:
   ```bash
   # No Backend
   npm install
   npm run build
   npx sequelize db:migrate
   npx sequelize db:seed:all

   # No Frontend
   npm install
   ```

---

## 🔑 Credenciais Padrão

Para o acesso inicial ao sistema, utilize as seguintes credenciais:

- **Usuário Painel SaaS**: `super@izing.io` | **Senha**: `123456`
- **Usuário Normal**: `admin@izing.io` | **Senha**: `123456`

---

## ⚠️ FIQUE ATENTO

A utilização desta ferramenta é feita por sua conta e risco. O projeto não é afiliado à WhatsApp Inc. O código é aberto para contribuições da comunidade.

**Use com responsabilidade!** 🎉✨🏆🥇
