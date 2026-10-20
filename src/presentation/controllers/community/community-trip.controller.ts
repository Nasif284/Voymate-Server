import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICreateCommunityTripUseCase,
  IListCommunityTripsUseCase,
  IGetCommunityTripDetailUseCase,
  IGetOrganizerTripsUseCase,
} from '../../../application/interfaces/use-cases/community';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../domain/enums/community.constants';
import { HttpStatus } from '../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../responses/common-response';
import { COMMUNITY_MESSAGES } from '../../../shared/constants/messages/success/community/community.messages';

import {
  UnauthorizedCommunityAccessError,
  CommunityTripNotFoundError,
} from '../../../domain/errors/community.error';

@injectable()
export class CommunityTripController {
  constructor(
    @inject(TOKENS.ICreateCommunityTrip)
    private readonly _createTripUseCase: ICreateCommunityTripUseCase,
    @inject(TOKENS.IListCommunityTrips)
    private readonly _listTripsUseCase: IListCommunityTripsUseCase,
    @inject(TOKENS.IGetCommunityTripDetail)
    private readonly _getTripDetailUseCase: IGetCommunityTripDetailUseCase,
    @inject(TOKENS.IGetOrganizerTrips)
    private readonly _getOrganizerTripsUseCase: IGetOrganizerTripsUseCase,
  ) {}

  createTrip = async (req: Request, res: Response): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      throw new UnauthorizedCommunityAccessError();
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      for (const file of files) {
        if (!allowedMimes.includes(file.mimetype)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: `Invalid file format for ${file.originalname}. Only JPG, PNG, and WEBP images are allowed.`,
            },
          });
        }
        if (file.size > maxFileSize) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `Image ${file.originalname} exceeds the 5MB size limit.`,
            },
          });
        }
      }
    }

    const galleryFiles =
      files && files.length > 0
        ? files.map((file) => ({
            buffer: file.buffer,
            mimeType: file.mimetype,
          }))
        : undefined;

    const trip = await this._createTripUseCase.execute({
      ...req.body,
      maxCapacity: Number(req.body.maxCapacity),
      price:
        req.body.price !== undefined &&
        req.body.price !== null &&
        req.body.price !== ''
          ? Number(req.body.price)
          : undefined,
      communityId,
      galleryFiles,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.TRIP_CREATED, trip));
  };

  listTrips = async (req: Request, res: Response): Promise<Response> => {
    const {
      category,
      pricingType,
      destination,
      status,
      communityId,
      page,
      limit,
    } = req.query;

    const typedCategory =
      typeof category === 'string' &&
      Object.values(CommunityTripCategory).includes(
        category as CommunityTripCategory,
      )
        ? (category as CommunityTripCategory)
        : undefined;

    const typedPricingType =
      typeof pricingType === 'string' &&
      Object.values(CommunityTripPricingType).includes(
        pricingType as CommunityTripPricingType,
      )
        ? (pricingType as CommunityTripPricingType)
        : undefined;

    const typedStatus =
      typeof status === 'string' &&
      Object.values(CommunityTripStatus).includes(status as CommunityTripStatus)
        ? (status as CommunityTripStatus)
        : undefined;

    const result = await this._listTripsUseCase.execute({
      category: typedCategory,
      pricingType: typedPricingType,
      destination: typeof destination === 'string' ? destination : undefined,
      status: typedStatus,
      communityId: typeof communityId === 'string' ? communityId : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.TRIPS_LISTED, result));
  };

  getTripDetail = async (req: Request, res: Response): Promise<Response> => {
    const slugOrId = req.params.slugOrId as string;
    if (!slugOrId || slugOrId.trim().length === 0) {
      throw new CommunityTripNotFoundError();
    }
    const trip = await this._getTripDetailUseCase.execute(slugOrId.trim());

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.TRIP_FETCHED, trip));
  };

  getOrganizerTrips = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      throw new UnauthorizedCommunityAccessError();
    }
    const { page, limit } = req.query;

    const result = await this._getOrganizerTripsUseCase.execute(
      communityId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.TRIPS_LISTED, result));
  };
}
