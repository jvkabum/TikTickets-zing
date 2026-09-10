package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func TestJWTAuth_ClaimsCompatibility(t *testing.T) {
	jwtSecret := []byte("test-secret-key-1234567890123456")

	tests := []struct {
		name             string
		claims           jwt.MapClaims
		expectedTenantID uint
		expectedUserID   uint
	}{
		{
			name: "Node camelCase claims (tenantId, userId)",
			claims: jwt.MapClaims{
				"userId":   float64(42),
				"tenantId": float64(7),
				"profile":  "admin",
				"exp":      time.Now().Add(time.Hour).Unix(),
			},
			expectedTenantID: 7,
			expectedUserID:   42,
		},
		{
			name: "Go snake_case claims (tenant_id, user_id)",
			claims: jwt.MapClaims{
				"user_id":   float64(88),
				"tenant_id": float64(15),
				"profile":   "user",
				"exp":       time.Now().Add(time.Hour).Unix(),
			},
			expectedTenantID: 15,
			expectedUserID:   88,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, tt.claims)
			tokenStr, err := token.SignedString(jwtSecret)
			if err != nil {
				t.Fatalf("Failed to sign token: %v", err)
			}

			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("Authorization", "Bearer "+tokenStr)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handler := JWTAuth(jwtSecret)(func(c echo.Context) error {
				return c.NoContent(http.StatusOK)
			})

			err = handler(c)
			if err != nil {
				t.Fatalf("JWTAuth failed: %v", err)
			}

			// Verifica se ambos tenantId e tenant_id foram injetados corretamente
			if tid, ok := c.Get("tenantId").(uint); !ok || tid != tt.expectedTenantID {
				t.Errorf("Expected tenantId %d, got %v", tt.expectedTenantID, c.Get("tenantId"))
			}
			if tid, ok := c.Get("tenant_id").(uint); !ok || tid != tt.expectedTenantID {
				t.Errorf("Expected tenant_id %d, got %v", tt.expectedTenantID, c.Get("tenant_id"))
			}

			// Verifica se userID e user_id foram injetados
			if uid, ok := c.Get("userID").(uint); !ok || uid != tt.expectedUserID {
				t.Errorf("Expected userID %d, got %v", tt.expectedUserID, c.Get("userID"))
			}
		})
	}
}

func TestTenantContext_Validation(t *testing.T) {
	e := echo.New()

	t.Run("Valid tenantId passes", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("tenantId", uint(5))

		handler := TenantContext(func(c echo.Context) error {
			return c.NoContent(http.StatusOK)
		})

		err := handler(c)
		if err != nil {
			t.Errorf("Expected success, got err: %v", err)
		}
	})

	t.Run("Valid tenant_id passes and normalizes", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("tenant_id", uint(8))

		handler := TenantContext(func(c echo.Context) error {
			return c.NoContent(http.StatusOK)
		})

		err := handler(c)
		if err != nil {
			t.Errorf("Expected success, got err: %v", err)
		}
		if tid, ok := c.Get("tenantId").(uint); !ok || tid != 8 {
			t.Errorf("Expected normalized tenantId 8, got %v", c.Get("tenantId"))
		}
	})

	t.Run("Missing or zero tenantId blocked with 403", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		handler := TenantContext(func(c echo.Context) error {
			return c.NoContent(http.StatusOK)
		})

		err := handler(c)
		if err == nil {
			t.Error("Expected 403 error for missing tenant context, got nil")
		}
	})
}
