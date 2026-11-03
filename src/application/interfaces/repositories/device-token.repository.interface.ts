import { DeviceTokenEntity } from '../../../domain/entities/notification/device-token.entity';
import { DevicePlatform } from '../../../domain/enums/notification.constants';

export interface UpsertDeviceTokenDTO {
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string | null;
}

export interface IDeviceTokenRepository {
  upsertToken(data: UpsertDeviceTokenDTO): Promise<DeviceTokenEntity>;
  findActiveByUserId(userId: string): Promise<DeviceTokenEntity[]>;
  deactivateToken(token: string): Promise<void>;
  deactivateDevice(userId: string, deviceId: string): Promise<void>;
}
