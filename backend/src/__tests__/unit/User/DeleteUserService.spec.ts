import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import DeleteUserService from "../../../services/UserServices/DeleteUserService";
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
  // Teste de Deleção de Usuário Existente
  // ====================

  it("should delete an existing user", async () => {
    // Cria um novo usuário e obtém seu ID
    const { id } = await CreateUserService({
      name: faker.name.findName(), // Gera um nome fictício
      email: faker.internet.email(), // Gera um email fictício
      password: faker.internet.password(), // Gera uma senha fictícia
      tenantId: 1 // ID do inquilino
    });

    // Verifica se a função de deleção não lança erros
    expect(DeleteUserService(id, 1, 1)).resolves.not.toThrow();
  });

  // ====================
  // Teste de Deleção de Usuário Não Existente
  // ====================

  it("should throw an error if tries to delete a non-existing user", async () => {
    // Verifica se a função de deleção lança um erro ao tentar deletar um usuário não existente
    expect(
      DeleteUserService(faker.random.number(), 1, 1) // Gera um ID aleatório
    ).rejects.toBeInstanceOf(AppError); // Verifica se o erro é uma instância de AppError
  });
});
