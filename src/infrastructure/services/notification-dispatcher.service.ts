import { inject, injectable } from 'tsyringe';
import { Server } from 'socket.io';
import {
  DispatchNotificationDTO,
  INotificationDispatcherService,
} from '../../application/interfaces/services/notification-dispatcher.service.interface';
import { INotificationRepository } from '../../application/interfaces/repositories/notification.repository.interface';
import { INotificationQueueService } from '../../application/interfaces/services/notification-queue.service.interface';
import { NotificationEntity } from '../../domain/entities/notification/notification.entity';
import { TOKENS } from '../di/tokens';

@injectable()
export class NotificationDispatcherService implements INotificationDispatcherService {
  constructor(
    @inject(TOKENS.INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
    @inject(TOKENS.INotificationQueueService)
    private readonly queueService: INotificationQueueService,
    @inject(TOKENS.Socket)
    private readonly io: Server,
  ) {}

  async dispatch(dto: DispatchNotificationDTO): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data ?? null,
    });

    try {
      this.io.to(`user:${dto.userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      console.error('[NotificationDispatcher] Socket emit error:', err);
    }

    try {
      await this.queueService.enqueuePush({
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        data: dto.data ?? null,
      });
    } catch (err) {
      console.error('[NotificationDispatcher] Queue error:', err);
    }

    return notification;
  }
}
