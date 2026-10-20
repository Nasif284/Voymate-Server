import { container } from 'tsyringe';
import { TOKENS } from '../../tokens';
import { IGetDirectChatUseCase } from '../../../../application/interfaces/use-cases/chats/get-direct-chat.interface';
import { GetDirectChatUseCase } from '../../../../application/use-cases/chats/get-direct-chat.usecase';
import { ISendChatMessageUseCase } from '../../../../application/interfaces/use-cases/chats/send-message.interface';
import { SendChatMessageUseCase } from '../../../../application/use-cases/chats/send-message.usecase';
import { IGetChatMessagesUseCase } from '../../../../application/interfaces/use-cases/chats/get-messages.interface';
import { GetChatMessagesUseCase } from '../../../../application/use-cases/chats/get-messages.usecase';
import { IJoinChatConversationValidationUseCase } from '../../../../application/interfaces/use-cases/chats/join-conversation-validation.interface';
import { JoinChatConversationValidationUseCase } from '../../../../application/use-cases/chats/join-conversation-validation.usecase';
import { IGetDirectConversationsUseCase } from '../../../../application/interfaces/use-cases/chats/get-direct-conversations.interface';
import { GetDirectConversationsUseCase } from '../../../../application/use-cases/chats/get-direct-conversations.use-case';
import { IUploadChatImageUseCase } from '../../../../application/interfaces/use-cases/chats/upload-chat-image.interface';
import { UploadChatImageUseCase } from '../../../../application/use-cases/chats/upload-chat-image.use-case';
import { IMarkMessagesAsReadUseCase } from '../../../../application/interfaces/use-cases/chats/mark-messages-read.interface';
import { MarkMessagesAsReadUseCase } from '../../../../application/use-cases/chats/mark-messages-read.usecase';

export function registerChatsDependency() {
  container.registerSingleton<IGetDirectChatUseCase>(
    TOKENS.IGetDirectChatUseCase,
    GetDirectChatUseCase,
  );
  container.registerSingleton<ISendChatMessageUseCase>(
    TOKENS.ISendChatMessageUseCase,
    SendChatMessageUseCase,
  );
  container.registerSingleton<IGetChatMessagesUseCase>(
    TOKENS.IGetChatMessagesUseCase,
    GetChatMessagesUseCase,
  );
  container.registerSingleton<IJoinChatConversationValidationUseCase>(
    TOKENS.IJoinChatConversationValidationUseCase,
    JoinChatConversationValidationUseCase,
  );
  container.registerSingleton<IGetDirectConversationsUseCase>(
    TOKENS.IGetDirectConversationsUseCase,
    GetDirectConversationsUseCase,
  );
  container.registerSingleton<IUploadChatImageUseCase>(
    TOKENS.IUploadChatImageUseCase,
    UploadChatImageUseCase,
  );
  container.registerSingleton<IMarkMessagesAsReadUseCase>(
    TOKENS.IMarkMessagesAsReadUseCase,
    MarkMessagesAsReadUseCase,
  );
}
