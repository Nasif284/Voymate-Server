import { DevicePlatform } from '../../../domain/enums/notification.constants';

export interface RegisterDeviceTokenDTO {
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
}

export interface UnregisterDeviceTokenDTO {
  token: string;
}
