import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityTripRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IGetCommunityTripDetailUseCase } from '../../interfaces/use-cases/community/get-community-trip-detail.interface';
import { CommunityTripItemResponseDTO } from '../../dtos/community/trip/response/community-trip-item.dto';

import { CommunityTripNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class GetCommunityTripDetailUseCase implements IGetCommunityTripDetailUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(slugOrId: string): Promise<CommunityTripItemResponseDTO> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        slugOrId,
      );

    const trip = isUuid
      ? await this._tripRepository.findById(slugOrId)
      : await this._tripRepository.findBySlug(slugOrId);

    if (!trip || trip.deletedAt !== null) {
      throw new CommunityTripNotFoundError();
    }

    const resolvedGallery: string[] = await Promise.all(
      (trip.gallery || []).map(async (img: string) => {
        if (!img.startsWith('http')) {
          return this._storageService.getSignedUrl(img);
        }
        return img;
      }),
    );

    let resolvedAvatarUrl = trip.community?.avatarUrl;
    if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
      resolvedAvatarUrl =
        await this._storageService.getSignedUrl(resolvedAvatarUrl);
    }

    return {
      id: trip.id,
      title: trip.title,
      slug: trip.slug,
      category: trip.category,
      pricingType: trip.pricingType,
      price: trip.price ? Number(trip.price) : null,
      currency: trip.currency,
      priceNote: trip.priceNote,
      destinationName: trip.destinationName,
      city: trip.city,
      state: trip.state,
      country: trip.country,
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      durationText: trip.durationText,
      maxCapacity: trip.maxCapacity,
      joinedCount: trip.joinedCount,
      description: trip.description,
      itinerary: trip.itinerary,
      gallery: resolvedGallery,
      coverImage: resolvedGallery[0] || null,
      inclusions: trip.inclusions,
      exclusions: trip.exclusions,
      status: trip.status,
      community: {
        id: trip.community.id,
        name: trip.community.name,
        slug: trip.community.slug,
        avatarUrl: resolvedAvatarUrl,
        isVerified: trip.community.isVerified,
        rating: Number(trip.community.rating),
        city: trip.community.city,
        state: trip.community.state,
      },
      createdAt: trip.createdAt,
    };
  }
}
