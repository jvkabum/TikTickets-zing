package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/tenant"
)

type mockTenantRepositoryForMiddleware struct {
	tenant *tenant.Tenant
}

func (m *mockTenantRepositoryForMiddleware) GetByID(ctx context.Context, id uint) (*tenant.Tenant, error) {
	return m.tenant, nil
}
func (m *mockTenantRepositoryForMiddleware) Update(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepositoryForMiddleware) Create(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepositoryForMiddleware) List(ctx context.Context) ([]tenant.Tenant, error)   { return nil, nil }
func (m *mockTenantRepositoryForMiddleware) Delete(ctx context.Context, id uint) error          { return nil }
func (m *mockTenantRepositoryForMiddleware) CreateSetting(ctx context.Context, s *settings.Setting) error {
	return nil
}

func TestDemoGuard_BlocksDeleteForDemoTenant(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodDelete, "/contacts/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("tenantId", uint(10))
	c.Set("profile", "admin")

	tenantRepo := &mockTenantRepositoryForMiddleware{
		tenant: &tenant.Tenant{ID: 10, Status: "active", IsDemo: true},
	}

	handlerCalled := false
	handler := func(c echo.Context) error {
		handlerCalled = true
		return c.NoContent(http.StatusOK)
	}

	mw := DemoGuard(tenantRepo)
	err := mw(handler)(c)
	if err != nil {
		t.Fatalf("erro inesperado do middleware: %v", err)
	}

	if rec.Code != http.StatusForbidden {
		t.Fatalf("esperava status 403 Forbidden, recebeu %d", rec.Code)
	}
	if handlerCalled {
		t.Fatalf("o handler não deveria ter sido chamado para requisição DELETE em tenant demo")
	}
}

func TestDemoGuard_AllowsGetForDemoTenant(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/contacts", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("tenantId", uint(10))
	c.Set("profile", "admin")

	tenantRepo := &mockTenantRepositoryForMiddleware{
		tenant: &tenant.Tenant{ID: 10, Status: "active", IsDemo: true},
	}

	handlerCalled := false
	handler := func(c echo.Context) error {
		handlerCalled = true
		return c.NoContent(http.StatusOK)
	}

	mw := DemoGuard(tenantRepo)
	err := mw(handler)(c)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if !handlerCalled {
		t.Fatalf("esperava que GET fosse permitido em tenant demo")
	}
	if isDemo, ok := c.Get("isDemo").(bool); !ok || !isDemo {
		t.Fatalf("esperava que isDemo estivesse marcado como true no contexto")
	}
}

func TestDemoGuard_AllowsDeleteForSuperAdmin(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodDelete, "/admin/tenants/10", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("tenantId", uint(10))
	c.Set("profile", "super") // Perfil Super Admin

	tenantRepo := &mockTenantRepositoryForMiddleware{
		tenant: &tenant.Tenant{ID: 10, Status: "active", IsDemo: true},
	}

	handlerCalled := false
	handler := func(c echo.Context) error {
		handlerCalled = true
		return c.NoContent(http.StatusOK)
	}

	mw := DemoGuard(tenantRepo)
	err := mw(handler)(c)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if !handlerCalled {
		t.Fatalf("esperava que Super Admin pudesse executar DELETE mesmo em tenant demo")
	}
}
