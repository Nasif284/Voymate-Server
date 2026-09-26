import { inject, injectable } from 'tsyringe';
import { PrismaClient, Prisma } from '@prisma/client';
import { TOKENS } from '../../di/tokens';
import {
  ITripGroupRepository,
  GroupTripForAI,
} from '../../../application/interfaces/repositories/trip-group.repository';
import { GetGroupsRequestDTO } from '../../../application/dtos/trip/request/get-all-groups.dto';
import { GetAllGroupsResponseDTO } from '../../../application/dtos/trip/responce/get-all-groups.dto';
import {
  GetGroupsResponseDTO,
  GroupData,
} from '../../../application/dtos/trip/responce/get-groups.dto';
import { GetGroupInvitesResponse } from '../../../application/dtos/trip/responce/get-invites.dto';
import { TripMemberRole } from '../../../domain/enums/trip.constants';
import {
  GroupNotFound,
  UserAlreadyExistInTheGroupError,
} from '../../../domain/errors/trip.error';

@injectable()
export class TripGroupRepository implements ITripGroupRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async createGroup(
    tripId: string,
    userId: string,
    inviteCode: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const group = await tx.tripGroup.create({
        data: {
          tripId,
          createdBy: userId,
          inviteCode,
        },
      });
      await tx.tripGroupMember.create({
        data: {
          groupId: group.id,
          userId,
          roleCode: TripMemberRole.ADMIN,
        },
      });
    });
  }

  async getActiveGroups(userId: string): Promise<GroupData[]> {
    const groups = await this.prisma.tripGroup.findMany({
      where: {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
        trip: {
          dateTo: { gte: new Date() },
        },
      },
      orderBy: {
        trip: {
          dateFrom: 'asc',
        },
      },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                avatarUrl: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    return groups.map((group) => {
      return {
        id: group.id,
        name: group.trip.name,
        dateFrom: group.trip.dateFrom,
        dateTo: group.trip.dateTo,
        destination: group.trip.destination.name,
        coverUrl: group.trip.destination.coverUrl!,
        budgetStyle: group.trip.budgetStyleCode,
        members: group.members.map((m) => ({
          id: m.user.id,
          name: m.user.fullName,
          avatarUrl: m.user.avatarUrl!,
          role: m.roleCode,
        })),
      };
    });
  }

  async getInviteCode(groupId: string): Promise<{ inviteCode: string }> {
    const group = await this.prisma.tripGroup.findFirst({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      throw new GroupNotFound();
    }
    return { inviteCode: group.inviteCode };
  }

  async getGroupWithTrip(groupId: string): Promise<{
    inviteCode: string;
    groupName: string;
    destination: string;
  }> {
    const group = await this.prisma.tripGroup.findFirst({
      where: {
        id: groupId,
      },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
      },
    });
    if (!group) {
      throw new GroupNotFound();
    }
    return {
      inviteCode: group.inviteCode,
      groupName: group.trip.name,
      destination: group.trip.destination.name,
    };
  }

  async joinGroupByInviteCode(payload: {
    inviteCode: string;
    userId: string;
  }): Promise<{ groupId: string; alreadyMember: boolean }> {
    const group = await this.prisma.tripGroup.findUnique({
      where: {
        inviteCode: payload.inviteCode,
      },
      select: {
        id: true,
      },
    });

    if (!group) {
      throw new Error('invalid invite link');
    }

    const existingMember = await this.prisma.tripGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: payload.userId,
        },
      },
    });

    await this.prisma.$transaction(async (tx) => {
      if (!existingMember) {
        await tx.tripGroupMember.create({
          data: {
            groupId: group.id,
            userId: payload.userId,
            roleCode: TripMemberRole.MEMBER,
          },
        });
      } else {
        await tx.tripGroupMember.update({
          where: {
            groupId_userId: {
              groupId: group.id,
              userId: payload.userId,
            },
          },
          data: {
            isActive: true,
            leftAt: null,
            roleCode: TripMemberRole.MEMBER,
          },
        });
      }

      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        select: { email: true },
      });

      if (user?.email) {
        await tx.tripGroupInvite.updateMany({
          where: {
            groupId: group.id,
            invitedUserEmail: user.email,
            statusCode: 'pending',
          },
          data: {
            statusCode: 'accepted',
            respondedAt: new Date(),
          },
        });
      }
    });

    return { groupId: group.id, alreadyMember: false };
  }

  async GetGroupWithDetails(groupId: string): Promise<GroupData> {
    const group = await this.prisma.tripGroup.findFirst({
      where: {
        id: groupId,
      },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
        members: {
          where: {
            isActive: true,
          },
          include: {
            user: {
              select: {
                id: true,
                avatarUrl: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    if (!group) {
      throw new GroupNotFound();
    }
    return {
      id: group.id,
      name: group.trip.name,
      dateFrom: group.trip.dateFrom,
      dateTo: group.trip.dateTo,
      destination: group.trip.destination.name,
      coverUrl: group.trip.destination.coverUrl!,
      budgetStyle: group.trip.budgetStyleCode,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: m.user.fullName,
        avatarUrl: m.user.avatarUrl!,
        role: m.roleCode,
        joinedAt: m.joinedAt,
      })),
    };
  }

  async createGroupInvite(payload: {
    groupId: string;
    invitedBy: string;
    invitedUserEmail: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.invitedUserEmail,
      },
      select: {
        id: true,
      },
    });
    if (user?.id) {
      const existingMember = await this.prisma.tripGroupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: payload.groupId,
            userId: user.id,
          },
          isActive: true,
        },
      });
      if (existingMember) {
        throw new UserAlreadyExistInTheGroupError();
      }
    }

    const invite = await this.prisma.tripGroupInvite.findFirst({
      where: {
        invitedUserEmail: payload.invitedUserEmail,
        groupId: payload.groupId,
      },
    });
    if (invite?.id) {
      await this.prisma.tripGroupInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          statusCode: 'pending',
          createdAt: new Date(),
        },
      });
    } else {
      await this.prisma.tripGroupInvite.create({
        data: {
          ...payload,
        },
      });
    }
  }

  async getGroupInvites(groupId: string): Promise<GetGroupInvitesResponse> {
    const invites = await this.prisma.tripGroupInvite.findMany({
      where: {
        groupId,
        statusCode: 'pending',
      },
    });
    return {
      invites: invites.map((i) => {
        return {
          id: i.id,
          groupId: i.groupId,
          invitedUserEmail: i.invitedUserEmail!,
          invitedBy: i.invitedBy,
          statusCode: i.statusCode,
          createdAt: i.createdAt,
        };
      }),
    };
  }

  async getAllTripGroups(
    payload: GetGroupsRequestDTO,
  ): Promise<GetAllGroupsResponseDTO> {
    const {
      page = 1,
      limit = 10,
      tripStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      budgetStyle,
    } = payload;

    const tripWhere: Prisma.TripWhereInput = {};

    if (budgetStyle) {
      tripWhere.budgetStyleCode = budgetStyle;
    }

    if (search) {
      tripWhere.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          destination: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const now = new Date();

    switch (tripStatus) {
      case 'upcoming':
        tripWhere.dateFrom = {
          gt: now,
        };
        break;

      case 'active':
        tripWhere.AND = [
          {
            dateFrom: {
              lte: now,
            },
          },
          {
            dateTo: {
              gte: now,
            },
          },
        ];
        break;

      case 'completed':
        tripWhere.dateTo = {
          lt: now,
        };
        break;
    }

    const where: Prisma.TripGroupWhereInput = {
      trip: tripWhere,
    };

    const [groups, total] = await this.prisma.$transaction([
      this.prisma.tripGroup.findMany({
        where,
        include: {
          trip: {
            include: {
              destination: true,
            },
          },
          members: {
            where: {
              isActive: true,
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy:
          sortBy === 'dateFrom'
            ? {
                trip: {
                  dateFrom: sortOrder,
                },
              }
            : {
                createdAt: sortOrder,
              },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tripGroup.count({
        where,
      }),
    ]);

    return {
      groups: groups.map((group) => ({
        id: group.id,
        name: group.trip.name,
        dateFrom: group.trip.dateFrom,
        dateTo: group.trip.dateTo,
        destination: group.trip.destination.name,
        coverUrl: group.trip.destination.coverUrl!,
        budgetStyle: group.trip.budgetStyleCode,
        members: group.members.map((m) => ({
          id: m.user.id,
          name: m.user.fullName,
          role: m.roleCode,
        })),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserTripGroups(userId: string): Promise<GetGroupsResponseDTO> {
    const groups = await this.prisma.tripGroup.findMany({
      where: {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      orderBy: {
        trip: {
          dateFrom: 'asc',
        },
      },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                avatarUrl: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    return {
      groups: groups.map((group) => {
        return {
          id: group.id,
          name: group.trip.name,
          dateFrom: group.trip.dateFrom,
          dateTo: group.trip.dateTo,
          destination: group.trip.destination.name,
          coverUrl: group.trip.destination.coverUrl!,
          budgetStyle: group.trip.budgetStyleCode,
          members: group.members.map((m) => ({
            id: m.user.id,
            name: m.user.fullName,
            avatarUrl: m.user.avatarUrl!,
            role: m.roleCode,
          })),
        };
      }),
    };
  }

  async getGroupTrip(groupId: string): Promise<GroupTripForAI | null> {
    const group = await this.prisma.tripGroup.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          select: {
            id: true,
          },
        },
        trip: {
          include: {
            destination: {
              include: {
                country: true,
              },
            },
            budgetStyle: true,
            travelStyle: true,
          },
        },
      },
    });

    if (!group) {
      return null;
    }

    return {
      startDate: group.trip.dateFrom,
      endDate: group.trip.dateTo,
      budgetStyle: group.trip.budgetStyle?.label ?? '',
      travelStyle: group.trip.travelStyle?.label ?? '',
      travellers: group.members.length,
      destination: {
        placeId: group.trip.destination.placeId,
        name: group.trip.destination.name,
        city: group.trip.destination.city,
        state: group.trip.destination.state,
        country: group.trip.destination.country.name,
        latitude: Number(group.trip.destination.latitude),
        longitude: Number(group.trip.destination.longitude),
      },
    };
  }
}
