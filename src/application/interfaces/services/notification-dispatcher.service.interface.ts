import { NotificationType } from '../../../domain/enums/notification.constants';
import { NotificationEntity } from '../../../domain/entities/notification/notification.entity';

export interface DispatchNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface INotificationDispatcherService {
  dispatch(dto: DispatchNotificationDTO): Promise<NotificationEntity>;
}
