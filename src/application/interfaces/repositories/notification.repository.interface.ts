import { NotificationEntity } from '../../../domain/entities/notification/notification.entity';
import { NotificationType } from '../../../domain/enums/notification.constants';

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export interface NotificationPaginationResult {
  notifications: NotificationEntity[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface INotificationRepository {
  create(data: CreateNotificationDTO): Promise<NotificationEntity>;
  findByUserId(
    userId: string,
    pagination: { page: number; limit: number; unreadOnly?: boolean },
  ): Promise<NotificationPaginationResult>;
  findById(id: string): Promise<NotificationEntity | null>;
  markAsRead(id: string, userId: string): Promise<boolean>;
  markConversationAsRead(
    userId: string,
    conversationId: string,
  ): Promise<number>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  deleteOldReadNotifications(daysOld?: number): Promise<number>;
}
