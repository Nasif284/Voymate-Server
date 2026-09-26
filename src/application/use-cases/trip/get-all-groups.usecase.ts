import { inject, injectable } from 'tsyringe';
import { IGetAllTripGroups } from '../../interfaces/use-cases/trip/get-all-groups.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { GetGroupsResponseDTO } from '../../dtos/trip/responce/get-groups.dto';
import { GetGroupsRequestDTO } from '../../dtos/trip/request/get-all-groups.dto';

@injectable()
export class GetAllTripGroups implements IGetAllTripGroups {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
  ) {}
  async execute(dto: GetGroupsRequestDTO): Promise<GetGroupsResponseDTO> {
    return await this._tripGroupRepository.getAllTripGroups(dto);
  }
}
