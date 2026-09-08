package fastreplies

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, reply *FastReply) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*FastReply, error)
	List(ctx context.Context, tenantID uint) ([]FastReply, error)
	Update(ctx context.Context, reply *FastReply) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type fastReplyRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &fastReplyRepository{db: db}
}

func (r *fastReplyRepository) Create(ctx context.Context, reply *FastReply) error {
	return r.db.WithContext(ctx).Create(reply).Error
}

func (r *fastReplyRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*FastReply, error) {
	var reply FastReply
	if err := r.db.WithContext(ctx).Where("id = ? AND (\"tenantId\" = ? OR tenant_id = ?)", id, tenantID, tenantID).First(&reply).Error; err != nil {
		return nil, err
	}
	return &reply, nil
}

func (r *fastReplyRepository) List(ctx context.Context, tenantID uint) ([]FastReply, error) {
	var replies []FastReply
	if err := r.db.WithContext(ctx).Where("\"tenantId\" = ? OR tenant_id = ?", tenantID, tenantID).Find(&replies).Error; err != nil {
		return nil, err
	}
	return replies, nil
}

func (r *fastReplyRepository) Update(ctx context.Context, reply *FastReply) error {
	return r.db.WithContext(ctx).Save(reply).Error
}

func (r *fastReplyRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND (\"tenantId\" = ? OR tenant_id = ?)", id, tenantID, tenantID).Delete(&FastReply{}).Error
}
