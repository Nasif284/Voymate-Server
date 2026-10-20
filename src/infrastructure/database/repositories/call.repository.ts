import { inject, injectable } from 'tsyringe';

import { PrismaClient } from '@prisma/client';
import {
  CreateCallData,
  CreateCallParticipantData,
  ICallRepository,
} from '../../../application/interfaces/repositories/call.repository.interface';
import {
  CallDTO,
  CallParticipantDTO,
  CallParticipantStatus,
  CallStatus,
} from '../../../application/dtos/call/request/call.dto';
import { TOKENS } from '../../di/tokens';

@injectable()
export class CallRepository implements ICallRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async createCall(data: CreateCallData): Promise<CallDTO> {
    return this.prisma.call.create({
      data: {
        scope: data.scope,
        mediaType: data.mediaType,
        callerId: data.callerId,
        recipientId: data.recipientId,
      },
      include: {
        caller: {
          include: {},
        },
      },
    });
  }

  async createParticipant(
    data: CreateCallParticipantData,
  ): Promise<CallParticipantDTO> {
    return this.prisma.callParticipant.create({
      data,
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createParticipants(data: CreateCallParticipantData[]): Promise<void> {
    await this.prisma.callParticipant.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(callId: string): Promise<CallDTO | null> {
    return this.prisma.call.findUnique({
      where: {
        id: callId,
      },
    });
  }

  async findParticipant(
    callId: string,
    userId: string,
  ): Promise<CallParticipantDTO | null> {
    return this.prisma.callParticipant.findUnique({
      where: {
        callId_userId: {
          callId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateParticipantStatus(
    callId: string,
    userId: string,
    status: CallParticipantStatus,
  ): Promise<CallParticipantDTO> {
    return this.prisma.callParticipant.update({
      where: {
        callId_userId: {
          callId,
          userId,
        },
      },
      data: {
        status,
      },
    });
  }

  async updateCallStatus(callId: string, status: CallStatus): Promise<CallDTO> {
    return this.prisma.call.update({
      where: {
        id: callId,
      },
      data: {
        status,
      },
    });
  }

  async updateCallStarted(callId: string): Promise<CallDTO> {
    return this.prisma.call.update({
      where: {
        id: callId,
      },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  async updateCallEnded(callId: string): Promise<CallDTO> {
    return this.prisma.call.update({
      where: {
        id: callId,
      },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });
  }

  async getParticipants(callId: string): Promise<CallParticipantDTO[]> {
    return this.prisma.callParticipant.findMany({
      where: {
        callId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  async findByIdWithParticipants(callId: string): Promise<CallDTO | null> {
    return this.prisma.call.findUnique({
      where: {
        id: callId,
      },
      include: {
        participants: true,
      },
    });
  }

  async updateParticipantJoined(
    callId: string,
    userId: string,
  ): Promise<CallParticipantDTO> {
    return this.prisma.callParticipant.update({
      where: {
        callId_userId: {
          callId,
          userId,
        },
      },
      data: {
        status: 'JOINED',
        joinedAt: new Date(),
        leftAt: null,
      },
    });
  }

  async countJoinedParticipants(callId: string): Promise<number> {
    return this.prisma.callParticipant.count({
      where: {
        callId,
        status: 'JOINED',
      },
    });
  }
}
