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
				if userID, ok := claims["userId"].(float64); ok {
					c.Set("userID", uint(userID))
				}
				if tenantID, ok := claims["tenantId"].(float64); ok {
					c.Set("tenantId", uint(tenantID))
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
