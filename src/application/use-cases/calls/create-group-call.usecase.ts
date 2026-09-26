import { inject, injectable } from 'tsyringe';
import { CallParticipantStatus, CallScope } from '@prisma/client';

import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICreateGroupCallUseCase } from '../../interfaces/use-cases/calls/create-group-call.interface';
import { ICallRepository } from '../../interfaces/repositories/call.repository.interface';
import { CreateGroupCallDTO } from '../../dtos/call/request/create-group-call.dto';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';
import { CallDTO, CallMediaType } from '../../dtos/call/request/call.dto';
import { ICallNotificationService } from '../../interfaces/services/call-notification.service.interface';

@injectable()
export class CreateGroupCallUseCase implements ICreateGroupCallUseCase {
  constructor(
    @inject(TOKENS.ICallRepository)
    private readonly _callRepository: ICallRepository,

    @inject(TOKENS.IGroupMemberRepository)
    private readonly _groupMemberRepository: IGroupMemberRepository,

    @inject(TOKENS.ICallNotificationService)
    private readonly _notificationService: ICallNotificationService,
  ) {}

  async execute(callerId: string, data: CreateGroupCallDTO): Promise<CallDTO> {
    const callerMembership = await this._groupMemberRepository.findActiveMember(
      data.tripGroupId,
      callerId,
    );

    if (!callerMembership) {
      throw new Error('You are not an active member of this trip group.');
    }

    const { members, group } = await this._groupMemberRepository.getMembers(
      data.tripGroupId,
    );

    if (members.length < 2) {
      throw new Error('A group call requires at least two members.');
    }

    const call = await this._callRepository.createCall({
      scope: CallScope.TRIP_GROUP,
      mediaType: data.mediaType as CallMediaType,
      callerId,
      tripGroupId: data.tripGroupId,
    });

    const participants = members.map((member) => ({
      callId: call.id,
      userId: member.userId,
      status:
        member.userId === callerId
          ? CallParticipantStatus.JOINED
          : CallParticipantStatus.INVITED,
    }));

    await this._callRepository.createParticipants(participants);

    const activeCall = await this._callRepository.updateCallStarted(call.id);

    const callParticipants = await this._callRepository.getParticipants(
      call.id,
    );
    const recipientIds = members
      .filter((member) => member.userId !== callerId)
      .map((member) => member.userId);
    console.log('call', call);
    this._notificationService.notifyIncomingGroupCall(recipientIds, {
      callId: activeCall.id,
      tripGroupId: data.tripGroupId,
      groupName: group!.name,
      groupCoverUrl: group!.coverUrl!,
      callerId,
      callerName: call.caller!.fullName,
      callerProfileImage: call.caller!.avatarUrl,
      mediaType: activeCall.mediaType,
    });
    return {
      id: activeCall.id,
      scope: activeCall.scope,
      mediaType: activeCall.mediaType,
      status: activeCall.status,

      callerId: activeCall.callerId,
      recipientId: activeCall.recipientId,
      tripGroupId: activeCall.tripGroupId,
      groupName: group!.name,
      groupCoverUrl: group!.coverUrl!,

      startedAt: activeCall.startedAt,
      endedAt: activeCall.endedAt,
      createdAt: activeCall.createdAt,

      participants: callParticipants.map((participant) => ({
        id: participant.id,
        userId: participant.userId,
        status: participant.status,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
      })),
    };
  }
}
