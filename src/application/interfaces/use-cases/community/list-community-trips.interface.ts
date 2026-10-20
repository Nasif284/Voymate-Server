import { ListCommunityTripsRequestDTO } from '../../../dtos/community/trip/request/list-community-trips.dto';
import { ListCommunityTripsResponseDTO } from '../../../dtos/community/trip/response/list-community-trips.dto';

export interface IListCommunityTripsUseCase {
  execute(
    dto: ListCommunityTripsRequestDTO,
  ): Promise<ListCommunityTripsResponseDTO>;
}
