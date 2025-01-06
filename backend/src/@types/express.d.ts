declare namespace Express {
  // ====================
  // Interface para Requisições
  // ====================
  export interface Request {
    user: { 
      id: string; // ID do usuário
      profile: string; // Perfil do usuário
      tenantId: string | number; // ID do inquilino
    };
    APIAuth: { 
      apiId: string; // ID da API
      sessionId: number; // ID da sessão
      tenantId: number; // ID do inquilino
    };
  }

  // ====================
  // Interface para Aplicação
  // ====================
  export interface Application {
    rabbit: any; // Instância do RabbitMQ
  }
}
