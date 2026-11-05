import { ReportCategory } from '@prisma/client';

export interface BlockedUserDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
  blockedAt: Date;
}

export interface CreateReportDTO {
  reporterId: string;
  reportedUserId: string;
  category?: ReportCategory;
  reason: string;
  details?: string;
}

export interface ISafetyRepository {
  blockUser(blockerId: string, blockedId: string): Promise<void>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  isBlocked(userAId: string, userBId: string): Promise<boolean>;
  getBlockedUsers(userId: string): Promise<BlockedUserDTO[]>;
  getMutualBlockedUserIds(userId: string): Promise<string[]>;
  createReport(dto: CreateReportDTO): Promise<{ id: string; createdAt: Date }>;
}
