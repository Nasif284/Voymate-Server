import { CommunityTripItemResponseDTO } from '../../../dtos/community/trip/response/community-trip-item.dto';

export interface IGetOrganizerTripsUseCase {
  execute(
    communityId: string,
    page?: number,
    limit?: number,
  ): Promise<{ trips: CommunityTripItemResponseDTO[]; total: number }>;
}
