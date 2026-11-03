import { inject, injectable } from 'tsyringe';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import {
  IPushNotificationService,
  PushNotificationMessage,
  PushSendResult,
} from '../../application/interfaces/services/push-notification.service.interface';
import { IDeviceTokenRepository } from '../../application/interfaces/repositories/device-token.repository.interface';
import { TOKENS } from '../di/tokens';

@injectable()
export class ExpoPushNotificationService implements IPushNotificationService {
  private expo: Expo;

  constructor(
    @inject(TOKENS.IDeviceTokenRepository)
    private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {
    this.expo = new Expo();
  }

  async sendPushNotifications(
    tokens: string[],
    message: PushNotificationMessage,
  ): Promise<PushSendResult> {
    const validTokens: string[] = [];
    const invalidTokens: string[] = [];

    for (const token of tokens) {
      if (Expo.isExpoPushToken(token)) {
        validTokens.push(token);
      } else {
        invalidTokens.push(token);
        await this.deviceTokenRepo.deactivateToken(token).catch((err) => {
          console.error(
            `[ExpoPush] Failed to deactivate invalid token ${token}:`,
            err,
          );
        });
      }
    }

    if (validTokens.length === 0) {
      return {
        successful: 0,
        failed: invalidTokens.length,
        invalidTokens,
      };
    }

    const messages: ExpoPushMessage[] = validTokens.map((to) => ({
      to,
      sound: message.sound ?? 'default',
      title: message.title,
      body: message.body,
      data: message.data ?? undefined,
      badge: message.badge,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    let successful = 0;
    let failed = invalidTokens.length;

    for (const chunk of chunks) {
      try {
        const ticketChunk: ExpoPushTicket[] =
          await this.expo.sendPushNotificationsAsync(chunk);

        for (let i = 0; i < ticketChunk.length; i++) {
          const ticket = ticketChunk[i];
          if (ticket.status === 'ok') {
            successful++;
          } else if (ticket.status === 'error') {
            failed++;
            console.error('[ExpoPush] Error sending ticket:', ticket.message);
            if (
              ticket.details &&
              ticket.details.error === 'DeviceNotRegistered'
            ) {
              const unregisteredToken = chunk[i]?.to as string;
              if (unregisteredToken) {
                invalidTokens.push(unregisteredToken);
                await this.deviceTokenRepo
                  .deactivateToken(unregisteredToken)
                  .catch((err) =>
                    console.error(
                      '[ExpoPush] Failed to deactivate unregistered token:',
                      err,
                    ),
                  );
              }
            }
          }
        }
      } catch (error) {
        console.error('[ExpoPush] Error delivering chunk:', error);
        failed += chunk.length;
      }
    }

    return {
      successful,
      failed,
      invalidTokens,
    };
  }
}
