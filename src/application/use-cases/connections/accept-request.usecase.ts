import { inject, injectable } from 'tsyringe';
import { IAcceptRequest } from '../../interfaces/use-cases/connections/accept-request.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { INotificationDispatcherService } from '../../interfaces/services/notification-dispatcher.service.interface';
import { NotificationType } from '../../../domain/enums/notification.constants';

@injectable()
export class AcceptRequest implements IAcceptRequest {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.INotificationDispatcherService)
    private readonly _notificationDispatcher: INotificationDispatcherService,
  ) {}

  async execute(dto: { requestId: string }): Promise<void> {
    const request = await this._userRepository.updateRequestStatus({
      requestId: dto.requestId,
      status: 'accepted',
    });

    if (request?.senderId) {
      try {
        const accepter = await this._userRepository.findUserById(
          request.receiverId,
        );
        const accepterName = accepter?.fullName || 'Someone';

        await this._notificationDispatcher.dispatch({
          userId: request.senderId,
          type: NotificationType.CONNECTION_ACCEPTED,
          title: 'Connection Accepted',
          body: `${accepterName} accepted your connection request!`,
          data: {
            accepterId: request.receiverId,
            type: 'CONNECTION_ACCEPTED',
          },
        });
      } catch (err) {
        console.error('[AcceptRequest] Failed to dispatch notification:', err);
      }
    }
  }
}
