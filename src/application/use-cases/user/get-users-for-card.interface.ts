import { inject, injectable } from 'tsyringe';
import { GetUsersForCardRequestDTO } from '../../dtos/users/request/user-card.dto';
import { UserCardDetailsResponseDTO } from '../../dtos/users/response/user-card.dto';
import { IGetUsersForCard } from '../../interfaces/use-cases/users/get-users-for-card.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
@injectable()
export class GetUsersForCard implements IGetUsersForCard {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}
  async execute(
    dto: GetUsersForCardRequestDTO,
  ): Promise<UserCardDetailsResponseDTO> {
    const { limit, page, total, users, totalPages } =
      await this._userRepository.getUsersForCard(dto.userId, {
        page: dto.page,
        limit: dto.limit,
        includeAll: dto.includeAll,
      });

    return {
      users: await Promise.all(
        users.map(async (user) => ({
          ...user,
          avatarUrl: user.avatarUrl
            ? await this._storageService.getSignedUrl(user.avatarUrl)
            : null,
          coverUrl: user.coverUrl
            ? await this._storageService.getSignedUrl(user.coverUrl)
            : null,
        })),
      ),
      limit,
      page,
      total,
      totalPages,
    };
  }
}
