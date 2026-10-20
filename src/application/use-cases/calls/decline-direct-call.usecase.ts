import { inject, injectable } from 'tsyringe';

import { IDeclineDirectCallUseCase } from '../../interfaces/use-cases/calls/decline-direct-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';

@injectable()
export class DeclineDirectCallUseCase implements IDeclineDirectCallUseCase {
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

    if (call.scope !== 'DIRECT') {
      throw new Error('This operation is only available for direct calls.');
    }

    if (call.status !== 'RINGING') {
      throw new Error('This call is no longer ringing.');
    }

    if (call.recipientId !== userId) {
      throw new Error('Only the recipient can decline this call.');
    }

    const participant = await this.callRepository.findParticipant(
      callId,
      userId,
    );

    if (!participant) {
      throw new Error('You are not a participant of this call.');
    }

    if (participant.status !== 'INVITED') {
      throw new Error('This call cannot be declined.');
    }

    await this.callRepository.updateParticipantStatus(
      callId,
      userId,
      'DECLINED',
    );

    await this.callRepository.updateCallStatus(callId, 'CANCELLED');

    const updatedCall = await this.callRepository.findById(callId);

    if (!updatedCall) {
      throw new Error('Failed to retrieve updated call.');
    }

    this.notificationService.notifyCallDeclined(callId, userId, call.callerId);

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
