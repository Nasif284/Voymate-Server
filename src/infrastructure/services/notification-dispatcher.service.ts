import { inject, injectable } from 'tsyringe';
import {
  DispatchNotificationDTO,
  INotificationDispatcherService,
} from '../../application/interfaces/services/notification-dispatcher.service.interface';
import { INotificationQueueService } from '../../application/interfaces/services/notification-queue.service.interface';
import { TOKENS } from '../di/tokens';

@injectable()
export class NotificationDispatcherService implements INotificationDispatcherService {
  constructor(
    @inject(TOKENS.INotificationQueueService)
    private readonly queueService: INotificationQueueService,
  ) {}

  async dispatch(dto: DispatchNotificationDTO): Promise<void> {
    await this.queueService.enqueuePush({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data ?? null,
    });
  }
}
