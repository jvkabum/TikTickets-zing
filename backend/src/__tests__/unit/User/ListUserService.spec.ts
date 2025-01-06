import faker from "faker";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ListUsersService from "../../../services/UserServices/ListUsersService";
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
  // Teste de Listagem de Usuários
  // ====================

  it("should be able to list users", async () => {
    // Cria um usuário fictício
    await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    // Lista os usuários
    const response = await ListUsersService({
      pageNumber: 1, // Número da página
      tenantId: 1 // ID do inquilino
    });

    // Verifica se a resposta contém a propriedade "users"
    expect(response).toHaveProperty("users");
    // Verifica se o primeiro usuário listado é uma instância do modelo User
    expect(response.users[0]).toBeInstanceOf(User);
  });
});
