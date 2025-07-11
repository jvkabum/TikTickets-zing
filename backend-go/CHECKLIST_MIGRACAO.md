# Checklist de Migração Backend para Go

## ✅ Já Feito

- [x] Estrutura inicial do projeto Go (`backend-go/`)
- [x] Arquivo `go.mod` com dependências principais (Gin, GORM, Logrus, JWT, Viper, etc.)
- [x] Arquivo principal `main.go` com inicialização do servidor, logger, banco e rotas
- [x] Sistema de configuração (`config/config.go`) usando Viper e `.env`
- [x] Sistema de logging estruturado (`utils/logger/logger.go`) com Logrus e middleware para Gin
- [x] Conexão com banco de dados PostgreSQL usando GORM (`database/connection.go`)
- [x] Middleware de autenticação JWT (`middleware/auth.go`)
- [x] Middleware de CORS (`middleware/cors.go`)
- [x] Sistema de rotas principal (`routes/routes.go`) com rotas públicas e protegidas
- [x] Modelo User (`models/user.go`)
- [x] Modelo Company (`models/company.go`)
- [x] Controlador de autenticação (`controllers/auth_controller.go`) com login, registro e refresh token
- [x] Dockerfile otimizado para build e deploy da aplicação Go
- [x] Arquivo `.env.example` com todas as variáveis de ambiente necessárias
- [x] README.md completo com instruções de uso, estrutura, endpoints e deploy

## 🚧 O que Falta Fazer

- [ ] Implementar os controladores restantes:
    - [ ] Company (CRUD completo)
    - [ ] User (perfil, atualização)
    - [ ] Contact (CRUD)
    - [ ] Message (CRUD)
- [ ] Criar os modelos restantes:
    - [ ] Contact
    - [ ] Message
    - [ ] Outros modelos necessários (ex: integrações)
- [ ] Implementar WebSocket para chat em tempo real
- [ ] Migrar integrações com APIs externas (WhatsApp, Telegram, Instagram, etc.)
- [ ] Implementar sistema de filas (substituir Bull por Redis ou outro em Go)
- [ ] Criar sistema de migrações do banco de dados (ex: usar GORM AutoMigrate ou ferramenta dedicada)
- [ ] Implementar testes unitários e de integração
- [ ] Configurar CI/CD para build, testes e deploy do backend Go
- [ ] Documentar endpoints REST e WebSocket (Swagger/OpenAPI)
- [ ] Revisar segurança (validação de entrada, headers, etc.)
- [ ] Ajustar deploy em produção (Docker Compose, variáveis, monitoramento)

---

**Observação:**
A cada etapa concluída, marque o item correspondente. Assim, você terá um controle visual do progresso da migração!