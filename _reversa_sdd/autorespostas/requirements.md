# Auto-respostas (Auto Replies)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia mecanismos rápidos de Auto-Resposta baseados estritamente em Palavras-chave ou Expressões Regulares enviadas por novos clientes. Funciona como um pre-ChatFlow mais simples.

## Responsabilidades
- Criar regras textuais tipo IF-THEN (Se Contato mandar X, Responder Y).
- Disparar envio imediato antes da intervenção humana e rotear o ticket caso a ação determine.

## Regras de Negócio
- A ação da resposta automática pode conter 2 desfechos: Ação 0 (Responder a frase gravada) ou Ação 1 (Forçar encerramento/roteamento) 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/AutoReplyController.ts` | Gestor de Keywords | 🟢 |
