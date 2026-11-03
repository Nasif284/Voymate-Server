import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { INotificationRepository } from '../../interfaces/repositories/notification.repository.interface';

@injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string, notificationId: string): Promise<void> {
    await this.notificationRepo.markAsRead(notificationId, userId);
  }
}
