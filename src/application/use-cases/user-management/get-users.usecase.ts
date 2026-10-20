import { inject, injectable } from 'tsyringe';
import { GetAllUsersRequestDTO } from '../../dtos/user-management/request/get-users.dto';
import { GetAllUserResponseDTO } from '../../dtos/user-management/response/get-users.dto';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { IGetUsers } from '../../interfaces/use-cases/user-management/get-users.interface';
import { UserNotFoundError } from '../../../domain/errors/auth.error';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { formatAccountStatusDisplayName } from '../../../shared/helpers/enum-formatter.helper';

@injectable()
export class GetAllUsers implements IGetUsers {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}
  async execute(dto: GetAllUsersRequestDTO): Promise<GetAllUserResponseDTO> {
    const result = await this._userRepository.getAllUsers(dto);
    if (!result) {
      throw new UserNotFoundError();
    }
    const totalPages = Math.ceil(result.count / dto.limit);
    const users = await Promise.all(
      result.users.map(async (u) => {
        const avatarUrl = u.avatarUrl
          ? await this._storageService.getSignedUrl(u.avatarUrl)
          : null;
        return {
          ...u,
          avatarUrl,
          accountStatusCode: formatAccountStatusDisplayName(
            u.accountStatusCode,
          ),
        };
      }),
    );
    return {
      users,
      limit: dto.limit,
      page: dto.page,
      total: result.count,
      totalPages,
    };
  }
}
