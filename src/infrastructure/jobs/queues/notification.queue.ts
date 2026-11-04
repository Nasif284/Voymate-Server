import { Queue } from 'bullmq';
import { getRedisClient } from '../../../config/redis.config';
import { NotificationType } from '../../../domain/enums/notification.constants';

export interface PushNotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export const notificationQueue = new Queue<PushNotificationJobData>(
  'push-notification-processing',
  {
    connection: getRedisClient(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  },
);
