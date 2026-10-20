import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICommunityBookingRepository,
  ICommunityTripRepository,
} from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IGetTripBookingsUseCase } from '../../interfaces/use-cases/community/get-trip-bookings.interface';
import { TripBookingAttendeeResponseDTO } from '../../dtos/community/booking/response/trip-booking-attendee-response.dto';
import {
  CommunityTripNotFoundError,
  UnauthorizedCommunityAccessError,
} from '../../../domain/errors/community.error';

@injectable()
export class GetTripBookingsUseCase implements IGetTripBookingsUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.ICommunityBookingRepository)
    private readonly _bookingRepository: ICommunityBookingRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(params: {
    communityId: string;
    tripId: string;
  }): Promise<TripBookingAttendeeResponseDTO[]> {
    const trip = await this._tripRepository.findById(params.tripId);
    if (!trip || trip.deletedAt !== null) {
      throw new CommunityTripNotFoundError();
    }

    if (trip.communityId !== params.communityId) {
      throw new UnauthorizedCommunityAccessError();
    }

    const bookings = await this._bookingRepository.findByTripId(params.tripId);

    return Promise.all(
      bookings.map(async (b) => {
        let resolvedAvatarUrl = b.user?.avatarUrl;
        if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
          resolvedAvatarUrl =
            await this._storageService.getSignedUrl(resolvedAvatarUrl);
        }

        return {
          id: b.id,
          bookingCode: b.bookingCode,
          contactName: b.contactName,
          contactPhone: b.contactPhone,
          emergencyPhone: b.emergencyPhone,
          note: b.note,
          amount: b.amount,
          currency: b.currency,
          bookedAt: b.bookedAt,
          user: {
            ...b.user,
            avatarUrl: resolvedAvatarUrl,
          },
        };
      }),
    );
  }
}
