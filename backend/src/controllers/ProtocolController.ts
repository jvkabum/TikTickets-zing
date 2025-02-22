import { Request, Response } from "express"
import Protocol from "../models/Protocol"
import AppError from "../errors/AppError"
import { getIO } from "../libs/socket"
import User from "../models/User"

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params

    if (!ticketId || ticketId === "undefined") {
      throw new AppError("ID do ticket é obrigatório", 400)
    }

    const protocols = await Protocol.findAll({
      where: { ticketId: parseInt(ticketId, 10) },
      order: [["createdAt", "DESC"]]
    })

    console.log("🔍 DEBUG - Protocolos encontrados:", protocols.map(p => ({
      id: p.id,
      protocolNumber: p.protocolNumber,
      userName: p.userName,
      status: p.status,
      createdAt: p.createdAt
    })))

    return res.status(200).json(protocols)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Erro ao buscar protocolos")
  }
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { contactId, tenantId, ticketId, userId } = req.body

    // Validação dos campos obrigatórios
    if (!contactId || !tenantId || !ticketId || !userId) {
      throw new AppError("Todos os campos são obrigatórios", 400)
    }

    // Busca o nome do usuário
    const user = await User.findByPk(userId)
    const userName = user?.name || "sistema"

    const protocol = await Protocol.create({
      protocolNumber: `PROT${Date.now()}`,
      contactId: parseInt(contactId, 10),
      tenantId: parseInt(tenantId, 10),
      ticketId: parseInt(ticketId, 10),
      userId: parseInt(userId, 10),
      userName,
      status: "ABER"
    })

    const io = getIO()
    io.to(ticketId.toString()).emit("protocol", {
      action: "create",
      protocol
    })

    return res.status(200).json(protocol)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Erro ao criar protocolo")
  }
}

export const close = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { protocolNumber } = req.params

    if (!protocolNumber || protocolNumber === "undefined") {
      throw new AppError("Número do protocolo é obrigatório", 400)
    }

    const protocol = await Protocol.findOne({
      where: { protocolNumber, status: "ABER" }
    })

    if (!protocol) {
      throw new AppError("Protocolo não encontrado ou já fechado", 404)
    }

    await protocol.update({ status: "FECH" })

    const io = getIO()
    io.to(protocol.ticketId.toString()).emit("protocol", {
      action: "update",
      protocol
    })

    return res.status(200).json(protocol)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Erro ao fechar protocolo")
  }
}
