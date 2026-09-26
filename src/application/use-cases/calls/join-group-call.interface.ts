import { inject, injectable } from 'tsyringe';

import { IJoinGroupCallUseCase } from '../../interfaces/use-cases/calls/join-group-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class JoinGroupCallUseCase implements IJoinGroupCallUseCase {
  constructor(
    @inject(TOKENS.ICallRepository)
    private readonly callRepository: ICallRepository,

    @inject(TOKENS.IGroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,

    @inject(TOKENS.ICallNotificationService)
    private readonly notificationService: ICallNotificationService,

    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(callId: string, userId: string): Promise<CallDTO> {
    const call = await this.callRepository.findById(callId);

    if (!call) {
      throw new Error('Call not found.');
    }

    if (call.scope !== 'TRIP_GROUP') {
      throw new Error('This is not a group call.');
    }

    if (call.status === 'ENDED' || call.status === 'CANCELLED') {
      throw new Error('This call has already ended.');
    }

    if (!call.tripGroupId) {
      throw new Error('Trip group is missing from this call.');
    }

    const membership = await this.groupMemberRepository.findActiveMember(
      call.tripGroupId,
      userId,
    );

    if (!membership) {
      throw new Error('You are not an active member of this trip group.');
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

    const updatedCall = await this.callRepository.findById(callId);

    if (!updatedCall) {
      throw new Error('Failed to retrieve updated call.');
    }

    const participants = await this.callRepository.getParticipants(callId);

    const joinedUserIds = participants
      .filter(
        (participant) =>
          participant.status === 'JOINED' && participant.userId !== userId,
      )
      .map((participant) => participant.userId);
    const avatarUrl = await this._storageService.getSignedUrl(
      participant.user!.avatarUrl!,
    );
    if (joinedUserIds.length > 0) {
      this.notificationService.notifyGroupParticipantJoined(
        callId,
        userId,
        participant.user!.fullName,
        avatarUrl!,
        joinedUserIds,
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
    console.log('participants:', participants);
    return {
      id: call.id,
      scope: call.scope,
      mediaType: call.mediaType,
      status: call.status,

      callerId: call.callerId,
      recipientId: call.recipientId,
      tripGroupId: call.tripGroupId,

      startedAt: call.startedAt,
      endedAt: call.endedAt,
      createdAt: call.createdAt,

      participants: await Promise.all(
        participants.map(async (participant) => ({
          id: participant.id,
          userId: participant.userId,
          status: participant.status,
          joinedAt: participant.joinedAt,
          leftAt: participant.leftAt,
          user: {
            fullName: participant.user!.fullName,
            avatarUrl: await this._storageService.getSignedUrl(
              participant.user!.avatarUrl!,
            ),
          },
        })),
      ),
    };
  }
}
