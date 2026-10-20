import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityTripRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IListCommunityTripsUseCase } from '../../interfaces/use-cases/community/list-community-trips.interface';
import { ListCommunityTripsRequestDTO } from '../../dtos/community/trip/request/list-community-trips.dto';
import { ListCommunityTripsResponseDTO } from '../../dtos/community/trip/response/list-community-trips.dto';

@injectable()
export class ListCommunityTripsUseCase implements IListCommunityTripsUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    dto: ListCommunityTripsRequestDTO,
  ): Promise<ListCommunityTripsResponseDTO> {
    const sanitizedDto: ListCommunityTripsRequestDTO = {
      ...dto,
      page: dto.page && dto.page > 0 ? dto.page : 1,
      limit: dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 12,
    };

    const { trips, total } =
      await this._tripRepository.findManyWithFilters(sanitizedDto);

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

    return {
      trips: mappedTrips,
      total,
    };
  }
}
