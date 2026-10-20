import { CommunityTripItemResponseDTO } from '../../../dtos/community/trip/response/community-trip-item.dto';

export interface IGetCommunityTripDetailUseCase {
  execute(slugOrId: string): Promise<CommunityTripItemResponseDTO>;
}
