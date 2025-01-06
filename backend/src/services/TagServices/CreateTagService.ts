import Tag from "../../models/Tag";

interface Request {
  tag: string;
  color: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
  autoTag: string; // Adicionando o campo autoTag
}

const CreateTagService = async ({
  tag,
  color,
  isActive,
  userId,
  tenantId,
  autoTag // Adicionando o campo autoTag
}: Request): Promise<Tag> => {
  const tagData = await Tag.create({
    tag,
    color,
    isActive,
    userId,
    tenantId,
    autoTag // Incluindo o campo autoTag na criação
  });

  return tagData;
};

export default CreateTagService;
