declare namespace SocketIO {
  // ====================
  // Interface do Socket
  // ====================

  export interface Socket {
    auth: { 
      id: string | number; // ID do usuário
      profile: string; // Perfil do usuário
      tenantId: string | number; // ID do inquilino
    };
    user: User; // Objeto do usuário associado ao socket
  }
}
