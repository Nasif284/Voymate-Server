import { inject, injectable } from 'tsyringe';
import { IGetUserProfile } from '../../interfaces/use-cases/users/get-user-profile.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { GetUserProfileResponseDTO } from '../../dtos/users/response/user-profile.dto';
import { RelationshipInfo } from '../../dtos/users/response/user-card.dto';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class GetUserProfile implements IGetUserProfile {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(dto: {
    userId: string;
    currentUserId?: string;
  }): Promise<GetUserProfileResponseDTO> {
    const [user, relationships] = await Promise.all([
      this._userRepository.getUserWithDetails(dto.userId),
      dto.currentUserId && dto.currentUserId !== dto.userId
        ? this._userRepository.getRelationshipsForUsers(dto.currentUserId, [
            dto.userId,
          ])
        : Promise.resolve<Record<string, RelationshipInfo>>({}),
    ]);

    const rel = relationships[dto.userId];

    return {
      ...user,
      avatarUrl: user.avatarUrl
        ? await this._storageService.getSignedUrl(user.avatarUrl)
        : null,
      coverUrl: user.coverUrl
        ? await this._storageService.getSignedUrl(user.coverUrl)
        : null,
      connectionStatus: rel?.connectionStatus ?? 'NONE',
      connectionId: rel?.connectionId ?? null,
      requestId: rel?.requestId ?? null,
      match: null,
    };
  }
}
