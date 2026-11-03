import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  INotificationRepository,
  NotificationPaginationResult,
} from '../../interfaces/repositories/notification.repository.interface';

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

@injectable()
export class GetNotificationsUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(
    userId: string,
    query: GetNotificationsQuery,
  ): Promise<NotificationPaginationResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const unreadOnly = !!query.unreadOnly;

    return this.notificationRepo.findByUserId(userId, {
      page,
      limit,
      unreadOnly,
    });
  }
}
