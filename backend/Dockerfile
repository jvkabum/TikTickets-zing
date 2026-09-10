# Estágio de Build
FROM golang:alpine AS builder

WORKDIR /app

# Instala certificados e ferramentas de build
RUN apk add --no-cache git ca-certificates tzdata

# Copia dependências e faz o download em cache
COPY go.mod go.sum ./
RUN go mod download

# Copia todo o código-fonte do backend
COPY . .

# Compila o binário estático e otimizado para produção
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o backend-go ./cmd/api

# Estágio Final (Imagem ultra-leve e segura)
FROM alpine:latest

WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

# Copia o binário compilado
COPY --from=builder /app/backend-go .

# Configurações padrão de ambiente
ENV PORT=3000
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

# Expõe a porta 3000 (compatível com a configuração padrão do Coolify)
EXPOSE 3000

CMD ["./backend-go"]
