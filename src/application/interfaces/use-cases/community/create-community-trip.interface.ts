import { CreateCommunityTripRequestDTO } from '../../../dtos/community/trip/request/create-community-trip.dto';
import { CommunityTripItemResponseDTO } from '../../../dtos/community/trip/response/community-trip-item.dto';

export interface ICreateCommunityTripUseCase {
  execute(
    dto: CreateCommunityTripRequestDTO,
  ): Promise<CommunityTripItemResponseDTO>;
}
