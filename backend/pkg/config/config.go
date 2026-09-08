package config

import (
	"log"
	"os"
)

// Config centraliza todas as variáveis de ambiente do projeto.
// Suporta ambos os padrões de variáveis:
//   - Padrão Node legado: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
//   - Padrão Go novo:     DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
type Config struct {
	// Servidor
	Port        string
	BackendURL  string
	FrontendURL string
	NodeEnv     string

	// Banco de Dados
	DBHost     string
	DBUser     string
	DBPassword string
	DBName     string
	DBPort     string

	// JWT
	JWTSecret        string
	JWTRefreshSecret string

	// Redis
	RedisServer    string
	RedisPort      string
	RedisDBSession string
	RedisPassword  string

	// Whatsmeow (opcional)
	WhatsmeowURL string

	// Discord Webhook (opcional)
	DiscordWebhookURL string
}

// Load carrega todas as variáveis de ambiente e aborta se alguma obrigatória estiver ausente.
func Load() *Config {
	cfg := &Config{
		// Servidor
		Port:        getEnv("PORT", "3000"),
		BackendURL:  getEnv("BACKEND_URL", ""),
		FrontendURL: getEnv("FRONTEND_URL", ""),
		NodeEnv:     getEnv("NODE_ENV", "production"),

		// Banco de dados — aceita POSTGRES_* (Node) ou DB_* (Go)
		DBHost:     requireEnvFallback("DB_HOST", "POSTGRES_HOST"),
		DBUser:     requireEnvFallback("DB_USER", "POSTGRES_USER"),
		DBPassword: getEnvFallback("DB_PASSWORD", "POSTGRES_PASSWORD"),
		DBName:     requireEnvFallback("DB_NAME", "POSTGRES_DB"),
		DBPort:     getEnvFallbackDefault("5432", "DB_PORT", "POSTGRES_PORT"),

		// JWT
		JWTSecret:        requireEnv("JWT_SECRET"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", ""),

		// Redis
		RedisServer:    getEnv("IO_REDIS_SERVER", ""),
		RedisPort:      getEnv("IO_REDIS_PORT", "6379"),
		RedisDBSession: getEnv("IO_REDIS_DB_SESSION", "0"),
		RedisPassword:  getEnv("IO_REDIS_PASSWORD", ""),

		// Whatsmeow (opcional)
		WhatsmeowURL: getEnv("WHATSMEOW_URL", ""),

		// Discord Webhook (opcional)
		DiscordWebhookURL: getEnv("DISCORD_WEBHOOK_URL", ""),
	}

	return cfg
}

// requireEnv retorna o valor da variável ou aborta a inicialização se estiver vazia.
func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("ERRO FATAL: variável de ambiente obrigatória '%s' não definida. Defina-a no .env.", key)
	}
	return v
}

// requireEnvFallback retorna o valor da primeira chave encontrada, ou aborta se nenhuma estiver definida.
func requireEnvFallback(keys ...string) string {
	for _, k := range keys {
		if v := os.Getenv(k); v != "" {
			return v
		}
	}
	log.Fatalf("ERRO FATAL: nenhuma das variáveis %v está definida no .env. Pelo menos uma é obrigatória.", keys)
	return ""
}

// getEnv retorna o valor da variável ou um fallback padrão (sem abortar).
func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

// getEnvFallback retorna o valor da primeira chave encontrada, ou o padrão.
func getEnvFallback(keys ...string) string {
	for _, k := range keys {
		if v := os.Getenv(k); v != "" {
			return v
		}
	}
	return ""
}

// getEnvFallbackDefault retorna o valor da primeira chave encontrada ou um valor padrão caso nenhuma exista.
func getEnvFallbackDefault(defaultValue string, keys ...string) string {
	for _, k := range keys {
		if v := os.Getenv(k); v != "" {
			return v
		}
	}
	return defaultValue
}

