import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityBookingRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IGetUserCommunityBookingsUseCase } from '../../interfaces/use-cases/community/get-user-community-bookings.interface';
import { UserCommunityBookingResponseDTO } from '../../dtos/community/booking/response/user-community-booking-response.dto';

@injectable()
export class GetUserCommunityBookingsUseCase implements IGetUserCommunityBookingsUseCase {
  constructor(
    @inject(TOKENS.ICommunityBookingRepository)
    private readonly _bookingRepository: ICommunityBookingRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(userId: string): Promise<UserCommunityBookingResponseDTO[]> {
    const bookings = await this._bookingRepository.findByUserId(userId);

    return Promise.all(
      bookings.map(async (b) => {
        const resolvedGallery: string[] = await Promise.all(
          (b.trip.gallery || []).map(async (img: string) => {
            if (!img.startsWith('http')) {
              return this._storageService.getSignedUrl(img);
            }
            return img;
          }),
        );

        let resolvedAvatarUrl = b.trip.community?.avatarUrl;
        if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
          resolvedAvatarUrl =
            await this._storageService.getSignedUrl(resolvedAvatarUrl);
        }

        return {
          id: b.id,
          bookingCode: b.bookingCode,
          tripId: b.tripId,
          contactName: b.contactName,
          contactPhone: b.contactPhone,
          emergencyPhone: b.emergencyPhone,
          note: b.note,
          amount: b.amount,
          currency: b.currency,
          razorpayOrderId: b.razorpayOrderId,
          razorpayPaymentId: b.razorpayPaymentId,
          bookedAt: b.bookedAt,
          trip: {
            ...b.trip,
            gallery: resolvedGallery,
            community: {
              ...b.trip.community,
              avatarUrl: resolvedAvatarUrl,
            },
          },
        };
      }),
    );
  }
}
