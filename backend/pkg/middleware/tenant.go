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
		tenantID := c.Get("tenantId")
		
		if tenantID == nil {
			// Bloqueio severo: impossível navegar sem pertencer a um tenant
			return echo.NewHTTPError(http.StatusForbidden, "Tenant context missing")
		}

		// Apenas valida e segue
		return next(c)
	}
}
