import { DirectConversationDTO } from '../../dtos/chat/response/get-direct-conversations.dto';

export interface ChatMessageDTO {
  id: string;
  conversationId: string;
  senderId: string;

  type: 'TEXT' | 'IMAGE';

  content: string;

  status: 'SENT' | 'DELIVERED' | 'READ';
  readAt?: Date | null;

  attachment?: {
    storageKey: string;
    fileName: string | null;
    mimeType: string;
    fileSize: number | null;
    url?: string;
  } | null;

  sender?: {
    fullName: string;
    avatarUrl: string | null;
  };

  createdAt: Date;
  updatedAt: Date;
}
export interface SaveChatMessageDTO {
  type: 'TEXT' | 'IMAGE';

  content?: string;

  attachment?: {
    storageKey: string;
    fileName?: string;
    mimeType: string;
    fileSize: number;
  };
}
export interface IChatRepository {
  findDirectConversation(
    userId: string,
    otherUserId: string,
  ): Promise<string | null>;

  createDirectConversation(
    userId: string,
    otherUserId: string,
  ): Promise<string>;

  getConversation(conversationId: string): Promise<{
    id: string;
    type: string;
    userAId: string | null;
    userBId: string | null;
  } | null>;

  isDirectConversationMember(
    conversationId: string,
    userId: string,
  ): Promise<boolean>;

  saveMessage(
    conversationId: string,
    senderId: string,
    data: SaveChatMessageDTO,
  ): Promise<ChatMessageDTO>;

  getMessages(
    conversationId: string,
    limit: number,
    cursor?: string,
  ): Promise<ChatMessageDTO[]>;
  getDirectConversations(userId: string): Promise<DirectConversationDTO[]>;

  markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<{ count: number; readAt: Date }>;
}
