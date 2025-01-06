declare namespace NodeJS {
  // ====================
  // Interface Global
  // ====================

  interface Global {
    _loopDb: any; // Variável global para armazenar a conexão com o banco de dados
    rabbitWhatsapp: any; // Variável global para armazenar a instância do RabbitMQ para WhatsApp
  }
}
