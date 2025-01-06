import { Request, Response } from "express";
import multer from "multer";
import * as Yup from "yup";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";
import CreateFastReplyService from "../services/FastReplyServices/CreateFastReplyService";
import ListFastReplyService from "../services/FastReplyServices/ListFastReplyService";
import DeleteFastReplyService from "../services/FastReplyServices/DeleteFastReplyService";
import DeleteFastReplyImageService from "../services/FastReplyServices/DeleteFastReplyImageService";
import FastReply from "../models/FastReply";
// Função para garantir que o diretório de upload exista
const ensureUploadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando o diretório: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Diretório já existe: ${dir}`);
  }
};

// Configuração do multer para salvar arquivos na pasta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, "..", "..", "public", "uploads");
    ensureUploadDir(uploadDir);
    console.log(`Tentando salvar arquivos em: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    console.log(`Nome do arquivo salvo: ${fileName}`);
    cb(null, fileName);
  }
});
const upload = multer({ storage });
// Interface para os dados da resposta rápida
interface FastReplyData {
  key: string;
  message: string;
  userId: number;
  tenantId: number | string;
  medias?: string[]; // Caminhos dos arquivos no servidor local
}

// Função para armazenar uma nova resposta rápida
export const store = [
  upload.array("medias"), // Middleware multer para lidar com o upload dos arquivos
  async (req: Request, res: Response): Promise<Response> => {
    console.log("Arquivos recebidos:", req.files);
    const baseUrl =
      process.env.BACKEND_URL || "https://backend.tikanais.com.br";
    const { tenantId } = req.user;
    // Verifica se o usuário tem permissão para criar uma resposta rápida
    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }
    const mediaFiles = req.files as Express.Multer.File[];
    let mediaPaths: string[] = [];
    // Verifica se os arquivos foram enviados e salva os caminhos
    if (mediaFiles && mediaFiles.length > 0) {
      mediaPaths = mediaFiles.map(
        file => `${baseUrl}/public/uploads/${file.filename}`
      );
      console.log("Caminhos dos arquivos:", mediaPaths);
    }
    const newReply: FastReplyData = {
      key: req.body.key,
      message: req.body.message,
      userId: Number(req.user.id),
      tenantId,
      medias: mediaPaths
    };
    // Validação com Yup
    const schema = Yup.object().shape({
      key: Yup.string().required("Key is required"),
      message: Yup.string().required("Message is required"),
      userId: Yup.number().required(),
      tenantId: Yup.number().required()
    });
    try {
      // Valida os dados da nova resposta rápida
      await schema.validate(newReply);
    } catch (error) {
      throw new AppError(error.message);
    }
    // Cria a nova resposta rápida
    const reply = await CreateFastReplyService(newReply);
    // Retorna a resposta criada
    return res.status(200).json(reply);
  }
];

// Função para listar as respostas rápidas
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const queues = await ListFastReplyService({ tenantId });
  return res.status(200).json(queues);
};

// Função para atualizar uma resposta rápida existente
export const update = [
  upload.array("medias"), // Middleware multer para lidar com o upload dos arquivos
  async (req: Request, res: Response): Promise<Response> => {
    console.log("Arquivos recebidos para atualização:", req.files);
    const baseUrl =
      process.env.BACKEND_URL || "https://backend.tikanais.com.br";
    const { tenantId } = req.user;
    // Verifica se o usuário tem permissão para atualizar uma resposta rápida
    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }
    const mediaFiles = req.files as Express.Multer.File[];
    let mediaPaths: string[] = [];
    // Se houver novos arquivos de mídia, processá-los
    if (mediaFiles && mediaFiles.length > 0) {
      mediaPaths = mediaFiles.map(
        file => `${baseUrl}/public/uploads/${file.filename}`
      );
      console.log("Caminhos dos arquivos atualizados:", mediaPaths);
    }
    // Buscando a resposta rápida diretamente no banco de dados
    const { fastReplyId } = req.params;
    const existingFastReply = await FastReply.findOne({
      where: { id: fastReplyId, tenantId },
      attributes: ["id", "key", "message", "userId", "medias"] // Incluindo medias
    });
    if (!existingFastReply) {
      throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
    }
    // Se não houver novas mídias enviadas, manter as mídias existentes
    const updatedMedias =
      mediaPaths.length > 0 ? mediaPaths : existingFastReply.medias;
    const fastReplyData: FastReplyData = {
      key: req.body.key,
      message: req.body.message,
      userId: Number(req.user.id),
      tenantId,
      medias: updatedMedias // Utiliza as mídias atuais ou as novas, se houver
    };
    // Validação com Yup
    const schema = Yup.object().shape({
      key: Yup.string().required("Key is required"),
      message: Yup.string().required("Message is required"),
      userId: Yup.number().required()
    });
    try {
      // Valida os dados da resposta rápida a ser atualizada
      await schema.validate(fastReplyData);
    } catch (error) {
      throw new AppError(error.message);
    }
    // Atualizar a resposta rápida no banco de dados
    await existingFastReply.update({
      key: fastReplyData.key,
      message: fastReplyData.message,
      userId: fastReplyData.userId,
      medias: updatedMedias // Atualiza ou mantém as mídias existentes
    });
    // Recarga o modelo com os dados atualizados
    await existingFastReply.reload({
      attributes: ["id", "key", "message", "userId", "medias"] // Incluindo medias
    });
    // Retorna a resposta atualizada
    return res.status(200).json(existingFastReply);
  }
];
// Função para remover uma resposta rápida
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  // Verifica se o usuário tem permissão para remover uma resposta rápida
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { fastReplyId } = req.params;

  // Remove a resposta rápida
  await DeleteFastReplyService({ fastReplyId });
  return res.status(200).json({ message: "Fast Reply deleted" });
};
// Controller para deletar as imagens
export const deleteImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fastReplyId } = req.body;

  try {
    // Chamar o serviço que remove as mídias da resposta rápida, passando os parâmetros corretos
    await DeleteFastReplyImageService({ fastReplyId });
    return res.status(200).json({ message: "Imagens excluídas com sucesso!" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};