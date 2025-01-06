import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  AllowNull
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import Ticket from "./Ticket";
import Queue from "./Queue";
import UsersQueues from "./UsersQueues";
import Tenant from "./Tenant";
import Contact from "./Contact";

// Modelo para usuários do sistema
// Gerencia todos os usuários que podem acessar o sistema
@Table
class User extends Model<User> {
  // ID único do usuário
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome completo do usuário
  @Column
  name: string;

  // Email do usuário (usado para login)
  @Column
  email: string;

  // Status do usuário (ativo, inativo, etc)
  @Column
  status: string;

  // Senha temporária (não armazenada)
  @Column(DataType.VIRTUAL)
  password: string;

  // Hash da senha (armazenada no banco)
  @Column
  passwordHash: string;

  // Versão do token de autenticação
  // Usado para invalidar tokens antigos
  @Default(0)
  @Column
  tokenVersion: number;

  // Perfil do usuário (admin, agent, etc)
  @Default("admin")
  @Column
  profile: string;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Tickets atribuídos ao usuário
  @HasMany(() => Ticket)
  tickets: Ticket[];

  // Filas que o usuário atende
  @BelongsToMany(() => Queue, () => UsersQueues, "userId", "queueId")
  queues: Queue[];

  // Contatos atendidos pelo usuário
  @BelongsToMany(() => Contact, () => Ticket, "userId", "contactId")
  Contact: Contact[];

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Data do último login
  @Column
  lastLogin: Date;

  // Data da última vez online
  @Column
  lastOnline: Date;

  // Data do último logout
  @Column
  lastLogout: Date;

  // Indica se o usuário está online
  @Column
  isOnline: boolean;

  // Configurações personalizadas do usuário
  @Default({})
  @AllowNull
  @Column(DataType.JSON)
  // eslint-disable-next-line @typescript-eslint/ban-types
  configs: object;

  // Hook executado antes de criar/atualizar
  // Gera o hash da senha se uma nova senha foi definida
  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  // Método para verificar se uma senha está correta
  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.getDataValue("passwordHash"));
  };
}

export default User;
