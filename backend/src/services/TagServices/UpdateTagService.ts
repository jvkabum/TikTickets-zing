import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface TagData {
  tag: string;
  color: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
  autoTag: string; // Adicionando o campo autoTag
}

interface Request {
  tagData: TagData;
  tagId: string;
}

const UpdateTagService = async ({ tagData, tagId }: Request): Promise<Tag> => {
  const { tag, color, isActive, userId, tenantId, autoTag } = tagData; // Incluindo autoTag

  const tagModel = await Tag.findOne({
    where: { id: tagId, tenantId },
    attributes: ["id", "tag", "color", "isActive", "userId"]
  });

  if (!tagModel) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tagModel.update({
    tag,
    color,
    isActive,
    userId,
    autoTag // Incluindo autoTag na atualização
  });

  await tagModel.reload({
    attributes: ["id", "tag", "color", "isActive", "userId", "autoTag"] // Incluindo autoTag no reload
  });

  return tagModel;
};

export default UpdateTagService;
