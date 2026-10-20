import { inject, injectable } from 'tsyringe';
import { IJoinChatConversationValidationUseCase } from '../../interfaces/use-cases/chats/join-conversation-validation.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IChatRepository } from '../../interfaces/repositories/chat.repository';

@injectable()
export class JoinChatConversationValidationUseCase implements IJoinChatConversationValidationUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string): Promise<void> {
    const conversation =
      await this.chatRepository.getConversation(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found.');
    }

    const isMember = await this.chatRepository.isDirectConversationMember(
      conversationId,
      userId,
    );

    if (!isMember) {
      throw new Error('You are not a member of this conversation.');
    }
  }
}
