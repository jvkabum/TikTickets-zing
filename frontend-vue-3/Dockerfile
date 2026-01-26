# Estágio de build
FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Variáveis de ambiente para o build (devem ser passadas via --build-arg no Coolify)
ARG VUE_URL_API
ARG VUE_FACEBOOK_APP_ID

ENV VUE_URL_API=${VUE_URL_API}
ENV VUE_FACEBOOK_APP_ID=${VUE_FACEBOOK_APP_ID}

# Compila para SPA (Single Page Application)
RUN npm run build:spa

# Estágio de produção
FROM nginx:stable-alpine as production-stage

# Copia os arquivos compilados do estágio anterior
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# Configuração básica do Nginx para SPA (lidar com rotas do Vue Router)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
    root /usr/share/nginx/html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
