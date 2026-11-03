import { Worker } from 'bullmq';
import { getRedisClient } from '../../../config/redis.config';
import { sendNotificationProcessor } from '../processors/send-notification.processor';

export const notificationWorker = new Worker(
  'push-notification-processing',
  sendNotificationProcessor,
  {
    connection: getRedisClient(),
  },
);

notificationWorker.on('ready', () => {
  console.log('[Notification Worker] Ready');
});

notificationWorker.on('active', (job) => {
  console.log(`[Notification Worker] Started ${job.id}`);
});

notificationWorker.on('completed', (job) => {
  console.log(`[Notification Worker] Completed ${job.id}`);
});

notificationWorker.on('failed', (job, error) => {
  console.error(`[Notification Worker] Failed ${job?.id}`, error);
});
