import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { INotificationRepository } from '../../interfaces/repositories/notification.repository.interface';

@injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }
}
