// admin.mapper.ts

import { Admin as PrismaAdmin, Role as PrismaRole } from '@prisma/client';
import { Admin, AdminRole } from '../../../domain/entities/admin/admin.entity';

type AdminWithRole = PrismaAdmin & {
  role: PrismaRole;
};

export class AdminMapper {
  static toDomain(admin: AdminWithRole): Admin {
    const role: AdminRole = {
      roleId: admin.role.id,
      name: admin.role.name,
      description: admin.role.description,
    };

    return new Admin({
      id: admin.id,

      fullName: admin.fullName,

      email: admin.email,

      passwordHash: admin.passwordHash,

      accountStatusCode: admin.accountStatus,

      avatarUrl: admin.avatarUrl,

      lastActiveAt: admin.lastActiveAt,

      createdBy: admin.createdBy,

      createdAt: admin.createdAt,

      updatedAt: admin.updatedAt,

      role,
    });
  }
}
