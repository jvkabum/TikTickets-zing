# Diagrama de Infraestrutura e Deployment

> Nível de Documentação: **Detalhado**

Este diagrama reflete o processo de deployment utilizando contêineres Docker, baseado nos artefatos encontrados no projeto (`docker-compose.yaml` e os `Dockerfile` do frontend e backend).

```mermaid
graph TD
    subgraph Cloud / On-Premise Host
        Proxy[Reverse Proxy / Nginx / Traefik \n Porta: 80 / 443]
        
        subgraph Docker Engine (docker-compose)
            Frontend[Frontend Container \n Vue 3 / Nginx \n Porta 8080]
            Backend[Backend Container \n Node.js API \n Porta 8080]
            Worker[Worker Container \n Node.js Bull \n Processamento de Filas]
            
            DB[(PostgreSQL Container \n Relacional)]
            Cache[(Redis Container \n PubSub / Filas)]
        end
    end
    
    Internet((Internet \n Clientes & \n Webhooks Meta)) --> Proxy
    
    Proxy -- "/api" --> Backend
    Proxy -- "/" --> Frontend
    
    Backend -->|Sequelize TCP| DB
    Backend -->|Bull / Socket.io TCP| Cache
    
    Worker -->|Consome Jobs Bull| Cache
    Worker -->|Read/Write transacional| DB
    
    Backend -.->|WSS / HTTPS| Meta/WhatsApp((WhatsApp / Meta Servers))
```

## Considerações de Deployment

1. **Containers Separados**: O ecossistema é quebrado em componentes lógicos.
   - O `Frontend` é comumente empacotado (`npm run build`) via Vite/Quasar e servido por um micro-Nginx dentro da sua própria imagem Docker.
   - O `Backend` executa o Node.js rodando o Express e os serviços de Socket.
   - Recomenda-se escalar o `Worker` separadamente do `Backend` principal para evitar que processamentos pesados (como as Campanhas de Massa) afetem o Event Loop da API REST.

2. **Volumes (Persistência)**:
   - **PostgreSQL**: Necessita de mapeamento de volume físico para manter os dados seguros em caso de restart do container.
   - **Mídias (`backend/public`)**: Os arquivos anexados de mensagens, avatares de contatos e retornos de respostas rápidas (`FastReply`) precisam ser armazenados em um volume compartilhado ou, preferencialmente, migrados para Object Storage (S3), visto que no atual estado de arquitetura eles residem em disco local.
   - **Sessões Wbot (`.wwebjs_auth`)**: Os tokens de sessão de leitura QR do Whatsapp ficam armazenados localmente e requerem volumes mapeados rígidos, caso contrário uma reinicialização de container força a leitura de novos QRCodes por parte de todos os Tenants do sistema.
