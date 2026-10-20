import { inject, injectable } from 'tsyringe';

import { ICreateDirectCallUseCase } from '../../interfaces/use-cases/calls/create-direct-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { CreateDirectCallDTO } from '../../dtos/call/request/create-direct-call.dto';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO, CallMediaType } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class CreateDirectCallUseCase implements ICreateDirectCallUseCase {
  constructor(
    @inject(TOKENS.ICallRepository)
    private readonly callRepository: ICallRepository,
    @inject(TOKENS.ICallNotificationService)
    private readonly notificationService: ICallNotificationService,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(callerId: string, data: CreateDirectCallDTO): Promise<CallDTO> {
    if (callerId === data.recipientId) {
      throw new Error('You cannot call yourself.');
    }

    const call = await this.callRepository.createCall({
      scope: 'DIRECT',
      mediaType: data.mediaType as CallMediaType,
      callerId,
      recipientId: data.recipientId,
    });

    await this.callRepository.createParticipants([
      {
        callId: call.id,
        userId: callerId,
        status: 'JOINED',
      },
      {
        callId: call.id,
        userId: data.recipientId,
        status: 'INVITED',
      },
    ]);

    const participants = await this.callRepository.getParticipants(call.id);
    const caller = participants.find((p) => p.userId == callerId);

    this.notificationService.notifyIncomingCall(data.recipientId, {
      callId: call.id,
      callerId,
      callerName: caller!.user!.fullName,
      callerProfileImage: await this._storageService.getSignedUrl(
        caller!.user!.avatarUrl!,
      ),
      mediaType: data.mediaType as CallMediaType,
    });

    return {
      id: call.id,
      scope: call.scope,
      mediaType: call.mediaType,
      status: call.status,
      callerId: call.callerId,
      recipientId: call.recipientId,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      createdAt: call.createdAt,

      participants: participants.map((participant) => ({
        id: participant.id,
        userId: participant.userId,
        status: participant.status,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
      })),
    };
  }
}
