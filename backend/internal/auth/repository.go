package auth

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, tenantID uint, id uint) (*User, error)
	ListByTenant(ctx context.Context, tenantID uint, limit int, offset int) ([]User, error)
	CountAdminsByTenant(ctx context.Context, tenantID uint) (int64, error)
	Create(ctx context.Context, user *User) error
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id uint) error
}

type userRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &userRepository{db: db}
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByID(ctx context.Context, tenantID uint, id uint) (*User, error) {
	var user User
	if err := r.db.WithContext(ctx).Where("\"tenantId\" = ? AND id = ?", tenantID, id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) ListByTenant(ctx context.Context, tenantID uint, limit int, offset int) ([]User, error) {
	var users []User
	query := r.db.WithContext(ctx).Where("\"tenantId\" = ?", tenantID)
	
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) CountAdminsByTenant(ctx context.Context, tenantID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&User{}).Where("\"tenantId\" = ? AND profile = ?", tenantID, "admin").Count(&count).Error
	return count, err
}

func (r *userRepository) Create(ctx context.Context, user *User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) Update(ctx context.Context, user *User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&User{}, id).Error
}
