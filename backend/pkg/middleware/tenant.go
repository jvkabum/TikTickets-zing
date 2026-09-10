package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// TenantContext assegura que o tenantId foi injetado corretamente (via JWTAuth ou outro meio).
// Regra BR-MIGRAR-001 (Isolamento Multi-Tenant Estrito)
func TenantContext(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Puxa o tenantId injetado pelo JWTAuth
		var tenantID uint
		if v, ok := c.Get("tenantId").(uint); ok && v > 0 {
			tenantID = v
		} else if v, ok := c.Get("tenant_id").(uint); ok && v > 0 {
			tenantID = v
		} else if v, ok := c.Get("tenantID").(uint); ok && v > 0 {
			tenantID = v
		}
		
		if tenantID == 0 {
			// Bloqueio severo: impossível navegar sem pertencer a um tenant válido
			return echo.NewHTTPError(http.StatusForbidden, "Tenant context missing")
		}

		// Garante que ambos estejam setados para os handlers subsequentes
		c.Set("tenantId", tenantID)
		c.Set("tenant_id", tenantID)

		// Apenas valida e segue
		return next(c)
	}
}
