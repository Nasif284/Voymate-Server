import { NotificationType } from '../../enums/notification.constants';

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export class NotificationEntity {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  get data(): Record<string, unknown> | null | undefined {
    return this.props.data;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markAsRead(): void {
    this.props.isRead = true;
    this.props.readAt = new Date();
  }

  toJSON(): NotificationProps {
    return {
      id: this.props.id,
      userId: this.props.userId,
      type: this.props.type,
      title: this.props.title,
      body: this.props.body,
      data: this.props.data ?? null,
      isRead: this.props.isRead,
      readAt: this.props.readAt ?? null,
      createdAt: this.props.createdAt,
    };
  }

  static create(
    props: Omit<NotificationProps, 'id' | 'isRead' | 'createdAt'> & {
      id?: string;
    },
  ): NotificationEntity {
    return new NotificationEntity({
      id: props.id ?? '',
      userId: props.userId,
      type: props.type,
      title: props.title,
      body: props.body,
      data: props.data ?? null,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    });
  }
}
