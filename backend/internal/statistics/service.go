package statistics

import (
	"context"

	"gorm.io/gorm"
)

type DashboardData struct {
	TotalTickets   int64 `json:"totalTickets"`
	OpenTickets    int64 `json:"openTickets"`
	PendingTickets int64 `json:"pendingTickets"`
	ClosedTickets  int64 `json:"closedTickets"`
}

type StatisticsService struct {
	db *gorm.DB
}

func NewStatisticsService(db *gorm.DB) *StatisticsService {
	return &StatisticsService{db: db}
}

func (s *StatisticsService) GetDashboardData(ctx context.Context, tenantID uint) (*DashboardData, error) {
	var data DashboardData
	db := s.db.WithContext(ctx)

	// Count total tickets
	if err := db.Table("Tickets").Where("\"tenantId\" = ? OR tenant_id = ?", tenantID, tenantID).Count(&data.TotalTickets).Error; err != nil {
		return nil, err
	}
	// Count open
	if err := db.Table("Tickets").Where("(\"tenantId\" = ? OR tenant_id = ?) AND status = ?", tenantID, tenantID, "open").Count(&data.OpenTickets).Error; err != nil {
		return nil, err
	}
	// Count pending
	if err := db.Table("Tickets").Where("(\"tenantId\" = ? OR tenant_id = ?) AND status = ?", tenantID, tenantID, "pending").Count(&data.PendingTickets).Error; err != nil {
		return nil, err
	}
	// Count closed
	if err := db.Table("Tickets").Where("(\"tenantId\" = ? OR tenant_id = ?) AND status = ?", tenantID, tenantID, "closed").Count(&data.ClosedTickets).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
