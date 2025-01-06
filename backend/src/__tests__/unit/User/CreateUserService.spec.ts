import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import { disconnect, truncate } from "../../utils/database";

describe("User", () => {
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
  // Teste de Criação de Novo Usuário
  // ====================

  it("should be able to create a new user", async () => {
    // Cria um novo usuário
    const user = await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    // Verifica se o usuário criado possui a propriedade "id"
    expect(user).toHaveProperty("id");
  });

  // ====================
  // Teste de Criação de Usuário com Email Duplicado
  // ====================

  it("should not be able to create a user with duplicated email", async () => {
    // Cria um usuário com um email específico
    await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: "teste@sameemail.com", // Email do usuário
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    try {
      // Tenta criar um novo usuário com o mesmo email
      await CreateUserService({
        name: faker.name.findName(), // Gera um nome fictício
        email: "teste@sameemail.com", // Email duplicado
        password: faker.internet.password(), // Gera uma senha fictícia
        tenantId: 1 // ID do inquilino
      });
    } catch (err) {
      // Verifica se o erro é uma instância de AppError
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(400); // Verifica se o código de status é 400
    }
  });
});
