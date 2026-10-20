import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICreateTrip } from '../../../application/interfaces/use-cases/trip/create-trip.usecase';
import { Request, Response } from 'express';
import { HttpStatus } from '../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../responses/common-response';
import { TRIP_MESSAGES } from '../../../shared/constants/messages/success/trip/trip.messages';
import { IGetTripMatches } from '../../../application/interfaces/use-cases/trip/get-trip-matches.interface';
import { IGetActiveTrip } from '../../../application/interfaces/use-cases/trip/get-active-trip.interface';
import { IGetUserUpcomingTrips } from '../../../application/interfaces/use-cases/trip/get-user-upcoming-trips.interface';
import { IGetMatchProfile } from '../../../application/interfaces/use-cases/trip/get-match-profile.interface';
import { IGetPastTrips } from '../../../application/interfaces/use-cases/trip/get-past-trips.usecase';
import { IEditTrip } from '../../../application/interfaces/use-cases/trip/edit-trip.interface';
import { IDeleteTrip } from '../../../application/interfaces/use-cases/trip/delete-trip.usecase';
import { ISearchTripMatches } from '../../../application/interfaces/use-cases/trip/search-trip-matches.interface';
import { IGetBuddiesUpcomingTrips } from '../../../application/interfaces/use-cases/trip/get-buddies-upcoming-trips.interface';
import { IGetAllTripMatches } from '../../../application/interfaces/use-cases/trip/get-all-trip-matches.interface';

@injectable()
export class TripController {
  constructor(
    @inject(TOKENS.ICreateTrip)
    private readonly _createTripUseCase: ICreateTrip,
    @inject(TOKENS.IGetTripMatches)
    private readonly _getTripMatches: IGetTripMatches,
    @inject(TOKENS.IGetActiveTrip)
    private readonly _getActiveTrip: IGetActiveTrip,
    @inject(TOKENS.IGetUserUpcomingTrips)
    private readonly _getUserTrips: IGetUserUpcomingTrips,
    @inject(TOKENS.IGetMatchProfile)
    private readonly _getMatchProfile: IGetMatchProfile,
    @inject(TOKENS.IGetPastTrips)
    private readonly _getPastTrips: IGetPastTrips,
    @inject(TOKENS.IEditTrip)
    private readonly _editTrip: IEditTrip,
    @inject(TOKENS.IDeleteTrip)
    private readonly _deleteTrip: IDeleteTrip,
    @inject(TOKENS.ISearchTripMatches)
    private readonly _searchTripMatches: ISearchTripMatches,
    @inject(TOKENS.IGetBuddiesUpcomingTrips)
    private readonly _getBuddiesUpcomingTrips: IGetBuddiesUpcomingTrips,
    @inject(TOKENS.IGetAllTripMatches)
    private readonly _getAllTripMatches: IGetAllTripMatches,
  ) {}

  createTrip = async (req: Request, res: Response): Promise<Response> => {
    const {
      name,
      destinationName,
      placeId,
      city,
      state,
      countryCode,
      latitude,
      longitude,
      dateFrom,
      dateTo,
      budgetStyleCode,
      budgetStyle,
      travelStyleCode,
    } = req.body;
    const userId = req.user?.userId;
    await this._createTripUseCase.execute({
      userId: userId!,
      name,
      destinationName,
      placeId,
      city,
      state,
      countryCode,
      latitude,
      longitude,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      budgetStyle: budgetStyleCode || budgetStyle,
      travelStyleCode,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(TRIP_MESSAGES.TRIP_CREATED));
  };

  searchTripMatches = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    const {
      destinationName,
      city,
      state,
      countryCode,
      dateFrom,
      dateTo,
      travelStyle,
      budgetStyle,
      page,
      limit,
    } = req.query;

    const data = await this._searchTripMatches.execute({
      userId: userId!,
      destinationName: destinationName as string,
      city: city as string,
      state: state as string,
      countryCode: countryCode as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      travelStyle: travelStyle as string,
      budgetStyle: budgetStyle as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 6,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_TRIP_MATCHES, data));
  };

  getTripMatches = async (req: Request, res: Response): Promise<Response> => {
    const { tripId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await this._getTripMatches.execute({
      tripId: tripId as string,
      page,
      limit,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_TRIP_MATCHES, data));
  };

  getAllTripMatches = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const data = await this._getAllTripMatches.execute({
      userId: userId!,
      page,
      limit,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_TRIP_MATCHES, data));
  };

  getActiveTrip = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getActiveTrip.execute({ userId: userId! });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_ACTIVE_TRIP, data));
  };

  getUserTrips = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getUserTrips.execute({ userId: userId! });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_USER_TRIPS, data));
  };

  getMatchProfile = async (req: Request, res: Response): Promise<Response> => {
    const { matchId } = req.params;
    const userId = req.user?.userId;
    const data = await this._getMatchProfile.execute({
      matchId: matchId as string,
      userId: userId!,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_MATCH_PROFILE, data));
  };

  getUpcomingTrip = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.params.id;
    const data = await this._getUserTrips.execute({ userId: userId as string });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_USER_TRIPS, data));
  };

  getPastTrip = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.params.id;
    const data = await this._getPastTrips.execute({ userId: userId as string });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_USER_TRIPS, data));
  };

  getUserPastTrip = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getPastTrips.execute({ userId: userId as string });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_USER_TRIPS, data));
  };

  editTrip = async (req: Request, res: Response): Promise<Response> => {
    const tripId = req.params.id;
    await this._editTrip.execute({
      tripId: tripId as string,
      ...req.body,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.EDITED_TRIP_PLAN));
  };

  deleteTrip = async (req: Request, res: Response): Promise<Response> => {
    const tripId = req.params.id;
    await this._deleteTrip.execute({
      tripId: tripId as string,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.DELETED_TRIP_PLAN));
  };

  getBuddiesUpcomingTrips = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getBuddiesUpcomingTrips.execute(userId as string);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(TRIP_MESSAGES.FETCHED_TRIP_MATCHES, data));
  };
}
