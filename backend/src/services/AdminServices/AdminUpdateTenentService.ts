import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface TenantData {
  status?: string;
  name?: string;
  maxUsers?: number;
  maxConnections?: number;
}

interface Request {
  tenantData: TenantData;
  tenantId: string | number;
}

const AdminUpdateTenentService = async ({
  tenantData,
  tenantId
}: Request): Promise<Tenant | undefined> => {
  const tenant = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  const schema = Yup.object().shape({
    status: Yup.string(),
    name: Yup.string().min(2),
    maxUsers: Yup.number().integer().min(0),
    maxConnections: Yup.number().integer().min(0)
  });

  const { status, name, maxUsers, maxConnections } = tenantData;

  try {
    await schema.validate({ status, name, maxUsers, maxConnections });
  } catch (err: any) {
    throw new AppError(err?.message);
  }

  await tenant.update({
    status,
    name,
    maxUsers,
    maxConnections
  });

  return tenant;
};

export default AdminUpdateTenentService;
