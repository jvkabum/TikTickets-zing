# Estágio de Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copia dependências e faz o download
COPY go.mod go.sum ./
RUN go mod download

# Copia o código-fonte
COPY . .

# Compila o binário otimizado
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o backend-go ./cmd/api/main.go

# Estágio Final
FROM alpine:latest

WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/backend-go .

# Porta padrão
EXPOSE 8080

CMD ["./backend-go"]
