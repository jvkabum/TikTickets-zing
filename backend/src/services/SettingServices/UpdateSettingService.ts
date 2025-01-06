import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
  tenantId: string | number;
}

const UpdateSettingService = async ({
  key,
  value,
  tenantId
}: Request): Promise<Setting | undefined> => {
  let setting = await Setting.findOne({
    where: { key, tenantId }
  });

  if (!setting) {
    try {
      setting = await Setting.create({key, value, tenantId});
    } catch(err) {
      throw new AppError("ERR_NO_SETTING_FOUND", 404);
    }
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
