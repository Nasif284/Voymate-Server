import { GetMatchProfileResponseDTO } from '../../../dtos/trip/responce/get-match-profile.dto';

export interface IGetMatchProfile {
  execute(dto: {
    matchId: string;
    userId: string;
    sourceTripId?: string;
    mode?: 'TRIP' | 'SEARCH';
  }): Promise<GetMatchProfileResponseDTO>;
}
