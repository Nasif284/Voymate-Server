import { inject, injectable } from 'tsyringe';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IGetUserGroups } from '../../interfaces/use-cases/trip/get-user-groups.interface';
import { GetGroupsResponseDTO } from '../../dtos/trip/responce/get-groups.dto';

@injectable()
export class GetUserGroups implements IGetUserGroups {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
  ) {}
  async execute(dto: { userId: string }): Promise<GetGroupsResponseDTO> {
    return await this._tripGroupRepository.getUserTripGroups(dto.userId);
  }
}
