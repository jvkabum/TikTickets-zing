import { Router } from "express"
import isAuth from "../middleware/isAuth"
import * as ProtocolController from "../controllers/ProtocolController"

const protocolRoutes = Router()

protocolRoutes.get("/ticket/:ticketId", isAuth, ProtocolController.index)
protocolRoutes.post("/", isAuth, ProtocolController.store)
protocolRoutes.put("/:protocolNumber/close", isAuth, ProtocolController.close)

export default protocolRoutes;
