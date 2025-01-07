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

/**
 * Função utilitária para garantir que o diretório de upload exista
 * Cria o diretório recursivamente se não existir
 * Importante para evitar erros de upload em ambientes novos
 */
const ensureUploadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando o diretório: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Diretório já existe: ${dir}`);
  }
};

/**
 * Configuração do multer para gerenciamento de uploads
 * Define onde e como os arquivos serão salvos
 * Gera nomes únicos baseados em timestamp para evitar conflitos
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, "..", "..", "public"); // Salva diretamente em "backend/public"
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

/**
 * Interface que define a estrutura de uma resposta rápida
 * Respostas rápidas são mensagens predefinidas que podem incluir mídia
 */
interface FastReplyData {
  key: string;         // Atalho/comando para acionar a resposta
  message: string;     // Conteúdo da mensagem
  userId: number;      // Usuário que criou
  tenantId: number | string; // Organização
  medias?: string[];   // Arquivos anexados (opcional)
}

/**
 * Cria uma nova resposta rápida
 * 
 * Este endpoint:
 * 1. Processa upload de arquivos de mídia
 * 2. Valida dados da resposta
 * 3. Verifica permissões do usuário
 * 4. Salva a resposta no banco
 */
export const store = [
  upload.array("medias"),
  async (req: Request, res: Response): Promise<Response> => {
    console.log("Arquivos recebidos:", req.files);
    const baseUrl = process.env.BACKEND_URL || "https://backend.tikanais.com.br";
    const { tenantId } = req.user;

    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const mediaFiles = req.files as Express.Multer.File[];
    let mediaPaths: string[] = [];

    if (mediaFiles && mediaFiles.length > 0) {
      mediaPaths = mediaFiles.map(
        file => `${baseUrl}/public/${file.filename}` // Caminho dos arquivos agora em "public"
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

    const schema = Yup.object().shape({
      key: Yup.string().required("Key is required"),
      message: Yup.string().required("Message is required"),
      userId: Yup.number().required(),
      tenantId: Yup.number().required()
    });

    try {
      await schema.validate(newReply);
    } catch (error) {
      throw new AppError(error.message);
    }

    const reply = await CreateFastReplyService(newReply);
    return res.status(200).json(reply);
  }
];

/**
 * Lista todas as respostas rápidas do tenant
 * Retorna respostas ordenadas e com suas mídias associadas
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const queues = await ListFastReplyService({ tenantId });
  return res.status(200).json(queues);
};

/**
 * Atualiza uma resposta rápida existente
 * 
 * Este endpoint permite:
 * 1. Atualizar texto da mensagem
 * 2. Adicionar/remover mídias
 * 3. Modificar o atalho/comando
 * 
 * Mantém mídias existentes se nenhuma nova for enviada
 */
export const update = [
  upload.array("medias"),
  async (req: Request, res: Response): Promise<Response> => {
    console.log("Arquivos recebidos para atualização:", req.files);
    const baseUrl = process.env.BACKEND_URL || "https://backend.tikanais.com.br";
    const { tenantId } = req.user;

    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const mediaFiles = req.files as Express.Multer.File[];
    let mediaPaths: string[] = [];

    if (mediaFiles && mediaFiles.length > 0) {
      mediaPaths = mediaFiles.map(
        file => `${baseUrl}/public/${file.filename}` // Caminho dos arquivos agora em "public"
      );
      console.log("Caminhos dos arquivos atualizados:", mediaPaths);
    }

    const { fastReplyId } = req.params;
    const existingFastReply = await FastReply.findOne({
      where: { id: fastReplyId, tenantId },
      attributes: ["id", "key", "message", "userId", "medias"]
    });

    if (!existingFastReply) {
      throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
    }

    const updatedMedias = mediaPaths.length > 0 ? mediaPaths : existingFastReply.medias;

    const fastReplyData: FastReplyData = {
      key: req.body.key,
      message: req.body.message,
      userId: Number(req.user.id),
      tenantId,
      medias: updatedMedias
    };

    const schema = Yup.object().shape({
      key: Yup.string().required("Key is required"),
      message: Yup.string().required("Message is required"),
      userId: Yup.number().required()
    });

    try {
      await schema.validate(fastReplyData);
    } catch (error) {
      throw new AppError(error.message);
    }

    await existingFastReply.update({
      key: fastReplyData.key,
      message: fastReplyData.message,
      userId: fastReplyData.userId,
      medias: updatedMedias
    });

    await existingFastReply.reload({
      attributes: ["id", "key", "message", "userId", "medias"]
    });

    return res.status(200).json(existingFastReply);
  }
];

/**
 * Remove uma resposta rápida
 * 
 * Este endpoint:
 * 1. Verifica permissões do usuário
 * 2. Remove a resposta do banco
 * 3. Remove arquivos de mídia associados
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { fastReplyId } = req.params;
  await DeleteFastReplyService({ fastReplyId });
  return res.status(200).json({ message: "Fast Reply deleted" });
};

/**
 * Remove apenas as imagens de uma resposta rápida
 * Mantém o texto e outras configurações
 */
export const deleteImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fastReplyId } = req.body;

  try {
    await DeleteFastReplyImageService({ fastReplyId });
    return res.status(200).json({ message: "Imagens excluídas com sucesso!" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};
