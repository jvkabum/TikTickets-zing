import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import UpdateUserService from "../../../services/UserServices/UpdateUserService";
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
  // Teste de Atualização de Usuário
  // ====================

  it("should be able to update a user", async () => {
    // Cria um novo usuário
    const newUser = await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    // Atualiza os dados do usuário
    const updatedUser = await UpdateUserService({
      userId: newUser.id, // ID do usuário a ser atualizado
      userData: {
        name: "New name", // Novo nome do usuário
        email: "newmail@email.com" // Novo email do usuário
      },
      tenantId: 1 // ID do inquilino
    });

    // Verifica se o usuário atualizado possui o novo nome
    expect(updatedUser).toHaveProperty("name", "New name");
    // Verifica se o usuário atualizado possui o novo email
    expect(updatedUser).toHaveProperty("email", "newmail@email.com");
  });

  // ====================
  // Teste de Atualização de Usuário Inexistente
  // ====================

  it("should not be able to update a non-existing user", async () => {
    const userId = faker.random.number(); // Gera um ID aleatório para um usuário inexistente
    const userData = {
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email() // Gera um email fictício
    };

    // Verifica se a função de atualização lança um erro ao tentar atualizar um usuário não existente
    expect(
      UpdateUserService({ userId, userData, tenantId: 1 }) // Tenta atualizar o usuário
    ).rejects.toBeInstanceOf(AppError); // Verifica se o erro é uma instância de AppError
  });

  // ====================
  // Teste de Atualização de Usuário com Dados Inválidos
  // ====================

  it("should not be able to update a user with invalid data", async () => {
    // Cria um novo usuário
    const newUser = await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    const userId = newUser.id; // Obtém o ID do usuário criado
    const userData = {
      name: faker.name.findName(), // Gera um nome fictício
      email: "test.worgn.email" // Email inválido
    };

    // Verifica se a função de atualização lança um erro ao tentar atualizar com dados inválidos
    expect(
      UpdateUserService({ userId, userData, tenantId: 1 }) // Tenta atualizar o usuário
    ).rejects.toBeInstanceOf(AppError); // Verifica se o erro é uma instância de AppError
  });
});
