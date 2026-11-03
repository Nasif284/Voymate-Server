import { DevicePlatform } from '../../enums/notification.constants';

export interface DeviceTokenProps {
  id: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceTokenEntity {
  private props: DeviceTokenProps;

  constructor(props: DeviceTokenProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get platform(): DevicePlatform {
    return this.props.platform;
  }

  get deviceId(): string | null | undefined {
    return this.props.deviceId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  static create(
    props: Omit<
      DeviceTokenProps,
      'id' | 'isActive' | 'createdAt' | 'updatedAt'
    > & { id?: string },
  ): DeviceTokenEntity {
    return new DeviceTokenEntity({
      id: props.id ?? '',
      userId: props.userId,
      token: props.token,
      platform: props.platform,
      deviceId: props.deviceId ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
