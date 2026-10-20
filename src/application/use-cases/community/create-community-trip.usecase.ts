import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICommunityRepository,
  ICommunityTripRepository,
} from '../../interfaces/repositories/community.repository';
import { IImageService } from '../../interfaces/services/image.service.interace';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { ICreateCommunityTripUseCase } from '../../interfaces/use-cases/community/create-community-trip.interface';
import { CreateCommunityTripRequestDTO } from '../../dtos/community/trip/request/create-community-trip.dto';
import { CommunityTripItemResponseDTO } from '../../dtos/community/trip/response/community-trip-item.dto';
import {
  CommunityNotFoundError,
  InvalidTripDatesError,
  CommunityEmailNotVerifiedError,
  InvalidTripPriceError,
} from '../../../domain/errors/community.error';
import { CommunityTripPricingType } from '../../../domain/enums/community.constants';
import { slugify } from '../../../shared/helpers/slugify';

@injectable()
export class CreateCommunityTripUseCase implements ICreateCommunityTripUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.IImageService)
    private readonly _imageService: IImageService,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    dto: CreateCommunityTripRequestDTO,
  ): Promise<CommunityTripItemResponseDTO> {
    const community = await this._communityRepository.findById(dto.communityId);
    if (!community || community.deletedAt !== null) {
      throw new CommunityNotFoundError();
    }

    if (!community.isEmailVerified) {
      throw new CommunityEmailNotVerifiedError();
    }

    const numericPrice =
      dto.price !== undefined && dto.price !== null && !isNaN(Number(dto.price))
        ? Number(dto.price)
        : undefined;

    if (
      dto.pricingType === CommunityTripPricingType.PAID &&
      (numericPrice === undefined || numericPrice <= 0)
    ) {
      throw new InvalidTripPriceError();
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);

    if (
      isNaN(dateFrom.getTime()) ||
      isNaN(dateTo.getTime()) ||
      dateFrom >= dateTo
    ) {
      throw new InvalidTripDatesError();
    }

    if (dateFrom.getTime() < now.getTime()) {
      throw new InvalidTripDatesError('Trip start date cannot be in the past.');
    }

    const rawSlug = slugify(dto.title);
    const baseSlug =
      rawSlug.length > 0 ? rawSlug : `trip-${crypto.randomUUID().slice(0, 8)}`;
    let slug = baseSlug;
    let counter = 1;
    while (await this._tripRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const galleryKeys: string[] = [];

    if (dto.galleryFiles && dto.galleryFiles.length > 0) {
      for (const file of dto.galleryFiles) {
        const key = `community-trips/gallery/${crypto.randomUUID()}`;
        await this._storageService.upload(
          file.buffer,
          key,
          file.mimeType || 'image/jpeg',
        );
        galleryKeys.push(key);
      }
    }

    if (dto.galleryUrls && dto.galleryUrls.length > 0) {
      galleryKeys.push(...dto.galleryUrls);
    }

    if (galleryKeys.length === 0) {
      try {
        const unsplashPhoto = await this._imageService.getDestinationCover(
          dto.destinationName,
        );
        if (unsplashPhoto) {
          galleryKeys.push(unsplashPhoto);
        }
      } catch (err) {
        console.error('Failed to fetch cover from unsplash:', err);
      }
    }

    const trip = await this._tripRepository.create({
      communityId: dto.communityId,
      title: dto.title.trim(),
      slug,
      category: dto.category,
      pricingType: dto.pricingType,
      price:
        dto.pricingType === CommunityTripPricingType.FREE
          ? null
          : (numericPrice ?? null),
      currency: dto.currency || 'INR',
      priceNote: dto.priceNote?.trim() || null,
      destinationName: dto.destinationName.trim(),
      city: dto.city.trim(),
      state: dto.state.trim(),
      country: dto.country?.trim() || 'India',
      dateFrom,
      dateTo,
      durationText: dto.durationText.trim(),
      maxCapacity: Number(dto.maxCapacity),
      description: dto.description.trim(),
      itinerary: dto.itinerary.trim(),
      gallery: galleryKeys,
      inclusions: dto.inclusions?.trim() || null,
      exclusions: dto.exclusions?.trim() || null,
    });

    await this._communityRepository.incrementTotalTripsCount(dto.communityId);

    const resolvedGallery: string[] = await Promise.all(
      (trip.gallery || []).map(async (img: string) => {
        if (!img.startsWith('http')) {
          return this._storageService.getSignedUrl(img);
        }
        return img;
      }),
    );

    let resolvedAvatarUrl = community.avatarUrl;
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
        id: community.id,
        name: community.name,
        slug: community.slug,
        avatarUrl: resolvedAvatarUrl,
        isVerified: community.isVerified,
        rating: Number(community.rating),
        city: community.city,
        state: community.state,
      },
      createdAt: trip.createdAt,
    };
  }
}
