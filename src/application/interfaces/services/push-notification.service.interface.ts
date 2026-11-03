export interface PushNotificationMessage {
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  badge?: number;
  sound?: 'default' | null;
}

export interface PushSendResult {
  successful: number;
  failed: number;
  invalidTokens: string[];
}

export interface IPushNotificationService {
  sendPushNotifications(
    tokens: string[],
    message: PushNotificationMessage,
  ): Promise<PushSendResult>;
}
