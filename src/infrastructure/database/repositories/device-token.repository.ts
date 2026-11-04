import { inject, injectable } from 'tsyringe';
import { PrismaClient, DevicePlatform } from '@prisma/client';
import {
  IDeviceTokenRepository,
  UpsertDeviceTokenDTO,
} from '../../../application/interfaces/repositories/device-token.repository.interface';
import { DeviceTokenEntity } from '../../../domain/entities/notification/device-token.entity';
import { DevicePlatform as DomainDevicePlatform } from '../../../domain/enums/notification.constants';
import { TOKENS } from '../../di/tokens';

@injectable()
export class DeviceTokenRepository implements IDeviceTokenRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  private toDomain(record: {
    id: string;
    userId: string;
    token: string;
    platform: DevicePlatform;
    deviceId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): DeviceTokenEntity {
    return new DeviceTokenEntity({
      id: record.id,
      userId: record.userId,
      token: record.token,
      platform: record.platform as unknown as DomainDevicePlatform,
      deviceId: record.deviceId,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async upsertToken(data: UpsertDeviceTokenDTO): Promise<DeviceTokenEntity> {
    const record = await this.prisma.userDeviceToken.upsert({
      where: { token: data.token },
      update: {
        userId: data.userId,
        platform: data.platform as unknown as DevicePlatform,
        deviceId: data.deviceId ?? null,
        isActive: true,
      },
      create: {
        userId: data.userId,
        token: data.token,
        platform: data.platform as unknown as DevicePlatform,
        deviceId: data.deviceId ?? null,
        isActive: true,
      },
    });

    // Cap active device tokens per user at 5 most recently updated devices
    const staleTokens = await this.prisma.userDeviceToken.findMany({
      where: {
        userId: data.userId,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: 5,
      select: { id: true },
    });

    if (staleTokens.length > 0) {
      await this.prisma.userDeviceToken.updateMany({
        where: {
          id: { in: staleTokens.map((t) => t.id) },
        },
        data: { isActive: false },
      });
    }

    return this.toDomain(record);
  }

  async findActiveByUserId(userId: string): Promise<DeviceTokenEntity[]> {
    const records = await this.prisma.userDeviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return records.map((r) => this.toDomain(r));
  }

  async deactivateToken(token: string): Promise<void> {
    await this.prisma.userDeviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  async deactivateDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.userDeviceToken.updateMany({
      where: { userId, deviceId },
      data: { isActive: false },
    });
  }
}
