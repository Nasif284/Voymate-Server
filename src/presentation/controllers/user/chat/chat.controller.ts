import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IGetDirectChatUseCase } from '../../../../application/interfaces/use-cases/chats/get-direct-chat.interface';
import { ISendChatMessageUseCase } from '../../../../application/interfaces/use-cases/chats/send-message.interface';
import { IGetChatMessagesUseCase } from '../../../../application/interfaces/use-cases/chats/get-messages.interface';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { IGetDirectConversationsUseCase } from '../../../../application/interfaces/use-cases/chats/get-direct-conversations.interface';
import { IUploadChatImageUseCase } from '../../../../application/interfaces/use-cases/chats/upload-chat-image.interface';

@injectable()
export class ChatController {
  constructor(
    @inject(TOKENS.IGetDirectChatUseCase)
    private readonly _getDirectChat: IGetDirectChatUseCase,
    @inject(TOKENS.ISendChatMessageUseCase)
    private readonly _sendMessage: ISendChatMessageUseCase,
    @inject(TOKENS.IGetChatMessagesUseCase)
    private readonly _getMessages: IGetChatMessagesUseCase,
    @inject(TOKENS.IGetDirectConversationsUseCase)
    private readonly _getConversations: IGetDirectConversationsUseCase,
    @inject(TOKENS.IUploadChatImageUseCase)
    private readonly _uploadChatImageUseCase: IUploadChatImageUseCase,
  ) {}

  getDirectChat = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { userId: otherUserId } = req.params;
    const conversationId = await this._getDirectChat.execute(
      userId!,
      otherUserId as string,
    );
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Fetched Conversation', { conversationId }));
  };

  getMessages = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    const { limit, cursor } = req.query;

    const messages = await this._getMessages.execute(
      userId!,
      conversationId as string,
      limit ? parseInt(limit as string) : undefined,
      cursor as string | undefined,
    );
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Fetched Messages', { messages }));
  };

  getDirectConversations = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    const conversations = await this._getConversations.execute(userId!);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Fetched Conversations', { conversations }));
  };

  uploadImage = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const conversationId =
      (req.body.conversationId as string) ||
      (req.params.conversationId as string);
    const file = req.file;

    if (!file) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('BAD_REQUEST', 'Image file is required.'));
    }

    if (!conversationId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('BAD_REQUEST', 'Conversation ID is required.'));
    }

    const result = await this._uploadChatImageUseCase.execute(
      userId!,
      conversationId,
      file,
    );

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success('Image uploaded successfully', result));
  };
}
