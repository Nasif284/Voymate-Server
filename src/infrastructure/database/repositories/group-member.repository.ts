import { inject, injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { TOKENS } from '../../di/tokens';
import { IGroupMemberRepository } from '../../../application/interfaces/repositories/group-member.repository';
import { GetMembersResponseDTO } from '../../../application/dtos/trip/responce/get-members.dto';
import { TripMemberRole } from '../../../domain/enums/trip.constants';
import {
  OnlyAdminCanRemoveError,
  UserAlreadyExistInTheGroupError,
} from '../../../domain/errors/trip.error';

@injectable()
export class GroupMemberRepository implements IGroupMemberRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async addMember(
    userId: string,
    groupId: string,
    addedBy: string,
  ): Promise<void> {
    const isExist = await this.prisma.tripGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    if (isExist) {
      if (isExist?.isActive) {
        throw new UserAlreadyExistInTheGroupError();
      }
      if (!isExist?.isActive) {
        await this.prisma.tripGroupMember.update({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
          data: {
            isActive: true,
          },
        });
        return;
      }
    }

    await this.prisma.tripGroupMember.create({
      data: {
        userId,
        groupId,
        addedBy,
      },
    });
  }

  async getMembers(groupId: string): Promise<GetMembersResponseDTO> {
    const group = await this.prisma.tripGroup.findFirst({
      where: {
        id: groupId,
      },
      include: {
        trip: {
          select: {
            name: true,
            destination: {
              select: {
                coverUrl: true,
              },
            },
          },
        },
      },
    });
    const members = await this.prisma.tripGroupMember.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });
    return {
      members: members.map((m) => ({
        id: m.id,
        name: m.user.fullName,
        userId: m.user.id,
        avatarUrl: m.user.avatarUrl!,
        joinedAt: m.joinedAt,
        role: m.roleCode,
      })),
      group: {
        name: group!.trip.name,
        coverUrl: group!.trip.destination.coverUrl,
      },
    };
  }

  async changeMemberRole(groupId: string, memberId: string): Promise<void> {
    await this.prisma.tripGroupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId,
        },
      },
      data: {
        roleCode: TripMemberRole.ADMIN,
      },
    });
  }

  async removeFromGroup(
    groupId: string,
    memberId: string,
    userId?: string,
  ): Promise<void> {
    if (userId) {
      const user = await this.prisma.tripGroupMember.findFirst({
        where: {
          groupId,
          userId,
          isActive: true,
        },
      });
      if (user?.roleCode !== TripMemberRole.ADMIN) {
        throw new OnlyAdminCanRemoveError();
      }
    }
    await this.prisma.tripGroupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId,
        },
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  async findActiveMember(
    groupId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    return await this.prisma.tripGroupMember.findFirst({
      where: {
        groupId,
        userId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });
  }
}
