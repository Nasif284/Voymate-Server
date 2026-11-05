import { inject, injectable } from 'tsyringe';
import { PrismaClient, ReportCategory } from '@prisma/client';
import {
  ISafetyRepository,
  BlockedUserDTO,
  CreateReportDTO,
} from '../../../application/interfaces/repositories/safety.repository.interface';
import { TOKENS } from '../../di/tokens';
import logger from '../../logging/logger';

@injectable()
export class SafetyRepository implements ISafetyRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Create or ensure UserBlock record
      await tx.userBlock.upsert({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
        create: {
          blockerId,
          blockedId,
        },
        update: {},
      });

      // 2. Deactivate any existing connection between them
      await tx.connection.updateMany({
        where: {
          OR: [
            { userAId: blockerId, userBId: blockedId },
            { userAId: blockedId, userBId: blockerId },
          ],
        },
        data: { isActive: false },
      });

      // 3. Decline/cancel pending requests between them
      await tx.connectionRequest.updateMany({
        where: {
          OR: [
            { senderId: blockerId, receiverId: blockedId },
            { senderId: blockedId, receiverId: blockerId },
          ],
          status: 'PENDING',
        },
        data: { status: 'DECLINED' },
      });
    });

    logger.info(`[SAFETY_BLOCK] User ${blockerId} blocked User ${blockedId}`);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.userBlock.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });

    logger.info(
      `[SAFETY_UNBLOCK] User ${blockerId} unblocked User ${blockedId}`,
    );
  }

  async isBlocked(userAId: string, userBId: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userAId, blockedId: userBId },
          { blockerId: userBId, blockedId: userAId },
        ],
      },
      select: { id: true },
    });

    return Boolean(block);
  }

  async getBlockedUsers(userId: string): Promise<BlockedUserDTO[]> {
    const blocks = await this.prisma.userBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map((b) => ({
      id: b.blocked.id,
      name: b.blocked.fullName,
      avatarUrl: b.blocked.avatarUrl,
      blockedAt: b.createdAt,
    }));
  }

  async getMutualBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.prisma.userBlock.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const set = new Set<string>();
    for (const b of blocks) {
      if (b.blockerId !== userId) set.add(b.blockerId);
      if (b.blockedId !== userId) set.add(b.blockedId);
    }

    return Array.from(set);
  }

  async createReport(
    dto: CreateReportDTO,
  ): Promise<{ id: string; createdAt: Date }> {
    let category: ReportCategory = ReportCategory.OTHER;
    if (dto.category && Object.values(ReportCategory).includes(dto.category)) {
      category = dto.category;
    } else if (dto.reason) {
      const lower = dto.reason.toLowerCase();
      if (lower.includes('harass') || lower.includes('bully')) {
        category = ReportCategory.HARASSMENT;
      } else if (
        lower.includes('inappropriate') ||
        lower.includes('offensive') ||
        lower.includes('photo')
      ) {
        category = ReportCategory.INAPPROPRIATE_CONTENT;
      } else if (
        lower.includes('spam') ||
        lower.includes('scam') ||
        lower.includes('fake')
      ) {
        category = ReportCategory.SPAM_OR_SCAM;
      } else if (lower.includes('impersonat')) {
        category = ReportCategory.IMPERSONATION;
      }
    }

    const report = await this.prisma.userReport.create({
      data: {
        reporterId: dto.reporterId,
        reportedUserId: dto.reportedUserId,
        category,
        reason: dto.reason,
        details: dto.details?.trim() || null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    logger.warn(
      `[UGC_REPORT_CREATED] Report ID: ${report.id} - Reporter: ${dto.reporterId} reported User: ${dto.reportedUserId}. Category: ${category}. Reason: ${dto.reason}`,
    );

    return report;
  }
}
