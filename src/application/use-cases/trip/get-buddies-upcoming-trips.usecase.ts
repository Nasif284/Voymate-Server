import { inject, injectable } from 'tsyringe';
import { IGetBuddiesUpcomingTrips } from '../../interfaces/use-cases/trip/get-buddies-upcoming-trips.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripRepository } from '../../interfaces/repositories/trip.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  BuddyUpcomingTripDTO,
  GetBuddiesUpcomingTripsResponseDTO,
} from '../../dtos/trip/responce/get-buddies-upcoming-trips.dto';

@injectable()
export class GetBuddiesUpcomingTrips implements IGetBuddiesUpcomingTrips {
  constructor(
    @inject(TOKENS.ITripRepository)
    private readonly _tripRepository: ITripRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(userId: string): Promise<GetBuddiesUpcomingTripsResponseDTO> {
    const rawTrips = await this._tripRepository.getBuddiesUpcomingTrips(userId);

    const trips: BuddyUpcomingTripDTO[] = await Promise.all(
      rawTrips.map(async (item) => {
        const signedAvatar = item.buddy.avatarUrl
          ? await this._storageService.getSignedUrl(item.buddy.avatarUrl)
          : null;
        const signedCover = item.buddy.coverUrl
          ? await this._storageService.getSignedUrl(item.buddy.coverUrl)
          : null;
        const signedDestCover = item.destination.coverUrl
          ? await this._storageService.getSignedUrl(item.destination.coverUrl)
          : null;

        return {
          ...item,
          destination: {
            ...item.destination,
            coverUrl: signedDestCover,
          },
          buddy: {
            ...item.buddy,
            avatarUrl: signedAvatar,
            coverUrl: signedCover,
          },
        };
      }),
    );

    return { trips };
  }
}
