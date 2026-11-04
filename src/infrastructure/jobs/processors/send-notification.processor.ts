import { Job } from 'bullmq';
import { container } from 'tsyringe';
import { Server } from 'socket.io';
import { PushNotificationJobData } from '../queues/notification.queue';
import { TOKENS } from '../../di/tokens';
import { INotificationRepository } from '../../../application/interfaces/repositories/notification.repository.interface';
import { IDeviceTokenRepository } from '../../../application/interfaces/repositories/device-token.repository.interface';
import { IPushNotificationService } from '../../../application/interfaces/services/push-notification.service.interface';

export async function sendNotificationProcessor(
  job: Job<PushNotificationJobData>,
): Promise<void> {
  const { userId, type, title, body, data } = job.data;

  const notificationRepo = container.resolve<INotificationRepository>(
    TOKENS.INotificationRepository,
  );
  const deviceTokenRepo = container.resolve<IDeviceTokenRepository>(
    TOKENS.IDeviceTokenRepository,
  );
  const pushNotificationService = container.resolve<IPushNotificationService>(
    TOKENS.IPushNotificationService,
  );

  // 1. Persist (or collapse unread chat) notification in PostgreSQL
  const notification = await notificationRepo.create({
    userId,
    type,
    title,
    body,
    data: data ?? null,
  });

  // 2. Emit real-time Socket.io notification to connected client
  try {
    const io = container.resolve<Server>(TOKENS.Socket);
    io.to(`user:${userId}`).emit('notification:new', notification.toJSON());
  } catch (err) {
    console.error('[Notification Worker] Socket emit error:', err);
  }

  // 3. Deliver Expo Push Notification to active device tokens
  const activeTokens = await deviceTokenRepo.findActiveByUserId(userId);
  if (!activeTokens || activeTokens.length === 0) {
    return;
  }

  const tokenStrings = activeTokens.map((t) => t.token);

  await pushNotificationService.sendPushNotifications(tokenStrings, {
    title: notification.title,
    body: notification.body,
    data: notification.data ?? null,
  });
}
