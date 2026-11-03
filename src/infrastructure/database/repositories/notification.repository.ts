import { inject, injectable } from 'tsyringe';
import { PrismaClient, NotificationType, Prisma } from '@prisma/client';
import {
  CreateNotificationDTO,
  INotificationRepository,
  NotificationPaginationResult,
} from '../../../application/interfaces/repositories/notification.repository.interface';
import { NotificationEntity } from '../../../domain/entities/notification/notification.entity';
import { NotificationType as DomainNotificationType } from '../../../domain/enums/notification.constants';
import { TOKENS } from '../../di/tokens';

@injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  private toDomain(record: {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Prisma.JsonValue | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }): NotificationEntity {
    return new NotificationEntity({
      id: record.id,
      userId: record.userId,
      type: record.type as unknown as DomainNotificationType,
      title: record.title,
      body: record.body,
      data: record.data as Record<string, unknown> | null,
      isRead: record.isRead,
      readAt: record.readAt,
      createdAt: record.createdAt,
    });
  }

  async create(data: CreateNotificationDTO): Promise<NotificationEntity> {
    const record = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as unknown as NotificationType,
        title: data.title,
        body: data.body,
        data: (data.data ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });

    return this.toDomain(record);
  }

  async findByUserId(
    userId: string,
    pagination: { page: number; limit: number; unreadOnly?: boolean },
  ): Promise<NotificationPaginationResult> {
    const skip = (pagination.page - 1) * pagination.limit;
    const limit = pagination.limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(pagination.unreadOnly ? { isRead: false } : {}),
    };

    const [records, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: records.map((r) => this.toDomain(r)),
      total,
      unreadCount,
      hasMore: skip + records.length < total,
    };
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const record = await this.prisma.notification.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
