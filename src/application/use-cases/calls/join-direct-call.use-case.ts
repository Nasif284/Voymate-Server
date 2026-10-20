import { inject, injectable } from 'tsyringe';

import { IJoinDirectCallUseCase } from '../../interfaces/use-cases/calls/join-direct-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';

@injectable()
export class JoinDirectCallUseCase implements IJoinDirectCallUseCase {
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
      throw new Error('This is not a direct call.');
    }

    if (call.status === 'ENDED' || call.status === 'CANCELLED') {
      throw new Error('This call has already ended.');
    }

    const isParticipant =
      call.callerId === userId || call.recipientId === userId;

    if (!isParticipant) {
      throw new Error('You are not a participant of this call.');
    }

    const participant = await this.callRepository.findParticipant(
      callId,
      userId,
    );

    if (!participant) {
      throw new Error('You are not invited to this call.');
    }

    if (participant.status === 'JOINED') {
      return this.buildCallDTO(call);
    }

    await this.callRepository.updateParticipantStatus(callId, userId, 'JOINED');

    if (call.status === 'RINGING') {
      await this.callRepository.updateCallStarted(callId);
    }

    const updatedCall = await this.callRepository.findById(callId);

    if (!updatedCall) {
      throw new Error('Failed to retrieve updated call.');
    }

    const otherUserId =
      call.callerId === userId ? call.recipientId : call.callerId;

    if (otherUserId) {
      this.notificationService.notifyParticipantJoined(
        callId,
        userId,
        otherUserId,
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
