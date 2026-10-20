import { inject, injectable } from 'tsyringe';

import { ICancelDirectCallUseCase } from '../../interfaces/use-cases/calls/cancel-direct-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';

@injectable()
export class CancelDirectCallUseCase implements ICancelDirectCallUseCase {
  constructor(
    @inject(TOKENS.ICallRepository)
    private readonly callRepository: ICallRepository,

    @inject(TOKENS.ICallNotificationService)
    private readonly notificationService: ICallNotificationService,
  ) {}

  async execute(callId: string, userId: string): Promise<CallDTO> {
    const call = await this.callRepository.findById(callId);

    if (!call) {
      throw new Error('Call not found.');
    }

    if (call.callerId !== userId) {
      throw new Error('Only the caller can cancel this call.');
    }

    if (call.status === 'ENDED' || call.status === 'CANCELLED') {
      throw new Error('This call has already ended.');
    }

    await this.callRepository.updateCallStatus(callId, 'CANCELLED');

    const updatedCall = await this.callRepository.findById(callId);

    if (!updatedCall) {
      throw new Error('Failed to retrieve updated call.');
    }

    const participants = await this.callRepository.getParticipants(callId);

    const recipientUserIds = participants
      .filter(
        (participant) =>
          participant.userId !== userId && participant.status === 'INVITED',
      )
      .map((participant) => participant.userId);

    if (recipientUserIds.length > 0) {
      this.notificationService.notifyCallCancelled(
        callId,
        userId,
        recipientUserIds,
      );
    }

    return this.buildCallDTO(updatedCall);
  }

  private async buildCallDTO(
    call: Awaited<ReturnType<ICallRepository['findById']>>,
  ): Promise<CallDTO> {
    if (!call) {
      throw new Error('Call not found.');
    }

    const participants = await this.callRepository.getParticipants(call.id);

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
