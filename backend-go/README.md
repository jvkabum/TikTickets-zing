# FlowDeskPro Backend - Go

Backend do sistema FlowDeskPro reescrito em Go (Golang) para melhor performance e manutenibilidade.

## 🚀 Tecnologias

- **Go 1.21+** - Linguagem principal
- **Gin** - Framework web
- **GORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **WebSocket** - Comunicação em tempo real

## 📋 Pré-requisitos

- Go 1.21 ou superior
- PostgreSQL 12+
- Redis 6+
- Docker (opcional)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd backend-go
```

2. **Instale as dependências**
```bash
go mod download
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute as migrações do banco**
```bash
# Criar tabelas (implementar migrações)
go run main.go
```

5. **Execute a aplicação**
```bash
go run main.go
```

## 🐳 Docker

### Build da imagem
```bash
docker build -t flowdeskpro-backend .
```

### Executar com Docker
```bash
docker run -p 8080:8080 --env-file .env flowdeskpro-backend
```

### Docker Compose
```bash
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
backend-go/
├── config/          # Configurações da aplicação
├── controllers/     # Controladores HTTP
├── database/        # Conexão e configuração do banco
├── middleware/      # Middlewares (auth, CORS, etc.)
├── models/          # Modelos de dados (GORM)
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio
├── utils/           # Utilitários (logger, helpers)
├── main.go          # Ponto de entrada da aplicação
├── go.mod           # Dependências Go
├── Dockerfile       # Configuração Docker
└── README.md        # Documentação
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ENVIRONMENT` | Ambiente (development/production) | development |
| `PORT` | Porta do servidor | 8080 |
| `LOG_LEVEL` | Nível de log | info |
| `DB_HOST` | Host do PostgreSQL | localhost |
| `DB_PORT` | Porta do PostgreSQL | 5432 |
| `DB_USER` | Usuário do PostgreSQL | - |
| `DB_PASSWORD` | Senha do PostgreSQL | - |
| `DB_NAME` | Nome do banco | - |
| `REDIS_HOST` | Host do Redis | localhost |
| `REDIS_PORT` | Porta do Redis | 6379 |
| `JWT_SECRET` | Chave secreta JWT | - |

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

### Empresas
- `GET /api/companies` - Listar empresas
- `POST /api/companies` - Criar empresa
- `GET /api/companies/:id` - Buscar empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Deletar empresa

### Contatos
- `GET /api/contacts` - Listar contatos
- `POST /api/contacts` - Criar contato
- `GET /api/contacts/:id` - Buscar contato
- `PUT /api/contacts/:id` - Atualizar contato
- `DELETE /api/contacts/:id` - Deletar contato

### Mensagens
- `GET /api/messages` - Listar mensagens
- `POST /api/messages` - Criar mensagem
- `GET /api/messages/:id` - Buscar mensagem
- `PUT /api/messages/:id` - Atualizar mensagem
- `DELETE /api/messages/:id` - Deletar mensagem

### WebSocket
- `GET /ws/chat` - Conexão WebSocket para chat

## 🧪 Testes

```bash
# Executar todos os testes
go test ./...

# Executar testes com coverage
go test -cover ./...

# Executar testes específicos
go test ./controllers
```

## 📊 Monitoramento

A aplicação inclui:
- Logs estruturados em JSON
- Métricas de performance
- Health check endpoint (`/api/health`)

## 🔒 Segurança

- Autenticação JWT
- Senhas hasheadas com bcrypt
- CORS configurado
- Headers de segurança
- Validação de entrada

## 🚀 Deploy

### Produção
1. Configure as variáveis de ambiente para produção
2. Build da aplicação: `go build -o main .`
3. Execute: `./main`

### Docker
```bash
docker build -t flowdeskpro-backend:latest .
docker run -d -p 8080:8080 --env-file .env.prod flowdeskpro-backend:latest
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença AGPL-3.0-or-later. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@flowdeskpro.com ou abra uma issue no GitHub.