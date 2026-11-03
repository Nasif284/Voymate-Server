import { injectable } from 'tsyringe';
import {
  EnqueuePushJobDTO,
  INotificationQueueService,
} from '../../application/interfaces/services/notification-queue.service.interface';
import { notificationQueue } from '../jobs/queues/notification.queue';

@injectable()
export class BullMQNotificationQueueService implements INotificationQueueService {
  async enqueuePush(job: EnqueuePushJobDTO): Promise<void> {
    await notificationQueue.add('send-push', job);
  }
}
