import faker from "faker";
import AppError from "../../../errors/AppError";
import AuthUserService from "../../../services/UserServices/AuthUserService";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import { disconnect, truncate } from "../../utils/database";

describe("Auth", () => {
  // ====================
  // Configuração dos Testes
  // ====================

  beforeEach(async () => {
    await truncate(); // Trunca o banco de dados antes de cada teste
  });

  afterEach(async () => {
    await truncate(); // Trunca o banco de dados após cada teste
  });

  afterAll(async () => {
    await disconnect(); // Desconecta do banco de dados após todos os testes
  });

  // ====================
  // Teste de Login com Usuário Existente
  // ====================

  it("should be able to login with an existing user", async () => {
    // Cria um usuário fictício
    await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: "mail@test.com", // Email do usuário
      password: "hardpassword", // Senha do usuário
      tenantId: 1 // ID do inquilino
    });

    // Tenta autenticar o usuário
    const response = await AuthUserService({
      email: "mail@test.com", // Email do usuário
      password: "hardpassword" // Senha do usuário
    });

    // Verifica se a resposta contém a propriedade "token"
    expect(response).toHaveProperty("token");
  });

  // ====================
  // Teste de Login com Email Não Registrado
  // ====================

  it("should not be able to login with not registered email", async () => {
    try {
      // Tenta autenticar com um email não registrado
      await AuthUserService({
        email: faker.internet.email(), // Gera um email fictício
        password: faker.internet.password() // Gera uma senha fictícia
      });
    } catch (err) {
      // Verifica se o erro é uma instância de AppError
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401); // Verifica se o código de status é 401
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS"); // Verifica a mensagem de erro
    }
  });

  // ====================
  // Teste de Login com Senha Incorreta
  // ====================

  it("should not be able to login with incorrect password", async () => {
    // Cria um usuário fictício
    await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: "mail@test.com", // Email do usuário
      password: "hardpassword", // Senha do usuário
      tenantId: 1 // ID do inquilino
    });

    try {
      // Tenta autenticar com a senha incorreta
      await AuthUserService({
        email: "mail@test.com", // Email do usuário
        password: faker.internet.password() // Gera uma senha fictícia
      });
    } catch (err) {
      // Verifica se o erro é uma instância de AppError
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401); // Verifica se o código de status é 401
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS"); // Verifica a mensagem de erro
    }
  });
});
