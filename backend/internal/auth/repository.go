package auth

import (
	"context"

	"github.com/tiktickets/backend-go/internal/queues"
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
	GetUserQueues(ctx context.Context, userID uint) ([]queues.Queue, error)
	SetUserQueues(ctx context.Context, userID uint, queueIDs []uint) error
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
	user.Queues, _ = r.GetUserQueues(ctx, user.ID)
	return &user, nil
}

func (r *userRepository) GetByID(ctx context.Context, tenantID uint, id uint) (*User, error) {
	var user User
	if err := r.db.WithContext(ctx).Where("tenant_id = ? AND id = ?", tenantID, id).First(&user).Error; err != nil {
		return nil, err
	}
	user.Queues, _ = r.GetUserQueues(ctx, user.ID)
	return &user, nil
}

func (r *userRepository) ListByTenant(ctx context.Context, tenantID uint, limit int, offset int) ([]User, error) {
	var users []User
	query := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID)
	
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	for i := range users {
		users[i].Queues, _ = r.GetUserQueues(ctx, users[i].ID)
	}
	return users, nil
}

func (r *userRepository) CountAdminsByTenant(ctx context.Context, tenantID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&User{}).Where("tenant_id = ? AND profile = ?", tenantID, "admin").Count(&count).Error
	return count, err
}

func (r *userRepository) Create(ctx context.Context, user *User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) Update(ctx context.Context, user *User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uint) error {
	_ = r.db.WithContext(ctx).Where("user_id = ?", id).Delete(&UserQueue{}).Error
	return r.db.WithContext(ctx).Delete(&User{}, id).Error
}

func (r *userRepository) GetUserQueues(ctx context.Context, userID uint) ([]queues.Queue, error) {
	var queueIDs []uint
	if err := r.db.WithContext(ctx).Model(&UserQueue{}).
		Where("user_id = ?", userID).
		Pluck("queue_id", &queueIDs).Error; err != nil {
		return []queues.Queue{}, nil
	}
	if len(queueIDs) == 0 {
		return []queues.Queue{}, nil
	}

	var qList []queues.Queue
	if err := r.db.WithContext(ctx).Where("id IN ?", queueIDs).Find(&qList).Error; err != nil {
		return []queues.Queue{}, err
	}
	for i := range qList {
		qList[i].Queue = qList[i].Name
	}
	return qList, nil
}

func (r *userRepository) SetUserQueues(ctx context.Context, userID uint, queueIDs []uint) error {
	_ = r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&UserQueue{}).Error

	for _, qID := range queueIDs {
		if qID > 0 {
			uq := UserQueue{UserID: userID, QueueID: qID}
			_ = r.db.WithContext(ctx).Create(&uq).Error
		}
	}
	return nil
}
