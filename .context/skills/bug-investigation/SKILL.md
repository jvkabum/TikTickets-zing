# Habilidade: Investigação de Bugs (Bug Investigation)

Este guia define o fluxo sistemático para identificar, isolar e resolver falhas técnicas no ecossistema TikTickets.

## Fluxo de Depuração (Debugging Workflow)
1. **Triagem de Logs**:
   - Backend: Monitorar o terminal do `ts-node-dev` para erros de stack trace.
   - Frontend: Verificar o console do navegador e a aba 'Network' para erros de API (4xx, 5xx).
2. **Isolamento de Componente**:
   - O erro ocorre no `wbot.ts`? (Problema de integração WhatsApp/Puppeteer).
   - O erro ocorre em um `Service`? (Problema de lógica de negócio ou banco de dados).
   - O erro é visual? (Problema nos componentes Vue/Quasar).
3. **Instrumentação Temporária**:
   - Use `performance.now()` para medir tempos de execução em métodos de conexão.
   - Use `console.log(JSON.stringify(data, null, 2))` para inspecionar objetos complexos do WhatsApp.

## Padrões Comuns e Soluções
| Problema | Causa Provável | Solução Recomendada |
| :--- | :--- | :--- |
| **EBUSY / Permissão** | Chromium ainda segurando arquivos | Adicionar delay de 500ms + lógica de retentativa no `SessionCleanupService`. |
| **QR Code não gera** | Processos órfãos do Chromium | Executar `killSessionChromiumProcesses` antes de iniciar nova sessão. |
| **Socket Timeout** | Sobrecarga de eventos | Revisar o número de listeners e usar `polling` em vez de hooks pesados. |
| **wid undefined** | Acesso precoce ao objeto `info` | Adicionar verificações de nulidade (`info?.wid`) antes de operações de conexão. |

## Convenções de Tratamento de Erro
- Sempre use blocos `try/catch` em operações assíncronas que envolvem I/O (Filesystem, API, Puppeteer).
- Capture o erro e registre logs detalhados antes de lançar para a camada superior.
- No frontend, forneça feedback visual claro ao usuário via `Notify` do Quasar.

## Passos de Verificação
- Após a correção, reinicie o backend e valide se a sessão do WhatsApp estabiliza em menos de 10 segundos.
- Certifique-se de que a pasta `.wwebjs_auth` não foi deletada indevidamente no boot (Persistência).
