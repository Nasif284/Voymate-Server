import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityTripRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IGetOrganizerTripsUseCase } from '../../interfaces/use-cases/community/get-organizer-trips.interface';
import { CommunityTripItemResponseDTO } from '../../dtos/community/trip/response/community-trip-item.dto';

@injectable()
export class GetOrganizerTripsUseCase implements IGetOrganizerTripsUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    communityId: string,
    page?: number,
    limit?: number,
  ): Promise<{ trips: CommunityTripItemResponseDTO[]; total: number }> {
    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 ? Math.min(limit, 100) : 10;

    const { trips, total } = await this._tripRepository.findByCommunityId(
      communityId,
      pageNum,
      limitNum,
    );

    const mappedTrips = await Promise.all(
      trips.map(async (t) => {
        const resolvedGallery: string[] = await Promise.all(
          (t.gallery || []).map(async (img: string) => {
            if (!img.startsWith('http')) {
              return this._storageService.getSignedUrl(img);
            }
            return img;
          }),
        );

        let resolvedAvatarUrl = t.community?.avatarUrl;
        if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
          resolvedAvatarUrl =
            await this._storageService.getSignedUrl(resolvedAvatarUrl);
        }

        return {
          id: t.id,
          title: t.title,
          slug: t.slug,
          category: t.category,
          pricingType: t.pricingType,
          price: t.price ? Number(t.price) : null,
          currency: t.currency,
          priceNote: t.priceNote,
          destinationName: t.destinationName,
          city: t.city,
          state: t.state,
          country: t.country,
          dateFrom: t.dateFrom,
          dateTo: t.dateTo,
          durationText: t.durationText,
          maxCapacity: t.maxCapacity,
          joinedCount: t.joinedCount,
          description: t.description,
          itinerary: t.itinerary,
          gallery: resolvedGallery,
          coverImage: resolvedGallery[0] || null,
          inclusions: t.inclusions,
          exclusions: t.exclusions,
          status: t.status,
          community: {
            id: t.community.id,
            name: t.community.name,
            slug: t.community.slug,
            avatarUrl: resolvedAvatarUrl,
            isVerified: t.community.isVerified,
            rating: Number(t.community.rating),
            city: t.community.city,
            state: t.community.state,
          },
          createdAt: t.createdAt,
        };
      }),
    );

    return { trips: mappedTrips, total };
  }
}
