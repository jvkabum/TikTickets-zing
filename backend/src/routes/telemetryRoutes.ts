import axios from "axios";
import { Request, Response, Router } from "express";
import { logger } from "../utils/logger";

const telemetryRoutes = Router();

/**
 * Proxy de Telemetria (OpenTelemetry)
 * Recebe traces do frontend e encaminha para o Collector interno.
 * Isso evita expor o Collector publicamente e resolve problemas de CORS e 405.
 */
telemetryRoutes.post("/otel/v1/traces", async (req: Request, res: Response) => {
    try {
        const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT_HTTP || "http://otel-collector:4318/v1/traces";

        // Encaminha o corpo da requisição (exportação OTLP/HTTP JSON) para o coletor
        const response = await axios.post(collectorUrl, req.body, {
            headers: {
                "Content-Type": "application/json",
                // Repassa o tenant_id se estiver presente nos headers para ajudar na filtragem no collector
                "x-tenant-id": req.headers["x-tenant-id"] || ""
            },
            timeout: 5000
        });

        return res.status(response.status).send(response.data);
    } catch (error) {
        // Log silencioso para evitar inundar o console com falhas de telemetria
        // mas envia status 202 para o frontend não ficar tentando re-enviar infinitamente se o collector cair
        logger.debug(`[OTel Proxy] Falha ao encaminhar traces: ${error.message}`);
        return res.status(202).send({ message: "Accepted (Proxy bypass on failure)" });
    }
});

export default telemetryRoutes;
