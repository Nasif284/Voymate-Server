import { inject, injectable } from 'tsyringe';
import { ISendConnectionRequest } from '../../interfaces/use-cases/connections/send-connection-request.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { SendConnectionRequestDTO } from '../../dtos/connections/requests/send-connection-request.dto';
import { INotificationDispatcherService } from '../../interfaces/services/notification-dispatcher.service.interface';
import { NotificationType } from '../../../domain/enums/notification.constants';

@injectable()
export class SendConnectionRequest implements ISendConnectionRequest {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.INotificationDispatcherService)
    private readonly _notificationDispatcher: INotificationDispatcherService,
  ) {}

  async execute(dto: SendConnectionRequestDTO): Promise<void> {
    await this._userRepository.sendConnectionRequest(dto);

    try {
      const sender = await this._userRepository.findUserById(dto.senderId);
      const senderName = sender?.fullName || 'Someone';

      await this._notificationDispatcher.dispatch({
        userId: dto.receiverId,
        type: NotificationType.CONNECTION_REQUEST,
        title: 'New Connection Request',
        body: `${senderName} wants to connect with you!`,
        data: {
          senderId: dto.senderId,
          matchId: dto.matchId ?? null,
          type: 'CONNECTION_REQUEST',
        },
      });
    } catch (err) {
      console.error(
        '[SendConnectionRequest] Failed to dispatch notification:',
        err,
      );
    }
  }
}
