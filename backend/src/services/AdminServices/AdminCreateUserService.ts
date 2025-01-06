import * as Yup from "yup";
import AppError from "../../errors/AppError";
import User from "../../models/User";

interface Request {
  email: string;
  password: string;
  name: string;
  tenantId: string | number;
  profile?: string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const AdminCreateUserService = async ({
  email,
  password,
  name,
  tenantId,
  profile = "admin"
}: Request): Promise<Response> => {

  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    tenantId: Yup.number().required(),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "Este e-mail já está cadastrado.",
        async value => {
          const emailExists = await User.findOne({
            where: { email: value! }
          });
          if (emailExists) {
            throw new AppError("ERR_EMAIL_ALREADY_REGISTERED");
          }
          return true;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name, tenantId });
  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create({
    email,
    password,
    name,
    profile,
    tenantId
  });

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile
  };


  return serializedUser;
};

export default AdminCreateUserService;
