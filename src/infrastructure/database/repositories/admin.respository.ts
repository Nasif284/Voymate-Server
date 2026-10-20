import {
  Prisma,
  PrismaClient,
  Admin as PrismaAdmin,
  AccountStatus,
} from '@prisma/client';

import { BaseRepository } from './base.repository';

import {
  CreateAdminData,
  IAdminRepository,
} from '../../../application/interfaces/repositories/admin.respository';

import { Admin } from '../../../domain/entities/admin/admin.entity';

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../di/tokens';
import { GetAdminsResponseDTO } from '../../../application/dtos/admins/response/get-admins.dto';
import { capitalizeFirstLetter } from '../../../shared/helpers/capitalizseFirstLetter';
import { UpdateAdminStatusDTO } from '../../../application/dtos/admins/request/update-admin.dto';
import { AdminNotFoundError } from '../../../domain/errors/admin.error';
import { AdminMapper } from '../mappers/admin.mapper';
import {
  normalizeAdminRole,
  formatAdminRoleDisplayName,
} from '../../../domain/enums/admin-role.enum';

@injectable()
export class AdminRepository
  extends BaseRepository<
    PrismaAdmin,
    Prisma.AdminCreateInput,
    Prisma.AdminUpdateInput
  >
  implements IAdminRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.admin);
  }

  async findAdminById(id: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id,
      },

      include: {
        role: true,
      },
    });

    if (!admin) {
      return null;
    }

    return AdminMapper.toDomain(admin);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findFirst({
      where: {
        email,
      },

      include: {
        role: true,
      },
    });

    if (!admin) {
      return null;
    }

    return AdminMapper.toDomain(admin);
  }

  async createAdmin(data: CreateAdminData): Promise<Admin> {
    const normalized = normalizeAdminRole(data.role);
    const role = await this.prisma.role.findFirst({
      where: {
        OR: [
          { name: { equals: data.role, mode: Prisma.QueryMode.insensitive } },
          ...(normalized
            ? [
                {
                  name: {
                    equals: normalized,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ]
            : []),
        ],
      },
    });

    if (!role) {
      throw new Error('Invalid admin role');
    }

    const createdAdmin = await this.create({
      fullName: data.fullName,

      email: data.email,

      passwordHash: data.passwordHash,

      role: {
        connect: {
          id: role.id,
        },
      },
    });

    const adminWithRole = await this.prisma.admin.findUnique({
      where: {
        id: createdAdmin.id,
      },

      include: {
        role: true,
      },
    });

    if (!adminWithRole) {
      throw new Error('Admin creation failed');
    }

    return AdminMapper.toDomain(adminWithRole);
  }

  async getAdmins(): Promise<GetAdminsResponseDTO> {
    const admins = await this.prisma.admin.findMany({
      include: {
        role: true,
      },
    });
    return {
      admins: admins.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.fullName,
        role: formatAdminRoleDisplayName(a.role.name),
        status: capitalizeFirstLetter(a.accountStatus),
        lastActive: a.lastActiveAt!,
        ip: a.lastActiveIp!,
      })),
    };
  }
  async updateLastActive(adminId: string, ip: string): Promise<void> {
    await this.prisma.admin.update({
      where: {
        id: adminId,
      },
      data: {
        lastActiveAt: new Date(),
        lastActiveIp: ip,
      },
    });
  }

  async updatePassword(adminId: string, passwordHash: string): Promise<void> {
    await this.prisma.admin.update({
      where: {
        id: adminId,
      },
      data: {
        passwordHash,
      },
    });
  }

  async updateRole(adminId: string, roleName: string): Promise<void> {
    const normalized = normalizeAdminRole(roleName);
    const role = await this.prisma.role.findFirst({
      where: {
        OR: [
          { name: { equals: roleName, mode: Prisma.QueryMode.insensitive } },
          ...(normalized
            ? [
                {
                  name: {
                    equals: normalized,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ]
            : []),
        ],
      },
    });
    if (role) {
      await this.prisma.admin.update({
        where: {
          id: adminId,
        },
        data: {
          roleId: role.id,
        },
      });
    }
  }

  async updateStatus(
    adminId: string,
    status: UpdateAdminStatusDTO,
    actionedBy: string,
  ): Promise<void> {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });
    if (!admin) {
      throw new AdminNotFoundError();
    }
    const targetStatus = status.statusCode.toUpperCase() as AccountStatus;
    await this.prisma.$transaction([
      this.prisma.admin.update({
        where: {
          id: adminId,
        },
        data: {
          accountStatus: targetStatus,
        },
      }),
      this.prisma.adminStatusHistory.create({
        data: {
          newStatus: targetStatus,
          ...(status.reason && {
            reason: status.reason,
          }),
          previousStatus: admin.accountStatus,
          actionedBy,
          adminId,
        },
      }),
    ]);
  }
}
