package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tiktickets/backend-go/internal/tenant"
)

// DemoGuard protege recursos de empresas marcadas como demonstração (isDemo = true).
// Impede que usuários não-super realizem qualquer operação HTTP DELETE na empresa.
func DemoGuard(tenantRepo tenant.Repository) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			profile, _ := c.Get("profile").(string)
			// O Super Admin tem acesso irrestrito para gerenciar todas as empresas
			if profile == "super" {
				return next(c)
			}

			tenantIDVal := c.Get("tenantId")
			if tenantIDVal == nil {
				return next(c)
			}

			tenantID, ok := tenantIDVal.(uint)
			if !ok || tenantID == 0 {
				return next(c)
			}

			t, err := tenantRepo.GetByID(c.Request().Context(), tenantID)
			if err != nil {
				// Se não encontrar o tenant por algum motivo, deixa o fluxo normal tratar
				return next(c)
			}

			if t != nil && t.IsDemo {
				c.Set("isDemo", true)

				// Bloqueia qualquer operação DELETE para empresa demo
				if c.Request().Method == http.MethodDelete {
					return c.JSON(http.StatusForbidden, map[string]string{
						"error":   "ERR_DEMO_MODE_DELETE_NOT_ALLOWED",
						"message": "Operação não permitida: Esta empresa está em modo demonstração e a exclusão de dados está desativada.",
					})
				}
			}

			return next(c)
		}
	}
}
