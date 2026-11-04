import { Server, Socket } from 'socket.io';
import { container } from 'tsyringe';

import { TOKENS } from '../di/tokens';
import { ISendChatMessageUseCase } from '../../application/interfaces/use-cases/chats/send-message.interface';
import { IJoinChatConversationValidationUseCase } from '../../application/interfaces/use-cases/chats/join-conversation-validation.interface';
import { IPresenceService } from '../../application/interfaces/services/presence.service.interface';
import { IMarkMessagesAsReadUseCase } from '../../application/interfaces/use-cases/chats/mark-messages-read.interface';
import { IChatRepository } from '../../application/interfaces/repositories/chat.repository';
import { INotificationDispatcherService } from '../../application/interfaces/services/notification-dispatcher.service.interface';
import { INotificationRepository } from '../../application/interfaces/repositories/notification.repository.interface';
import { IUserRepository } from '../../application/interfaces/repositories/user.reposetory';
import { NotificationType } from '../../domain/enums/notification.constants';

export function registerChatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] Connected: ${socket.id}, user: ${userId}`);

    if (userId) {
      socket.join(`user:${userId}`);

      // Cache sender fullName on socket session once on connect
      const userRepo = container.resolve<IUserRepository>(
        TOKENS.IUserRepository,
      );
      userRepo
        .findUserById(userId)
        .then((u) => {
          if (u?.fullName) {
            socket.data.fullName = u.fullName;
          }
        })
        .catch(() => {});

      const presenceService = container.resolve<IPresenceService>(
        TOKENS.IPresenceService,
      );
      presenceService
        .setUserOnline(userId, socket.id)
        .then(({ isFirstSocket }) => {
          if (isFirstSocket) {
            io.emit('presence:user_online', { userId });
          }
        })
        .catch((err) => console.error('[Presence] Connect error:', err));
    }

    socket.on('presence:get_status', async (data: { userIds: string[] }) => {
      try {
        const presenceService = container.resolve<IPresenceService>(
          TOKENS.IPresenceService,
        );
        const statuses = await presenceService.getUsersPresence(
          data.userIds || [],
        );
        socket.emit('presence:status', { statuses });
      } catch (error) {
        console.error('[Presence] Status error:', error);
      }
    });

    socket.on('chat:join', async (conversationId: string) => {
      try {
        const currentUserId = socket.data.userId;

        const useCase =
          container.resolve<IJoinChatConversationValidationUseCase>(
            TOKENS.IJoinChatConversationValidationUseCase,
          );

        await useCase.execute(currentUserId, conversationId);

        socket.join(`conversation:${conversationId}`);

        socket.emit('chat:joined', {
          conversationId,
        });
      } catch (error) {
        socket.emit('chat:error', {
          message:
            error instanceof Error
              ? error.message
              : 'Unable to join conversation.',
        });
      }
    });

    socket.on('chat:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:read', async (data: { conversationId: string }) => {
      try {
        const currentUserId = socket.data.userId;
        if (!currentUserId || !data?.conversationId) return;

        const useCase = container.resolve<IMarkMessagesAsReadUseCase>(
          TOKENS.IMarkMessagesAsReadUseCase,
        );

        const result = await useCase.execute(
          currentUserId,
          data.conversationId,
        );

        const chatRepo = container.resolve<IChatRepository>(
          TOKENS.IChatRepository,
        );
        const conversation = await chatRepo.getConversation(
          data.conversationId,
        );

        const roomTargets = [`conversation:${data.conversationId}`];
        if (conversation?.userAId)
          roomTargets.push(`user:${conversation.userAId}`);
        if (conversation?.userBId)
          roomTargets.push(`user:${conversation.userBId}`);

        io.to(roomTargets).emit('chat:messages_read', {
          conversationId: data.conversationId,
          readerId: currentUserId,
          readAt: result.readAt,
        });

        // Automatically mark unread CHAT_MESSAGE notifications for this conversation as read
        const notificationRepo = container.resolve<INotificationRepository>(
          TOKENS.INotificationRepository,
        );
        notificationRepo
          .markConversationAsRead(currentUserId, data.conversationId)
          .then((updatedCount) => {
            if (updatedCount > 0) {
              io.to(`user:${currentUserId}`).emit(
                'notification:conversation_read',
                {
                  conversationId: data.conversationId,
                  updatedCount,
                },
              );
            }
          })
          .catch((err) =>
            console.error('[Socket] Notification mark read error:', err),
          );
      } catch (error) {
        console.error('[Socket] Mark read error:', error);
      }
    });

    socket.on('chat:send', async (data) => {
      try {
        const currentUserId = socket.data.userId;

        const useCase = container.resolve<ISendChatMessageUseCase>(
          TOKENS.ISendChatMessageUseCase,
        );

        const message = await useCase.execute(currentUserId, data);

        socket.join(`conversation:${message.conversationId}`);

        const chatRepo = container.resolve<IChatRepository>(
          TOKENS.IChatRepository,
        );
        const conversation = await chatRepo.getConversation(
          message.conversationId,
        );

        const roomTargets = [`conversation:${message.conversationId}`];
        if (conversation?.userAId)
          roomTargets.push(`user:${conversation.userAId}`);
        if (conversation?.userBId)
          roomTargets.push(`user:${conversation.userBId}`);

        io.to(roomTargets).emit('chat:message', message);

        const recipientUserId =
          conversation?.userAId === currentUserId
            ? conversation?.userBId
            : conversation?.userAId;

        if (recipientUserId) {
          try {
            // Suppress notification if recipient is actively viewing this conversation
            const roomSockets = await io
              .in(`conversation:${message.conversationId}`)
              .fetchSockets();
            const isRecipientInConversation = roomSockets.some(
              (s) => s.data.userId === recipientUserId,
            );

            if (!isRecipientInConversation) {
              let senderName = socket.data.fullName as string | undefined;
              if (!senderName) {
                const userRepo = container.resolve<IUserRepository>(
                  TOKENS.IUserRepository,
                );
                const senderUser = await userRepo.findUserById(currentUserId);
                senderName = senderUser?.fullName || 'New message';
                socket.data.fullName = senderName;
              }

              const notificationDispatcher =
                container.resolve<INotificationDispatcherService>(
                  TOKENS.INotificationDispatcherService,
                );

              notificationDispatcher
                .dispatch({
                  userId: recipientUserId,
                  type: NotificationType.CHAT_MESSAGE,
                  title: senderName,
                  body: message.content || 'Sent an attachment',
                  data: {
                    conversationId: message.conversationId,
                    senderId: currentUserId,
                    type: 'CHAT_MESSAGE',
                  },
                })
                .catch((err) =>
                  console.error(
                    '[Socket Chat] Failed to dispatch notification:',
                    err,
                  ),
                );
            }
          } catch (dispatchErr) {
            console.error('[Socket Chat] Dispatch error:', dispatchErr);
          }
        }
      } catch (error) {
        socket.emit('chat:error', {
          message:
            error instanceof Error ? error.message : 'Failed to send message.',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}, user: ${userId}`);
      if (userId) {
        const presenceService = container.resolve<IPresenceService>(
          TOKENS.IPresenceService,
        );
        presenceService
          .setUserOffline(userId, socket.id)
          .then(({ isFullyOffline, lastSeen }) => {
            if (isFullyOffline) {
              io.emit('presence:user_offline', { userId, lastSeen });
            }
          })
          .catch((err) => console.error('[Presence] Disconnect error:', err));
      }
    });
  });
}
