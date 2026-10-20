import { inject, injectable } from 'tsyringe';
import { ILeaveCallUseCase } from '../../interfaces/use-cases/calls/leave-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';

@injectable()
export class LeaveCallUseCase implements ILeaveCallUseCase {
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

    if (call.status === 'ENDED' || call.status === 'CANCELLED') {
      return this.buildCallDTO(call);
    }

    // Verify user is actually in this call
    const isParticipant =
      call.callerId === userId || call.recipientId === userId;
    if (!isParticipant) {
      throw new Error('You are not a participant of this call.');
    }

    // In a 1-on-1 direct call: when either person leaves, the call is ENDED
    await this.callRepository.updateCallEnded(callId);
    await this.callRepository.updateParticipantStatus(callId, userId, 'LEFT');

    // Notify the other user
    const otherUserId =
      call.callerId === userId ? call.recipientId : call.callerId;
    if (otherUserId) {
      this.notificationService.notifyCallEnded(callId, [otherUserId]);
    }

    const updatedCall = await this.callRepository.findById(callId);
    return this.buildCallDTO(updatedCall!);
  }

  private async buildCallDTO(
    call: Awaited<ReturnType<ICallRepository['findById']>>,
  ): Promise<CallDTO> {
    const participants = await this.callRepository.getParticipants(call!.id);

    return {
      id: call!.id,
      scope: call!.scope,
      mediaType: call!.mediaType,
      status: call!.status,
      callerId: call!.callerId,
      recipientId: call!.recipientId,
      startedAt: call!.startedAt,
      endedAt: call!.endedAt,
      createdAt: call!.createdAt,
      participants: participants.map((p) => ({
        id: p.id,
        userId: p.userId,
        status: p.status,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
      })),
    };
  }
}
