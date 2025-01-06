import Asterisk from "asterisk-manager";

// const ami: any = new Asterisk(
//   "5038",
//   "192.168.206.51",
//   "admin",
//   "start123",
//   true
// );

// Cria uma nova instância do Asterisk Manager Interface (AMI) com as credenciais e configurações
const ami: any = new Asterisk(
  "5038", // Porta do AMI
  "192.168.206.50", // Endereço IP do servidor Asterisk
  "admin", // Nome de usuário para autenticação
  "start123", // Senha para autenticação
  true // Conexão segura
);

ami.keepConnected(); // Mantém a conexão ativa com o servidor Asterisk

// ====================
// Eventos e Ações do AMI
// ====================

// Ação para obter o status da fila
// ami.action({ action: "QueueStatus" }, (err: any, res: any) => {
//   console.log("QueueStatus", err, res);
// });

// Ação para obter a lista de agentes
// ami.action({ action: "Agents" }, (err: any, res: any) => {
//   console.log("AgentShow", err, res);
// });

// Evento de quando a chamada entra na fila
// ami.on("queuecallerjoin", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de quando a chamada sai da fila (quando é atendida ou abandonada)
// ami.on("queuecallerleave", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de quando a chamada é abandonada
// ami.on("queuecallerabandon", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de quando o membro da fila (agente) muda de status
// ami.on("queuememberstatus", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de quando a chamada é atendida
// ami.on("agentconnect", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de membros de uma fila (que só aparece quando você dá um queue show na fila)
// ami.on("queuemember", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de parâmetros de uma fila (que só aparece quando você dá um queue show na fila)
// ami.on("queueparams", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// Evento de desligamento da chamada
ami.on("Dial", (evt: any) => {
  console.log(
    `### Emitindo no canal a mensagem de desligamento da chamada: \r\n ${JSON.stringify(
      evt
    )} \r\n \r\n \r\n`
  );
  // io.emit(evt.queue, evt);
});

// Evento de desligamento
ami.on("hangup", (evt: any) => {
  console.log("hangup", evt); // Loga o evento de desligamento
});

// Escuta as respostas de ações
ami.on("response", (evt: any) => {
  console.log("response", evt); // Loga a resposta da ação
});

// Realiza uma chamada
ami.action(
  {
    action: "originate", // Ação para originar uma chamada
    channel: "SIP/4815", // Canal de origem da chamada
    context: "from-internal", // Contexto da chamada
    exten: "0991191708", // Número de destino
    priority: 1, // Prioridade da chamada
    variable: {
      connectedlinenum: "0991191708", // Número da linha conectada
      connectedlinename: "CID:4815" // Nome da linha conectada
    }
  },
  (err: any, res: any) => {
    console.log("action", err, res); // Loga o resultado da ação
  }
);

// Exporta a instância do AMI
export default ami;
