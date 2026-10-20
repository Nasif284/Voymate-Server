import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IGetUsersForCard } from '../../../../application/interfaces/use-cases/users/get-users-for-card.interface';
import { Request, Response } from 'express';
import { UserNotFoundError } from '../../../../domain/errors/auth.error';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { USER_MESSAGES } from '../../../../shared/constants/messages/success/user/user.messages';
import { IGetNearbyUsers } from '../../../../application/interfaces/use-cases/users/nearby-users.interface';
import { IGetUserProfile } from '../../../../application/interfaces/use-cases/users/get-user-profile.interface';
import { IGetMe } from '../../../../application/interfaces/use-cases/users/get-me.usecase';

@injectable()
export class UsersController {
  constructor(
    @inject(TOKENS.IGetUsersForCard)
    private readonly _getUsersForCardUseCase: IGetUsersForCard,
    @inject(TOKENS.IGetNearbyUsers)
    private readonly _getNearbyUsersUseCase: IGetNearbyUsers,
    @inject(TOKENS.IGetUserProfile)
    private readonly _getUserProfileUseCase: IGetUserProfile,
    @inject(TOKENS.IGetMe)
    private readonly _getMe: IGetMe,
  ) {}

  getUsersForCard = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { page, limit } = req.query;
    if (!userId) {
      throw new UserNotFoundError();
    }
    const data = await this._getUsersForCardUseCase.execute({
      userId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FETCHED_USERS_FOR_CARD, data));
  };
  getNearbyUsers = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { page, limit, radiusKm } = req.query;
    if (!userId) {
      throw new UserNotFoundError();
    }
    const data = await this._getNearbyUsersUseCase.execute({
      userId,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 6,
      radiusKm: radiusKm ? parseInt(radiusKm as string) : 50,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FETCHED_NEARBY_USERS, data));
  };

  getUserProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const data = await this._getUserProfileUseCase.execute({
      userId: id as string,
      currentUserId,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FETCHED_USER_PROFILE, data));
  };

  getMe = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getMe.execute({
      userId: userId!,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FETCHED_USER_PROFILE, data));
  };
}
