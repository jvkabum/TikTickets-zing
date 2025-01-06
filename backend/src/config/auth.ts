// Configurações de autenticação da aplicação
// Define as chaves secretas e tempos de expiração dos tokens JWT
export default {
  // Chave secreta para assinatura dos tokens JWT
  // Pode ser definida via variável de ambiente ou usa um valor padrão
  secret: process.env.JWT_SECRET || "mad4srsZIISQ0G1MJPoQIeq3PVf25EaR",
  // Tempo de expiração do token JWT principal
  // Define quanto tempo o token permanece válido (3 dias)
  expiresIn: "3d",

  // Chave secreta para assinatura dos tokens de refresh
  // Usada para gerar novos tokens sem necessidade de login
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || "itI2OQbF3TMy45kIlU7nnhXeIcXugtu9",
  // Tempo de expiração do token de refresh
  // Define por quanto tempo um token pode ser renovado (7 dias)
  refreshExpiresIn: "7d"
};
