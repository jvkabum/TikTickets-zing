import faker from "faker";
import AppError from "../../../errors/AppError";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ShowUserService from "../../../services/UserServices/ShowUserService";
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
  // Teste de Encontrar um Usuário
  // ====================

  it("should be able to find a user", async () => {
    // Cria um novo usuário
    const newUser = await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    // Tenta mostrar o usuário criado
    const user = await ShowUserService(newUser.id, 1);

    // Verifica se o usuário encontrado possui a propriedade "id"
    expect(user).toHaveProperty("id");
    // Verifica se o usuário encontrado é uma instância do modelo User
    expect(user).toBeInstanceOf(User);
  });

  // ====================
  // Teste de Encontrar um Usuário Inexistente
  // ====================

  it("should not be able to find a non-existing user", async () => {
    // Verifica se a função de mostrar usuário lança um erro ao tentar encontrar um usuário não existente
    expect(ShowUserService(faker.random.number(), 1)).rejects.toBeInstanceOf(
      AppError // Verifica se o erro é uma instância de AppError
    );
  });
});
