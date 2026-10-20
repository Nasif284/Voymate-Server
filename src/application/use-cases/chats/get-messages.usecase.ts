import { inject, injectable } from 'tsyringe';

import {
  ChatMessageDTO,
  IChatRepository,
} from '../../interfaces/repositories/chat.repository';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IGetChatMessagesUseCase } from '../../interfaces/use-cases/chats/get-messages.interface';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class GetChatMessagesUseCase implements IGetChatMessagesUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository,

    @inject(TOKENS.IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    limit = 30,
    cursor?: string,
  ): Promise<ChatMessageDTO[]> {
    const conversation =
      await this.chatRepository.getConversation(conversationId);

    if (!conversation) {
      throw new Error('Chat conversation not found.');
    }

    const isMember = await this.chatRepository.isDirectConversationMember(
      conversationId,
      userId,
    );

    if (!isMember) {
      throw new Error('You are not a member of this conversation.');
    }

    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const messages = await this.chatRepository.getMessages(
      conversationId,
      safeLimit,
      cursor,
    );

    for (const message of messages) {
      if (message.sender?.avatarUrl) {
        message.sender.avatarUrl = await this.storageService.getSignedUrl(
          message.sender.avatarUrl,
        );
      }

      if (message.type === 'IMAGE' && message.attachment) {
        message.attachment.url = await this.storageService.getSignedUrl(
          message.attachment.storageKey,
        );
      }
    }

    return messages;
  }
}
