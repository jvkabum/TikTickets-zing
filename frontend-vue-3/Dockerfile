# ================================
# Estágio de build
# ================================
FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Variáveis de ambiente para o build
ARG VUE_URL_API
ARG VUE_FACEBOOK_APP_ID

ENV VUE_URL_API=${VUE_URL_API}
ENV VUE_FACEBOOK_APP_ID=${VUE_FACEBOOK_APP_ID}

# Build para SPA (Single Page Application)
RUN npm run build:spa


# ================================
# Estágio de produção
# ================================
FROM nginx:stable-alpine as production-stage

# Copia os arquivos compilados
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# Configuração do Nginx com proteção cirúrgica (Sem Rate Limit por IP)
RUN printf "# Configurações de Real IP (para ler o IP verdadeiro atrás do Traefik)\n\
    set_real_ip_from  10.0.0.0/8;\n\
    set_real_ip_from  172.16.0.0/12;\n\
    set_real_ip_from  192.168.0.0/16;\n\
    real_ip_header    X-Forwarded-For;\n\
    real_ip_recursive on;\n\
    \n\
    server {\n\
    listen 80;\n\
    server_name localhost;\n\
    \n\
    # ==============================\n\
    # BAN LIST (IPs bloqueados na porta de entrada)\n\
    # ==============================\n\
    deny 168.138.151.75;\n\
    \n\
    # ==============================\n\
    # Bloqueio de robôs de ataque conhecidos\n\
    # ==============================\n\
    if (\$http_user_agent ~* \"ApacheBench|ab|h2load\") {\n\
    return 444; # Código 444 fecha a conexão na hora\n\
    }\n\
    \n\
    # ==============================\n\
    # Timeouts leves\n\
    # ==============================\n\
    client_body_timeout 30s;\n\
    client_header_timeout 30s;\n\
    keepalive_timeout 65s;\n\
    send_timeout 30s;\n\
    \n\
    location / {\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    try_files \$uri \$uri/ /index.html;\n\
    }\n\
    \n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
    root /usr/share/nginx/html;\n\
    }\n\
    }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
