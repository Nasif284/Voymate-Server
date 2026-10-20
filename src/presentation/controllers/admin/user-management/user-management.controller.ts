import { Request, Response } from 'express';
import { GetAllUsers } from '../../../../application/use-cases/user-management/get-users.usecase';
import { GetAllUsersRequestDTO } from '../../../../application/dtos/user-management/request/get-users.dto';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { USER_MANAGEMENT_MESSAGES } from '../../../../shared/constants/messages/success/admin/user-management';
import { inject, injectable } from 'tsyringe';
import { ChangeUserStatus } from '../../../../application/use-cases/user-management/change-user-status.usecase';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { USER_MESSAGES } from '../../../../shared/constants/messages/success/user/user.messages';
import { IGetUserProfile } from '../../../../application/interfaces/use-cases/users/get-user-profile.interface';

@injectable()
export class UserManagementController {
  constructor(
    @inject(TOKENS.IGetAllUsers)
    private readonly _getAllUsersUseCase: GetAllUsers,
    @inject(TOKENS.IChangeUserStatus)
    private readonly _changeUserStatusUseCase: ChangeUserStatus,
    @inject(TOKENS.IGetUserProfile)
    private readonly _getUserProfileUseCase: IGetUserProfile,
  ) {}

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    const payload: GetAllUsersRequestDTO = {
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
      filter: {
        status: req.query.status as string,
        joined: req.query.joined as string,
        verified: req.query.verified as string,
        search: req.query.search as string,
      },
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'desc' | 'asc',
    };
    const result = await this._getAllUsersUseCase.execute(payload);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(USER_MANAGEMENT_MESSAGES.GET_ALL_USERS, result),
      );
  };

  changeUserStatus = async (req: Request, res: Response): Promise<Response> => {
    await this._changeUserStatusUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MANAGEMENT_MESSAGES.USER_STATUS_CHANGE));
  };

  getUserProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const data = await this._getUserProfileUseCase.execute({
      userId: id as string,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FETCHED_USER_PROFILE, data));
  };
}
