# Habilidade: Documentação Técnica (Documentation)

Diretrizes para manter o ecossistema de conhecimento do TikTickets-zing (diretório `.context`) sempre preciso e útil.

## Princípios de Documentação
- **Atualização Contínua**: Sempre que uma mudança arquitetural ou de ferramenta ocorrer, os documentos em `.context/docs` devem ser atualizados.
- **PT-BR Nativo**: Toda documentação deve ser escrita em Português do Brasil, mantendo termos técnicos universais (ex: API, Deploy, Backend).
- **Sem Placeholders**: Documentos não devem conter seções vazias ou exemplos genéricos.
- **Estrutura Hierárquica**: Use cabeçalhos Markdown adequadamente para facilitar a leitura.

## O Que Documentar
1. **Mudanças de API**: Novos endpoints, mudanças em parâmetros ou respostas.
2. **Novos Componentes Core**: Adição de novos playbooks de agentes ou habilidades.
3. **Padrões de Código**: Descobertas de melhores práticas no Vue 3 ou Node/Sequelize.
4. **Resolução de Bugs Críticos**: Registrar soluções para erros sistêmicos (como o ciclo de vida do WhatsApp).

## Como Atualizar o Contexto
- Use a ferramenta `write_to_file` para criar ou sobrescrever documentos.
- Ao final de uma tarefa grande, faça uma "limpeza" nos documentos afetados.
- Vincule documentos novos ao `README.md` das respectivas pastas.

## Axioma
"A documentação é a memória da inteligência do projeto. Se não está escrito no .context, o agente não sabe que existe."
