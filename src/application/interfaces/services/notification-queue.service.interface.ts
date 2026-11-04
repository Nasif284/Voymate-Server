import { NotificationType } from '../../../domain/enums/notification.constants';

export interface EnqueuePushJobDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export interface INotificationQueueService {
  enqueuePush(job: EnqueuePushJobDTO): Promise<void>;
}
