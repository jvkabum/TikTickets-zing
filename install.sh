#!/usr/bin/env bash
# ==============================================================================
# TikTickets-zing - Instalador Automatizado para VPS Ubuntu (Versão 3.0 Gold Master)
# Repositório Oficial: https://github.com/jvkabum/TikTickets-zing (Branch: state)
# Suporte: Ubuntu 22.04 LTS / 24.04 LTS (x86_64 / aarch64)
# ==============================================================================

set -Eeuo pipefail

# ------------------------------------------------------------------------------
# 1. Paleta de Cores e Estilos Modernos (Dark Theme / UI Neon)
# ------------------------------------------------------------------------------
ESC='\033['
RESET="${ESC}0m"
BOLD="${ESC}1m"
DIM="${ESC}2m"
ITALIC="${ESC}3m"
UNDERLINE="${ESC}4m"

# Cores Principais
PURPLE="${ESC}38;5;141m"
CYAN="${ESC}38;5;87m"
GREEN="${ESC}38;5;120m"
YELLOW="${ESC}38;5;221m"
RED="${ESC}38;5;203m"
GRAY="${ESC}38;5;244m"
WHITE="${ESC}38;5;255m"
BLUE="${ESC}38;5;75m"

# Log Geral da Instalação
LOG_FILE="/tmp/tiktickets_install.log"
: > "$LOG_FILE"

# Tratamento Visual de Erros (Trap ERR)
cleanup_error() {
  local exit_code=$1
  local line_no=$2
  echo ""
  echo -e "  ${RED}╭─────────────────────────────────────────────────────────────╮${RESET}"
  echo -e "  ${RED}│  ${BOLD}✖ [ERRO CRÍTICO] Falha na execução do instalador!${RESET}         ${RED}│${RESET}"
  echo -e "  ${RED}├─────────────────────────────────────────────────────────────┤${RESET}"
  printf "  ${RED}│${RESET}  ${YELLOW}Linha afetada :${RESET} %-41s ${RED}│${RESET}\n" "${line_no}"
  printf "  ${RED}│${RESET}  ${YELLOW}Código de erro:${RESET} %-41s ${RED}│${RESET}\n" "${exit_code}"
  echo -e "  ${RED}│${RESET}  ${DIM}Consulte os logs em:${RESET} ${WHITE}/tmp/tiktickets_install.log${RESET}            ${RED}│${RESET}"
  echo -e "  ${RED}╰─────────────────────────────────────────────────────────────╯${RESET}"
  echo ""
}
trap 'cleanup_error $? $LINENO' ERR

# ------------------------------------------------------------------------------
# Funções Auxiliares de Interface (UI Engine)
# ------------------------------------------------------------------------------
print_banner() {
  clear
  echo -e "${PURPLE}"
  cat << "EOF"
  ╭─────────────────────────────────────────────────────────────────────────╮
  │   ______ _ _    _______ _      _        _            ______ _           │
  │  |_   _(_) |   |__   __(_)    | |      | |          |  ____| |          │
  │    | |  _| | __   | |   _  ___| | _____| |_ ___ ____| |__  | | _____    │
  │    | | | | |/ /   | |  | |/ __| |/ / _ \ __/ __|____|  __| | |/ _ \ \   │
  │   _| |_| |   <    | |  | | (__|   <  __/ |_\__ \    | |    | | (_) \ \  │
  │  |_____|_|_|\_\   |_|  |_|\___|_|\_\___|\__|___/    |_|    |_|\___/  \  │
  │                                                                         │
  │    ⚡ TikTickets-zing Enterprise Orchestrator • v3.0 Gold Master        │
  ╰─────────────────────────────────────────────────────────────────────────╯
EOF
  echo -e "${RESET}"
  echo -e "  ${DIM}Repositório:${RESET} ${CYAN}https://github.com/jvkabum/TikTickets-zing${RESET} ${DIM}(Branch: state)${RESET}\n"
}

print_step() {
  local current=$1
  local total=$2
  local title="$3"
  echo ""
  echo -e "  ${DIM}Etapa ${current} de ${total}${RESET}"
  echo -e "  ${PURPLE}${BOLD}▸ ${title}${RESET}"
  echo -e "  ${DIM}─────────────────────────────────────────────────────────────${RESET}"
}

ui_success() {
  echo -e "  ${GREEN}✔${RESET} $1"
}

ui_info() {
  echo -e "  ${CYAN}ℹ${RESET} $1"
}

ui_warn() {
  echo -e "  ${YELLOW}⚠${RESET} $1"
}

ui_error() {
  echo -e "  ${RED}✖${RESET} $1"
}

run_spinner() {
  local msg="$1"
  shift
  local step_log="/tmp/tiktickets_step.log"

  # Executa o comando em background direcionando saídas para log
  "$@" >> "$step_log" 2>&1 &
  local pid=$!

  local spin_chars="⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏"

  while kill -0 "$pid" 2>/dev/null; do
    for char in $spin_chars; do
      printf "\r  ${CYAN}${char}${RESET} %s... " "$msg"
      sleep 0.08
    done
  done

  wait "$pid"
  local exit_code=$?
  cat "$step_log" >> "$LOG_FILE" 2>/dev/null || true

  if [ $exit_code -eq 0 ]; then
    printf "\r  ${GREEN}✔${RESET} %s\n" "$msg"
    return 0
  else
    printf "\r  ${RED}✖${RESET} %s ${RED}(Falhou!)${RESET}\n" "$msg"
    echo -e "  ${DIM}Últimas linhas do erro:${RESET}"
    tail -n 12 "$step_log" | sed 's/^/    /'
    return $exit_code
  fi
}

print_banner

# ------------------------------------------------------------------------------
# 2. Checagens Pré-requisito do Sistema
# ------------------------------------------------------------------------------
if [ "${EUID}" -ne 0 ]; then
  ui_error "Este instalador precisa ser executado como root."
  echo -e "  Execute com: ${YELLOW}sudo bash $0${RESET} ou conecte-se como root.\n"
  exit 1
fi

if [ -f /etc/os-release ]; then
  # shellcheck source=/dev/null
  . /etc/os-release
  OS="${ID}"
else
  ui_error "Não foi possível determinar o sistema operacional."
  exit 1
fi

if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
  ui_warn "Sistema operacional não é Ubuntu/Debian. Prosseguindo com precaução..."
fi

# Detectar IP Público
SERVER_IP=$(curl -s -m 5 https://api.ipify.org || curl -s -m 5 https://ifconfig.me || hostname -I | awk '{print $1}')
ui_success "IP Público do Servidor: ${BOLD}${WHITE}${SERVER_IP}${RESET}"

# Detectar Porta SSH Ativa (Prevenção de Lockout)
DETECTED_SSH_PORT=$(ss -tlnp 2>/dev/null | grep -E 'sshd|ssh' | awk '{print $4}' | awk -F: '{print $NF}' | grep -E '^[0-9]+$' | head -n1 || true)
if [ -z "$DETECTED_SSH_PORT" ]; then
  DETECTED_SSH_PORT=$(grep -Ei '^\s*Port\s+[0-9]+' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/*.conf 2>/dev/null | awk '{print $2}' | head -n1 || true)
fi
SSH_PORT="${DETECTED_SSH_PORT:-22}"
ui_success "Porta SSH Ativa Detectada: ${BOLD}${WHITE}${SSH_PORT}${RESET}"

# ------------------------------------------------------------------------------
# 3. Idempotência: Checagem de Configuração Existente (.env)
# ------------------------------------------------------------------------------
APP_DIR="/opt/tiktickets"
ENV_FILE="${APP_DIR}/.env"

EXISTING_INSTALLATION=false
if [ -f "$ENV_FILE" ]; then
  EXISTING_INSTALLATION=true
  echo ""
  echo -e "  ${YELLOW}╭─ Instalação Existente Detectada ────────────────────────────╮${RESET}"
  echo -e "  ${YELLOW}│${RESET}  Encontramos dados de uma stack já provisionada em:         ${YELLOW}│${RESET}"
  echo -e "  ${YELLOW}│${RESET}  ${WHITE}${APP_DIR}${RESET}                                             ${YELLOW}│${RESET}"
  echo -e "  ${YELLOW}╰─────────────────────────────────────────────────────────────╯${RESET}"
  
  FRONTEND_DOMAIN=$(grep -E '^FRONTEND_DOMAIN=' "$ENV_FILE" | cut -d '=' -f2- || true)
  BACKEND_DOMAIN=$(grep -E '^BACKEND_DOMAIN=' "$ENV_FILE" | cut -d '=' -f2- || true)
  SSL_EMAIL=$(grep -E '^SSL_EMAIL=' "$ENV_FILE" | cut -d '=' -f2- || true)
  DB_PASSWORD=$(grep -E '^DB_PASSWORD=' "$ENV_FILE" | cut -d '=' -f2- || true)
  JWT_SECRET=$(grep -E '^JWT_SECRET=' "$ENV_FILE" | cut -d '=' -f2- || true)
  JWT_REFRESH_SECRET=$(grep -E '^JWT_REFRESH_SECRET=' "$ENV_FILE" | cut -d '=' -f2- || true)
  INSTALL_COOLIFY_PANEL=$(grep -E '^INSTALL_COOLIFY_PANEL=' "$ENV_FILE" | cut -d '=' -f2- || echo "n")
fi

if [ "$EXISTING_INSTALLATION" = true ]; then
  echo ""
  echo -e "  Configurações atuais salvas:"
  echo -e "  • Frontend : ${GREEN}https://${FRONTEND_DOMAIN}${RESET}"
  echo -e "  • Backend  : ${GREEN}https://${BACKEND_DOMAIN}${RESET}"
  echo -e "  • SSL Email: ${GREEN}${SSL_EMAIL}${RESET}"
  echo ""
  read -p "  Deseja manter as configurações e credenciais existentes? (S/n): " KEEP_CONFIG
  KEEP_CONFIG=${KEEP_CONFIG:-S}

  if [[ ! "$KEEP_CONFIG" =~ ^[Ss]$ ]]; then
    echo ""
    ui_info "Reconfiguração de domínios (senhas do banco e segredos JWT serão preservados)."
    read -p "  Novo domínio do FRONTEND [${FRONTEND_DOMAIN}]: " INPUT_FE
    FRONTEND_DOMAIN=${INPUT_FE:-$FRONTEND_DOMAIN}
    read -p "  Novo domínio do BACKEND [${BACKEND_DOMAIN}]: " INPUT_BE
    BACKEND_DOMAIN=${INPUT_BE:-$BACKEND_DOMAIN}
    read -p "  E-mail para SSL Let's Encrypt [${SSL_EMAIL}]: " INPUT_EMAIL
    SSL_EMAIL=${INPUT_EMAIL:-$SSL_EMAIL}
    read -p "  Instalar painel Coolify na porta 8000? (S/n) [${INSTALL_COOLIFY_PANEL}]: " INPUT_COOLIFY
    INSTALL_COOLIFY_PANEL=${INPUT_COOLIFY:-$INSTALL_COOLIFY_PANEL}
  fi
else
  # Nova Instalação
  echo ""
  echo -e "  ${PURPLE}╭─ Configuração de Domínios e Apontamentos DNS ───────────────╮${RESET}"
  echo -e "  ${PURPLE}│${RESET}  Certifique-se de que os subdomínios possuam entrada tipo A ${PURPLE}│${RESET}"
  echo -e "  ${PURPLE}│${RESET}  apontando para ${WHITE}${BOLD}${SERVER_IP}${RESET} no seu Cloudflare ou DNS.       ${PURPLE}│${RESET}"
  echo -e "  ${PURPLE}╰─────────────────────────────────────────────────────────────╯${RESET}"
  echo ""

  read -p "  Domínio do FRONTEND (ex: app.meudominio.com): " FRONTEND_DOMAIN
  while [ -z "$FRONTEND_DOMAIN" ]; do
    ui_error "O domínio do frontend é obrigatório!"
    read -p "  Domínio do FRONTEND: " FRONTEND_DOMAIN
  done

  read -p "  Domínio da API BACKEND (ex: api.meudominio.com): " BACKEND_DOMAIN
  while [ -z "$BACKEND_DOMAIN" ]; do
    ui_error "O domínio do backend é obrigatório!"
    read -p "  Domínio da API BACKEND: " BACKEND_DOMAIN
  done

  read -p "  E-mail para emissão SSL (ex: admin@seudominio.com): " SSL_EMAIL
  if [ -z "$SSL_EMAIL" ]; then
    SSL_EMAIL="admin@${FRONTEND_DOMAIN}"
  fi

  echo ""
  read -p "  Deseja instalar o painel web do Coolify na porta 8000? (s/N): " INSTALL_COOLIFY_PANEL
  INSTALL_COOLIFY_PANEL=${INSTALL_COOLIFY_PANEL:-n}

  # Geração única e segura de credenciais
  DB_PASSWORD=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
fi

DB_NAME="tiktickets"
DB_USER="tiktickets_user"

# ------------------------------------------------------------------------------
# 4. Verificação Prévia de DNS
# ------------------------------------------------------------------------------
echo ""
ui_info "Verificando apontamentos DNS..."
if command -v dig &>/dev/null; then
  FE_IP=$(dig +short "$FRONTEND_DOMAIN" | tail -n1 || true)
elif command -v getent &>/dev/null; then
  FE_IP=$(getent ahostsv4 "$FRONTEND_DOMAIN" 2>/dev/null | awk '{print $1}' | head -n1 || true)
else
  FE_IP=""
fi

if [ -n "$FE_IP" ] && [ "$FE_IP" != "$SERVER_IP" ]; then
  ui_warn "O domínio ${FRONTEND_DOMAIN} aponta para ${FE_IP} (IP da VPS: ${SERVER_IP})."
  echo -e "    ${DIM}Caso utilize proxy Cloudflare (nuvem laranja), isso é perfeitamente normal.${RESET}"
fi

# ------------------------------------------------------------------------------
# 5. Resumo da Instalação (Card Inicial)
# ------------------------------------------------------------------------------
echo ""
echo -e "  ${CYAN}╭─ Resumo da Configuração ────────────────────────────────────╮${RESET}"
printf "  ${CYAN}│${RESET}  ${DIM}Frontend Web     :${RESET} %-40s ${CYAN}│${RESET}\n" "https://${FRONTEND_DOMAIN}"
printf "  ${CYAN}│${RESET}  ${DIM}Backend API      :${RESET} %-40s ${CYAN}│${RESET}\n" "https://${BACKEND_DOMAIN}"
printf "  ${CYAN}│${RESET}  ${DIM}E-mail SSL       :${RESET} %-40s ${CYAN}│${RESET}\n" "${SSL_EMAIL}"
printf "  ${CYAN}│${RESET}  ${DIM}Painel Coolify   :${RESET} %-40s ${CYAN}│${RESET}\n" "${INSTALL_COOLIFY_PANEL^^}"
printf "  ${CYAN}│${RESET}  ${DIM}Porta SSH Ativa  :${RESET} %-40s ${CYAN}│${RESET}\n" "${SSH_PORT} (Protegida)"
echo -e "  ${CYAN}╰─────────────────────────────────────────────────────────────╯${RESET}"
echo ""
read -p "  Pressione ENTER para iniciar a implantação ou CTRL+C para cancelar..."

# ------------------------------------------------------------------------------
# 6. Alocação de Memória SWAP
# ------------------------------------------------------------------------------
print_step 1 9 "Configuração de Memória e Recursos do Sistema"
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
SWAP_EXISTS=$(swapon --show | wc -l)

setup_swap_file() {
  fallocate -l 4G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
}

if [ "$SWAP_EXISTS" -le 1 ] && [ "$TOTAL_RAM_KB" -lt 6291456 ]; then
  run_spinner "Alocando 4GB de SWAP para estabilidade de build" setup_swap_file
else
  ui_success "Níveis de memória RAM e SWAP adequados."
fi

# ------------------------------------------------------------------------------
# 7. Pacotes e Ferramentas Essenciais
# ------------------------------------------------------------------------------
print_step 2 9 "Atualização de Repositórios e Instalação de Pacotes"
install_packages() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y --no-install-recommends \
    curl wget git jq openssl ufw ca-certificates gnupg lsb-release dnsutils cron gzip
}
run_spinner "Instalando dependências essenciais do Ubuntu" install_packages

# ------------------------------------------------------------------------------
# 8. Firewall UFW à Prova de Lockout
# ------------------------------------------------------------------------------
print_step 3 9 "Configuração do Firewall UFW (Zero Lockout)"
configure_firewall() {
  ufw allow "${SSH_PORT}/tcp" >/dev/null 2>&1 || true
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then
    ufw allow 8000/tcp >/dev/null 2>&1 || true
  fi
  ufw --force enable >/dev/null 2>&1 || true
}
run_spinner "Ativando regras do Firewall (Portas ${SSH_PORT}, 80, 443 liberadas)" configure_firewall

# ------------------------------------------------------------------------------
# 9. Docker Engine e Docker Compose
# ------------------------------------------------------------------------------
print_step 4 9 "Verificação do Docker Engine e Compose v2"
install_docker() {
  if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
  fi
}
run_spinner "Configurando Docker Engine oficial" install_docker
ui_success "Docker pronto: $(docker --version | awk '{print $1,$2,$3}')"

# ------------------------------------------------------------------------------
# 10. Coolify vs Traefik Standalone
# ------------------------------------------------------------------------------
print_step 5 9 "Orquestração de Rede e Proxy Reverso (SSL Automático)"
USE_EMBEDDED_TRAEFIK=false

if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then
  setup_coolify() {
    if ! docker ps --format '{{.Names}}' | grep -q "coolify"; then
      curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
      sleep 15
    fi
  }
  run_spinner "Provisionando painel oficial do Coolify" setup_coolify
  ui_info "Coolify ativo na porta 8000."
else
  ui_success "Modo Standalone selecionado (Traefik v3 dedicado com ACME/Let's Encrypt)."
  USE_EMBEDDED_TRAEFIK=true
fi

# Cria rede docker compartilhada se não existir
docker network create --attachable coolify 2>/dev/null || true

# ------------------------------------------------------------------------------
# 11. Clone / Atualização Segura do Código
# ------------------------------------------------------------------------------
print_step 6 9 "Sincronização de Código com o Repositório Oficial"
sync_repository() {
  mkdir -p "$APP_DIR"
  if [ -d "$APP_DIR/.git" ]; then
    git -C "$APP_DIR" fetch origin state
    git -C "$APP_DIR" checkout state
    git -C "$APP_DIR" reset --hard origin/state
  else
    git clone -b state https://github.com/jvkabum/TikTickets-zing.git "$APP_DIR"
  fi
}
run_spinner "Sincronizando branch state em ${APP_DIR}" sync_repository
GIT_COMMIT_HASH=$(git -C "$APP_DIR" rev-parse --short HEAD 2>/dev/null || echo "latest")
ui_success "Versão do código ancorada no commit: ${BOLD}${WHITE}${GIT_COMMIT_HASH}${RESET}"

# ------------------------------------------------------------------------------
# 12. Gestão de Segredos: .env da Aplicação vs backup.env
# ------------------------------------------------------------------------------
print_step 7 9 "Geração de Configurações Seguras e Isolamento de Segredos"
configure_secrets() {
  # .env principal da aplicação
  cat <<EOF > "$ENV_FILE"
# ==============================================================================
# TikTickets-zing - Configurações de Produção
# Gerado automaticamente em: $(date)
# Commit: ${GIT_COMMIT_HASH}
# ==============================================================================
COMPOSE_PROJECT_NAME=tiktickets

FRONTEND_DOMAIN=${FRONTEND_DOMAIN}
BACKEND_DOMAIN=${BACKEND_DOMAIN}
SSL_EMAIL=${SSL_EMAIL}
BACKEND_URL=https://${BACKEND_DOMAIN}
FRONTEND_URL=https://${FRONTEND_DOMAIN}

POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
DB_HOST=postgres
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo

INSTALL_COOLIFY_PANEL=${INSTALL_COOLIFY_PANEL}
USE_EMBEDDED_TRAEFIK=${USE_EMBEDDED_TRAEFIK}
EOF
  chmod 600 "$ENV_FILE"
  chown root:root "$ENV_FILE"

  # Isolamento de Segredos S3/R2 fora da pasta da stack
  local backup_cfg_dir="/root/.config/tiktickets"
  mkdir -p "$backup_cfg_dir"
  chmod 700 "$backup_cfg_dir"
  if [ ! -f "${backup_cfg_dir}/backup.env" ]; then
    cat <<EOF > "${backup_cfg_dir}/backup.env"
# Credenciais Offsite S3 / Cloudflare R2 / Backblaze / MinIO
S3_BACKUP_ENABLED=false
S3_ENDPOINT=""
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION="auto"
EOF
    chmod 600 "${backup_cfg_dir}/backup.env"
    chown root:root "${backup_cfg_dir}/backup.env"
  fi
}
run_spinner "Gerando /opt/tiktickets/.env e /root/.config/tiktickets/backup.env (chmod 600)" configure_secrets

# ------------------------------------------------------------------------------
# 13. Geração do docker-compose.prod.yml com Segmentação de Redes
# ------------------------------------------------------------------------------
mkdir -p "${APP_DIR}/letsencrypt"
chmod 700 "${APP_DIR}/letsencrypt"
touch "${APP_DIR}/letsencrypt/acme.json"
chmod 600 "${APP_DIR}/letsencrypt/acme.json"

cat <<'EOF' > "${APP_DIR}/docker-compose.prod.yml"
version: '3.8'

networks:
  coolify:
    external: true
  internal:
    driver: bridge
    internal: true

volumes:
  tiktickets_postgres_data:
    name: tiktickets_postgres_data

services:
EOF

if [ "$USE_EMBEDDED_TRAEFIK" = true ]; then
cat <<'EOF' >> "${APP_DIR}/docker-compose.prod.yml"
  # ==========================================
  # 0. PROXY REVERSO E SSL: Traefik v3 Standalone
  # ==========================================
  traefik:
    image: traefik:v3.1
    container_name: tiktickets-traefik
    restart: always
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${SSL_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - coolify

EOF
fi

cat <<'EOF' >> "${APP_DIR}/docker-compose.prod.yml"
  # ==========================================
  # 1. BANCO DE DADOS: PostgreSQL 17 (Rede Isolada)
  # ==========================================
  postgres:
    image: postgres:17-alpine
    container_name: tiktickets-postgres
    restart: always
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      TZ: ${TZ}
    volumes:
      - tiktickets_postgres_data:/var/lib/postgresql/data
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  # ==========================================
  # 2. BACKEND: Go API Nativa (Dual Network)
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tiktickets-backend
    restart: always
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - coolify
      - internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tiktickets-api.rule=Host(`${BACKEND_DOMAIN}`)"
      - "traefik.http.routers.tiktickets-api.entrypoints=websecure"
      - "traefik.http.routers.tiktickets-api.tls=true"
      - "traefik.http.routers.tiktickets-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.tiktickets-api.loadbalancer.server.port=3000"

  # ==========================================
  # 3. FRONTEND: Vue 3 / Vite (Rede Externa)
  # ==========================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VUE_URL_API: https://${BACKEND_DOMAIN}
    container_name: tiktickets-frontend
    restart: always
    depends_on:
      - backend
    networks:
      - coolify
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tiktickets-app.rule=Host(`${FRONTEND_DOMAIN}`)"
      - "traefik.http.routers.tiktickets-app.entrypoints=websecure"
      - "traefik.http.routers.tiktickets-app.tls=true"
      - "traefik.http.routers.tiktickets-app.tls.certresolver=letsencrypt"
      - "traefik.http.services.tiktickets-app.loadbalancer.server.port=80"
EOF

# Subir contêineres usando project-directory explícito
build_and_up_stack() {
  cd "$APP_DIR"
  docker compose --project-directory "$APP_DIR" -f "${APP_DIR}/docker-compose.prod.yml" up -d --build
}
run_spinner "Compilando imagens Docker e iniciando serviços da stack" build_and_up_stack

# ------------------------------------------------------------------------------
# 14. Rotina de Backup Automático
# ------------------------------------------------------------------------------
mkdir -p "${APP_DIR}/backups"
chmod 700 "${APP_DIR}/backups"

cat << 'EOF' > "${APP_DIR}/backup.sh"
#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/tiktickets"
ENV_FILE="${APP_DIR}/.env"
BACKUP_ENV_FILE="/root/.config/tiktickets/backup.env"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/tiktickets_backup_${TIMESTAMP}.sql.gz"

if [ ! -f "$ENV_FILE" ]; then
  echo "[ERRO] Arquivo .env não encontrado em $ENV_FILE"
  exit 1
fi

POSTGRES_USER=$(grep -E '^POSTGRES_USER=' "$ENV_FILE" | cut -d '=' -f2-)
POSTGRES_DB=$(grep -E '^POSTGRES_DB=' "$ENV_FILE" | cut -d '=' -f2-)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup do PostgreSQL (${POSTGRES_DB})..."
docker exec tiktickets-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup local concluído com sucesso: $BACKUP_FILE (${FILE_SIZE})"

# Envio Offsite Opcional
if [ -f "$BACKUP_ENV_FILE" ]; then
  S3_BACKUP_ENABLED=$(grep -E '^S3_BACKUP_ENABLED=' "$BACKUP_ENV_FILE" | cut -d '=' -f2- || echo "false")
  S3_BUCKET=$(grep -E '^S3_BUCKET=' "$BACKUP_ENV_FILE" | cut -d '=' -f2- || echo "")
  S3_ENDPOINT=$(grep -E '^S3_ENDPOINT=' "$BACKUP_ENV_FILE" | cut -d '=' -f2- || echo "")
  
  if [ "$S3_BACKUP_ENABLED" = "true" ] && [ -n "$S3_BUCKET" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sincronizando backup para S3/R2..."
    UPLOAD_OK=false
    if command -v aws &>/dev/null; then
      if aws --endpoint-url="$S3_ENDPOINT" s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/$(basename "$BACKUP_FILE")"; then
        UPLOAD_OK=true
      fi
    elif command -v rclone &>/dev/null; then
      if rclone copy "$BACKUP_FILE" "tiktickets-s3:${S3_BUCKET}"; then
        UPLOAD_OK=true
      fi
    fi

    if [ "$UPLOAD_OK" = true ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload offsite concluído com sucesso."
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERRO CRÍTICO] Falha ao enviar backup para S3/R2!" >> "${BACKUP_DIR}/backup.log"
      echo "[ERRO CRÍTICO] Falha no upload remoto para nuvem S3/R2!" >&2
      exit 1
    fi
  fi
fi

# Política de retenção local: 7 dias
find "$BACKUP_DIR" -type f -name "tiktickets_backup_*.sql.gz" -mtime +7 -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotina de backup finalizada."
EOF
chmod +x "${APP_DIR}/backup.sh"

# Agendamento diário no cron
CRON_JOB="0 3 * * * /opt/tiktickets/backup.sh >> /opt/tiktickets/backups/backup.log 2>&1"
if ! crontab -l 2>/dev/null | grep -Fq "/opt/tiktickets/backup.sh"; then
  (crontab -l 2>/dev/null || true; echo "$CRON_JOB") | crontab -
fi

# ------------------------------------------------------------------------------
# 15. Utilitário CLI (`tiktickets`) v3.0
# ------------------------------------------------------------------------------
cat << "EOF" > /usr/local/bin/tiktickets
#!/usr/bin/env bash
set -e

APP_DIR="/opt/tiktickets"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"
COMPOSE_CMD="docker compose --project-directory ${APP_DIR} -f ${COMPOSE_FILE}"

if [ -f "${APP_DIR}/.env" ]; then
  POSTGRES_USER=$(grep -E '^POSTGRES_USER=' "${APP_DIR}/.env" | cut -d '=' -f2- || echo "tiktickets_user")
  POSTGRES_DB=$(grep -E '^POSTGRES_DB=' "${APP_DIR}/.env" | cut -d '=' -f2- || echo "tiktickets")
  FRONTEND_DOMAIN=$(grep -E '^FRONTEND_DOMAIN=' "${APP_DIR}/.env" | cut -d '=' -f2- || echo "")
  BACKEND_DOMAIN=$(grep -E '^BACKEND_DOMAIN=' "${APP_DIR}/.env" | cut -d '=' -f2- || echo "")
else
  POSTGRES_USER="tiktickets_user"
  POSTGRES_DB="tiktickets"
  FRONTEND_DOMAIN=""
  BACKEND_DOMAIN=""
fi

case "$1" in
  status)
    $COMPOSE_CMD ps
    ;;
  restart)
    $COMPOSE_CMD restart
    ;;
  stop)
    $COMPOSE_CMD down
    ;;
  start)
    $COMPOSE_CMD up -d
    ;;
  logs)
    if [ -n "${2:-}" ]; then
      $COMPOSE_CMD logs -f "$2"
    else
      $COMPOSE_CMD logs -f
    fi
    ;;
  health)
    echo "=================================================================="
    echo "            TikTickets - Verificação de Integridade               "
    echo "=================================================================="
    echo -n "• PostgreSQL 17 (Rede Isolada): "
    if docker exec tiktickets-postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" &>/dev/null; then
      echo -e "\033[38;5;120m[SAUDÁVEL / ONLINE]\033[0m"
    else
      echo -e "\033[38;5;203m[FALHA / INDISPONÍVEL]\033[0m"
    fi

    echo -n "• Backend Go Liveness (/health): "
    if docker exec tiktickets-backend wget -q -O - http://127.0.0.1:3000/health 2>/dev/null | grep -q "status"; then
      echo -e "\033[38;5;120m[SAUDÁVEL / HTTP 200 OK]\033[0m"
    else
      echo -e "\033[38;5;203m[FALHA / PROCESSO NÃO RESPONDE]\033[0m"
    fi

    echo -n "• Backend Go Readiness (/ready): "
    if docker exec tiktickets-backend wget -q -O - http://127.0.0.1:3000/ready 2>/dev/null | grep -q "ready"; then
      echo -e "\033[38;5;120m[PRONTO / DB CONECTADO]\033[0m"
    else
      echo -e "\033[38;5;203m[FALHA / DB DESCONECTADO]\033[0m"
    fi

    echo -n "• Frontend SPA (Nginx): "
    if docker exec tiktickets-frontend wget -q -O - http://127.0.0.1:80/ 2>/dev/null | grep -q "html"; then
      echo -e "\033[38;5;120m[SAUDÁVEL / OPERACIONAL]\033[0m"
    else
      echo -e "\033[38;5;203m[FALHA / NÃO RESPONDEU]\033[0m"
    fi

    if [ -n "${FRONTEND_DOMAIN}" ]; then
      echo -n "• HTTPS Frontend (https://${FRONTEND_DOMAIN}): "
      FE_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" -m 5 "https://${FRONTEND_DOMAIN}" || echo "000")
      if [[ "$FE_CODE" =~ ^(200|301|302)$ ]]; then
        echo -e "\033[38;5;120m[HTTP ${FE_CODE} - CERTIFICADO ATIVO]\033[0m"
      else
        echo -e "\033[38;5;221m[STATUS ${FE_CODE} - AGUARDANDO PROPAGAÇÃO/SSL]\033[0m"
      fi
    fi

    if [ -n "${BACKEND_DOMAIN}" ]; then
      echo -n "• HTTPS Backend (https://${BACKEND_DOMAIN}/health): "
      BE_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" -m 5 "https://${BACKEND_DOMAIN}/health" || echo "000")
      if [[ "$BE_CODE" =~ ^(200|301|302)$ ]]; then
        echo -e "\033[38;5;120m[HTTP ${BE_CODE} - CERTIFICADO ATIVO]\033[0m"
      else
        echo -e "\033[38;5;221m[STATUS ${BE_CODE} - AGUARDANDO PROPAGAÇÃO/SSL]\033[0m"
      fi
    fi
    echo "=================================================================="
    ;;
  backup)
    echo "Executando rotina de backup..."
    "$APP_DIR/backup.sh"
    echo -e "\nBackups locais em $APP_DIR/backups:"
    ls -lh "$APP_DIR/backups"/*.sql.gz 2>/dev/null || echo "Nenhum arquivo encontrado."
    ;;
  restore)
    if [ -z "${2:-}" ]; then
      echo "Uso: tiktickets restore <caminho_do_arquivo.sql.gz>"
      echo -e "\nBackups disponíveis:"
      ls -lh "$APP_DIR/backups"/*.sql.gz 2>/dev/null || echo "Nenhum arquivo disponível."
      exit 1
    fi
    RESTORE_FILE="$2"
    if [ ! -f "$RESTORE_FILE" ]; then
      echo "[ERRO] Arquivo de backup não encontrado: $RESTORE_FILE"
      exit 1
    fi

    echo "Banco de Dados Alvo: '${POSTGRES_DB}' (Usuário: '${POSTGRES_USER}')"
    read -p "ATENÇÃO: A restauração substituirá todos os dados do banco atual! Confirmar? (digite 'SIM'): " CONFIRM
    if [ "$CONFIRM" != "SIM" ]; then
      echo "Restauração cancelada pelo usuário."
      exit 0
    fi

    # Pre-backup preventivo automático
    PRE_RESTORE_BACKUP="${APP_DIR}/backups/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "Gerando backup preventivo pré-restauração em ${PRE_RESTORE_BACKUP}..."
    docker exec tiktickets-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$PRE_RESTORE_BACKUP"
    chmod 600 "$PRE_RESTORE_BACKUP"

    # Parar backend
    echo "Parando backend temporariamente para desconectar sessões..."
    $COMPOSE_CMD stop backend

    # Recriar banco limpo
    echo "Recriando banco de dados '${POSTGRES_DB}' de forma limpa..."
    docker exec -i tiktickets-postgres psql -U "$POSTGRES_USER" -d postgres -c \
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
    docker exec -i tiktickets-postgres psql -U "$POSTGRES_USER" -d postgres -c \
      "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\";"
    docker exec -i tiktickets-postgres psql -U "$POSTGRES_USER" -d postgres -c \
      "CREATE DATABASE \"${POSTGRES_DB}\" OWNER \"${POSTGRES_USER}\";"

    # Injetar dump
    echo "Restaurando dados a partir de $RESTORE_FILE..."
    gunzip -c "$RESTORE_FILE" | docker exec -i tiktickets-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

    # Reiniciar backend e validar
    echo "Iniciando backend e validando aplicação..."
    $COMPOSE_CMD start backend
    sleep 5
    if docker exec tiktickets-backend wget -q -O - http://127.0.0.1:3000/ready 2>/dev/null | grep -q "ready"; then
      echo -e "\033[38;5;120m✔ Restauração concluída com sucesso! Banco íntegro e aplicação operacional.\033[0m"
    else
      echo -e "\033[38;5;221m⚠ Restauração finalizada. Aguardando estabilização. Execute 'tiktickets health'.\033[0m"
    fi
    ;;
  update)
    echo "=================================================================="
    echo "ℹ ATENÇÃO: /opt/tiktickets é um diretório de deploy imutável."
    echo "  Modificações manuais no código são substituídas pelo repositório."
    echo "  Suas configurações (.env) e dados do banco permanecem 100% seguros."
    echo "=================================================================="
    
    cd "$APP_DIR"
    PREV_COMMIT=$(git rev-parse HEAD)
    echo "Versão atual instalada: ${PREV_COMMIT:0:7}"

    echo "Verificando atualizações no GitHub..."
    git fetch origin state
    NEW_COMMIT=$(git rev-parse origin/state)

    if [ "$PREV_COMMIT" = "$NEW_COMMIT" ]; then
      echo "O sistema já está na versão mais recente disponível (${NEW_COMMIT:0:7})."
      exit 0
    fi

    echo "Atualizando código para o commit ${NEW_COMMIT:0:7}..."
    git checkout state
    git reset --hard origin/state

    echo "Recompilando imagens e subindo contêineres..."
    DEPLOY_FAILED=false
    if ! $COMPOSE_CMD up -d --build; then
      DEPLOY_FAILED=true
    else
      echo "Aguardando estabilização para verificação de saúde..."
      sleep 10
      HEALTH_OK=false
      for i in {1..10}; do
        if docker exec tiktickets-backend wget -q -O - http://127.0.0.1:3000/ready 2>/dev/null | grep -q "ready"; then
          HEALTH_OK=true
          break
        fi
        sleep 2
      done
      if [ "$HEALTH_OK" = false ]; then
        DEPLOY_FAILED=true
      fi
    fi

    # Rollback Automático
    if [ "$DEPLOY_FAILED" = true ]; then
      echo -e "\n\033[38;5;203m❌ ATENÇÃO: O deploy da versão ${NEW_COMMIT:0:7} falhou na validação de integridade!\033[0m"
      echo -e "\033[38;5;221m↩ Iniciando ROLLBACK AUTOMÁTICO para a versão anterior estável (${PREV_COMMIT:0:7})...\033[0m"
      git reset --hard "$PREV_COMMIT"
      $COMPOSE_CMD up -d --build
      sleep 5
      echo -e "\033[38;5;120m✔ Rollback concluído com sucesso! Sistema restaurado para a versão estável ${PREV_COMMIT:0:7}.\033[0m"
      exit 1
    fi

    echo -e "\033[38;5;120m✔ Atualização para a versão ${NEW_COMMIT:0:7} concluída com sucesso e validada!\033[0m"
    ;;
  credentials)
    cat /root/tiktickets-credentials.txt
    ;;
  *)
    echo "TikTickets-zing CLI v3.0 - Comandos disponíveis:"
    echo "  tiktickets status               - Exibe status dos contêineres"
    echo "  tiktickets health               - Executa diagnóstico completo (Liveness, Readiness, SSL)"
    echo "  tiktickets restart              - Reinicia a aplicação inteira"
    echo "  tiktickets stop                 - Para os contêineres"
    echo "  tiktickets start                - Inicia os contêineres"
    echo "  tiktickets logs [serviço]       - Exibe logs em tempo real (ex: tiktickets logs backend)"
    echo "  tiktickets backup               - Dispara rotina de backup (local + offsite)"
    echo "  tiktickets restore <arquivo>    - Restauração segura com pre-backup e recriação limpa"
    echo "  tiktickets update               - Atualização com teste de integridade e Rollback Automático"
    echo "  tiktickets credentials          - Exibe as credenciais de acesso salvas"
    ;;
esac
EOF
chmod +x /usr/local/bin/tiktickets

# ------------------------------------------------------------------------------
# 16. Health Check Real e Diagnóstico Pós-Deploy
# ------------------------------------------------------------------------------
print_step 8 9 "Diagnóstico Ativo de Saúde e Integridade da Stack"
ui_info "Aguardando estabilização dos serviços (10 segundos)..."
sleep 10

# 1. PostgreSQL
check_postgres() {
  for i in {1..15}; do
    if docker exec tiktickets-postgres pg_isready -U "${DB_USER}" -d "${DB_NAME}" &>/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}
if run_spinner "Verificando banco de dados PostgreSQL 17 (Rede Isolada)" check_postgres; then
  :
else
  ui_warn "Últimos logs do PostgreSQL:"
  docker logs --tail 15 tiktickets-postgres 2>/dev/null || true
fi

# 2. Backend Go API (Liveness & Readiness)
check_backend() {
  for i in {1..15}; do
    if docker exec tiktickets-backend wget -q -O - http://127.0.0.1:3000/ready 2>/dev/null | grep -q "ready"; then
      return 0
    fi
    sleep 2
  done
  return 1
}
if run_spinner "Testando Backend Go API (/health e /ready com DB ativo)" check_backend; then
  :
else
  ui_warn "Últimos logs do Backend Go:"
  docker logs --tail 20 tiktickets-backend 2>/dev/null || true
fi

# 3. Frontend Vue 3
check_frontend() {
  for i in {1..10}; do
    if docker exec tiktickets-frontend wget -q -O - http://127.0.0.1:80/ 2>/dev/null | grep -q "html"; then
      return 0
    fi
    sleep 2
  done
  return 1
}
run_spinner "Testando Frontend SPA (Nginx na porta 80)" check_frontend || true

# 4. Conectividade HTTPS Externa
check_https() {
  sleep 2
  local code
  code=$(curl -k -s -o /dev/null -w "%{http_code}" -m 6 "https://${FRONTEND_DOMAIN}" || echo "000")
  if [[ "$code" =~ ^(200|301|302)$ ]]; then
    return 0
  fi
  return 1
}
if run_spinner "Validando handshake HTTPS e Certificado SSL Let's Encrypt" check_https; then
  ui_success "Rota HTTPS pública respondendo com sucesso!"
else
  ui_warn "Handshake HTTPS pendente. Caso tenha configurado o DNS agora, aguarde a propagação."
  if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then
    ui_info "Coolify: Conclua o assistente inicial em http://${SERVER_IP}:8000 para ativação do proxy."
  fi
fi

# ------------------------------------------------------------------------------
# 17. Salvar Arquivo de Credenciais
# ------------------------------------------------------------------------------
print_step 9 9 "Registro e Finalização da Instalação"
CREDENTIALS_FILE="/root/tiktickets-credentials.txt"
cat <<EOF > "$CREDENTIALS_FILE"
================================================================================
                    TIKTICKETS-ZING - CREDENCIAIS DE PRODUÇÃO
================================================================================
Data de Configuração:  $(date)
Commit Git Atual:      ${GIT_COMMIT_HASH}
Repositório:           https://github.com/jvkabum/TikTickets-zing (Branch: state)

ENDEREÇOS PÚBLICOS (COM SSL HTTPS AUTOMÁTICO):
• Frontend (Atendimento):  https://${FRONTEND_DOMAIN}
• Backend (API REST/Echo): https://${BACKEND_DOMAIN}
$(if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then echo "• Painel Coolify:          http://${SERVER_IP}:8000"; fi)

$(if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then
cat << 'COOLIFY_NOTE'
IMPORTANTE SOBRE O COOLIFY V4:
O proxy integrado do Coolify assume o roteamento completo das portas 80/443
após você acessar http://IP:8000 pela primeira vez e concluir o assistente
de boas-vindas inicial (onboarding).
COOLIFY_NOTE
fi)

BANCO DE DADOS (PostgreSQL 17.7 Alpine - Rede Interna Isolada):
• Container:           tiktickets-postgres
• Host interno:        postgres (acessível apenas pelo backend)
• Porta:               5432
• Database:            ${DB_NAME}
• Usuário:             ${DB_USER}
• Senha:               ${DB_PASSWORD}

SECRETS JWT:
• JWT_SECRET:          ${JWT_SECRET}
• JWT_REFRESH_SECRET:  ${JWT_REFRESH_SECRET}

POLÍTICA DE ARQUITETURA E DADOS:
• /opt/tiktickets        -> Código de deploy (seguro para 'git reset --hard' em updates)
• /opt/tiktickets/.env   -> Configurações e senhas da stack (chmod 600)
• /root/.config/tiktickets/backup.env -> Credenciais de backup S3/R2 isoladas (chmod 600)
• tiktickets_postgres_data -> Volume Docker com os dados reais do banco
• /opt/tiktickets/backups -> Backups locais diários às 03:00 (retenção de 7 dias)

COMANDOS DO GERENCIADOR CLI:
• Testar saúde geral:   tiktickets health
• Status dos serviços:  tiktickets status
• Logs em tempo real:   tiktickets logs
• Fazer backup agora:   tiktickets backup
• Restaurar backup:     tiktickets restore <arquivo.sql.gz> (com pre-backup e recriação limpa)
• Atualizar versão:     tiktickets update (com Rollback Automático em caso de falha)
• Ver este arquivo:     tiktickets credentials
================================================================================
EOF
chmod 600 "$CREDENTIALS_FILE"
chown root:root "$CREDENTIALS_FILE"
ui_success "Credenciais salvas com segurança em: ${YELLOW}${CREDENTIALS_FILE}${RESET}"

# ------------------------------------------------------------------------------
# 18. Card Final de Conclusão (Dashboard Estilizado)
# ------------------------------------------------------------------------------
echo ""
echo -e "  ${GREEN}╭─ Implantação Concluída com Sucesso ─────────────────────────╮${RESET}"
printf "  ${GREEN}│${RESET}  ${BOLD}%-58s${RESET} ${GREEN}│${RESET}\n" "🎉 TIKTICKETS-ZING ESTÁ OPERACIONAL!"
echo -e "  ${GREEN}├─────────────────────────────────────────────────────────────┤${RESET}"
printf "  ${GREEN}│${RESET}  ${DIM}Frontend Web     :${RESET} ${CYAN}%-40s${RESET} ${GREEN}│${RESET}\n" "https://${FRONTEND_DOMAIN}"
printf "  ${GREEN}│${RESET}  ${DIM}Backend API      :${RESET} ${CYAN}%-40s${RESET} ${GREEN}│${RESET}\n" "https://${BACKEND_DOMAIN}"
if [[ "$INSTALL_COOLIFY_PANEL" =~ ^[Ss]$ ]]; then
printf "  ${GREEN}│${RESET}  ${DIM}Painel Coolify   :${RESET} ${YELLOW}%-40s${RESET} ${GREEN}│${RESET}\n" "http://${SERVER_IP}:8000"
fi
printf "  ${GREEN}│${RESET}  ${DIM}Banco PostgreSQL :${RESET} %-40s ${GREEN}│${RESET}\n" "17.7 Alpine (Rede Isolada)"
printf "  ${GREEN}│${RESET}  ${DIM}Backup Local     :${RESET} %-40s ${GREEN}│${RESET}\n" "Diário às 03:00 (Retenção 7d)"
printf "  ${GREEN}│${RESET}  ${DIM}Versão Ativa     :${RESET} %-40s ${GREEN}│${RESET}\n" "Commit ${GIT_COMMIT_HASH} (state)"
echo -e "  ${GREEN}├─────────────────────────────────────────────────────────────┤${RESET}"
printf "  ${GREEN}│${RESET}  ${DIM}Credenciais      :${RESET} %-40s ${GREEN}│${RESET}\n" "${CREDENTIALS_FILE}"
printf "  ${GREEN}│${RESET}  ${DIM}Gerenciador CLI  :${RESET} ${WHITE}${BOLD}%-40s${RESET} ${GREEN}│${RESET}\n" "tiktickets {status|health|...}"
echo -e "  ${GREEN}╰─────────────────────────────────────────────────────────────╯${RESET}"
echo ""
