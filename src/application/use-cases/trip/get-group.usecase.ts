import { inject, injectable } from 'tsyringe';
import { IGetGroup } from '../../interfaces/use-cases/trip/get-group.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { GroupData } from '../../dtos/trip/responce/get-groups.dto';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class GetGroup implements IGetGroup {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}
  async execute(dto: { groupId: string }): Promise<GroupData> {
    const group = await this._tripGroupRepository.GetGroupWithDetails(
      dto.groupId,
    );
    for (const m of group.members) {
      m.avatarUrl = await this._storageService.getSignedUrl(m.avatarUrl!);
    }
    return group;
  }
}
