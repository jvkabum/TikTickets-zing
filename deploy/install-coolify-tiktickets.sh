#!/usr/bin/env bash
# ==============================================================================
# TikTickets-zing - Instalador Automatizado para VPS Ubuntu (Versão 2.0 Produção)
# Repositório Oficial: https://github.com/jvkabum/TikTickets-zing (Branch: state)
# ==============================================================================
# Redireciona para o instalador principal na raiz ou executa diretamente
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_INSTALLER="${SCRIPT_DIR}/../install.sh"

if [ -f "$PARENT_INSTALLER" ]; then
  exec bash "$PARENT_INSTALLER" "$@"
else
  # Execução direta via curl/wget
  exec bash <(curl -fsSL https://raw.githubusercontent.com/jvkabum/TikTickets-zing/state/install.sh) "$@"
fi
