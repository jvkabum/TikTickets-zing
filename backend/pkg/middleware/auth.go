package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// JWTAuth retorna um middleware Echo que valida o JWT usando o secret fornecido via injeção.
// Nenhum valor está hardcoded — o secret vem do config.Config carregado no main.go.
func JWTAuth(jwtSecret []byte) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenString := ""
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			} else {
				tokenString = c.QueryParam("token")
			}

			if tokenString == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing or invalid token")
			}

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return jwtSecret, nil
			})

			if err != nil || !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
			}

			// Extrai as claims e injeta no contexto para uso nos handlers
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				// Extrai User ID (userId ou user_id)
				var uid uint
				if val, exists := claims["userId"]; exists {
					switch v := val.(type) {
					case float64:
						uid = uint(v)
					case int:
						uid = uint(v)
					}
				} else if val, exists := claims["user_id"]; exists {
					switch v := val.(type) {
					case float64:
						uid = uint(v)
					case int:
						uid = uint(v)
					}
				}
				if uid > 0 {
					c.Set("userID", uid)
					c.Set("userId", uid)
					c.Set("user_id", uid)
				}

				// Extrai Tenant ID (tenantId ou tenant_id)
				var tid uint
				if val, exists := claims["tenantId"]; exists {
					switch v := val.(type) {
					case float64:
						tid = uint(v)
					case int:
						tid = uint(v)
					}
				} else if val, exists := claims["tenant_id"]; exists {
					switch v := val.(type) {
					case float64:
						tid = uint(v)
					case int:
						tid = uint(v)
					}
				}
				if tid > 0 {
					c.Set("tenantId", tid)
					c.Set("tenant_id", tid)
					c.Set("tenantID", tid)
				}

				if profile, ok := claims["profile"].(string); ok {
					c.Set("profile", profile)
				}
				return next(c)
			}

			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token claims")
		}
	}
}
