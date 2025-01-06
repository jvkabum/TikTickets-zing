// Configuração padrão de horário comercial
// Define os horários de funcionamento para cada dia da semana
// type: 'O' = Open (Aberto), 'C' = Closed (Fechado)
// hr1/hr2 = Período da manhã, hr3/hr4 = Período da tarde
export const BusinessHours = [
  {
    day: 0, // Domingo
    label: "Domingo", // Nome do dia
    type: "C", // Status: Fechado
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 1, // Segunda-Feira
    label: "Segunda-Feira", // Nome do dia
    type: "O", // Status: Aberto
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 2, // Terça-Feira
    label: "Terça-Feira", // Nome do dia
    type: "O", // Status: Aberto
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 3, // Quarta-Feira
    label: "Quarta-Feira", // Nome do dia
    type: "O", // Status: Aberto
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 4, // Quinta-Feira
    label: "Quinta-Feira", // Nome do dia
    type: "O", // Status: Aberto
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 5, // Sexta-Feira
    label: "Sexta-Feira", // Nome do dia
    type: "O", // Status: Aberto
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  },
  {
    day: 6, // Sábado
    label: "Sábado", // Nome do dia
    type: "C", // Status: Fechado
    hr1: "08:00", // Hora de abertura da manhã
    hr2: "12:00", // Hora de fechamento da manhã
    hr3: "14:00", // Hora de abertura da tarde
    hr4: "18:00" // Hora de fechamento da tarde
  }
];

// Mensagem automática enviada fora do horário comercial
// Informa ao cliente que o atendimento está fechado e será priorizado posteriormente
export const messageBusinessHours =
  "Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato.";
