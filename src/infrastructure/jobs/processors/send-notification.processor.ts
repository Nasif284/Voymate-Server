import { Job } from 'bullmq';
import { container } from 'tsyringe';
import { PushNotificationJobData } from '../queues/notification.queue';
import { TOKENS } from '../../di/tokens';
import { IDeviceTokenRepository } from '../../../application/interfaces/repositories/device-token.repository.interface';
import { IPushNotificationService } from '../../../application/interfaces/services/push-notification.service.interface';

export async function sendNotificationProcessor(
  job: Job<PushNotificationJobData>,
): Promise<void> {
  const { userId, title, body, data } = job.data;

  const deviceTokenRepo = container.resolve<IDeviceTokenRepository>(
    TOKENS.IDeviceTokenRepository,
  );
  const pushNotificationService = container.resolve<IPushNotificationService>(
    TOKENS.IPushNotificationService,
  );

  const activeTokens = await deviceTokenRepo.findActiveByUserId(userId);
  if (!activeTokens || activeTokens.length === 0) {
    return;
  }

  const tokenStrings = activeTokens.map((t) => t.token);

  await pushNotificationService.sendPushNotifications(tokenStrings, {
    title,
    body,
    data: data ?? null,
  });
}
