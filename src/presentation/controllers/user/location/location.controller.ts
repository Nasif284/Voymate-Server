import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { Request, Response } from 'express';
import { IUpdateUserLocation } from '../../../../application/interfaces/use-cases/location/update-location.interace';
import { UserNotFoundError } from '../../../../domain/errors/auth.error';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { LOCATION_MESSAGES } from '../../../../shared/constants/messages/success/user/location.messages';
import { IGetLocation } from '../../../../application/interfaces/use-cases/location/get-location.interface';
import { IReverseGeoCode } from '../../../../application/interfaces/use-cases/location/reverse-geocode.interface';
import { GooglePlacesClient } from '../../../../infrastructure/services/google-places-client.service';
import { Country, State, City } from 'country-state-city';

@injectable()
export class LocationController {
  constructor(
    @inject(TOKENS.IUpdateLocation)
    private readonly _updateLocationUseCase: IUpdateUserLocation,
    @inject(TOKENS.IGetLocation)
    private readonly _getLocationUseCase: IGetLocation,
    @inject(TOKENS.IReverseGeoCode)
    private readonly _reverseGeoCodeUseCase: IReverseGeoCode,
    @inject(TOKENS.GooglePlacesClient)
    private readonly _placesClient: GooglePlacesClient,
  ) {}

  updateLocation = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { latitude, longitude } = req.body;
    if (!userId) {
      throw new UserNotFoundError();
    }
    await this._updateLocationUseCase.execute({ userId, latitude, longitude });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(LOCATION_MESSAGES.LOCATION_UPDATED));
  };
  getLocation = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UserNotFoundError();
    }
    const { city, country, district, state } =
      await this._getLocationUseCase.execute({
        userId,
      });
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(LOCATION_MESSAGES.LOCATION_FETCHED, {
        city,
        country,
        district,
        state,
      }),
    );
  };
  reverseGeoCode = async (req: Request, res: Response): Promise<Response> => {
    const { latitude, longitude } = req.body;
    const data = await this._reverseGeoCodeUseCase.execute({
      latitude,
      longitude,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(LOCATION_MESSAGES.LOCATION_FETCHED, data));
  };

  placesAutocomplete = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { input, sessionToken } = req.body;
    if (!input || typeof input !== 'string' || input.trim().length < 2) {
      return res
        .status(HttpStatus.OK)
        .json(ApiResponse.success('Suggestions fetched', []));
    }
    const data = await this._placesClient.autocomplete(
      input.trim(),
      sessionToken,
    );
    const suggestions = (data?.suggestions || []).map((s: any) => {
      const placeId = s.placePrediction?.place || '';
      const cleanId = placeId.startsWith('places/')
        ? placeId.replace('places/', '')
        : placeId;
      return {
        placeId: cleanId,
        displayName: s.placePrediction?.text?.text || '',
      };
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Suggestions fetched', suggestions));
  };

  getPlaceDetails = async (req: Request, res: Response): Promise<Response> => {
    const placeId = req.params.placeId || req.body?.placeId;
    const sessionToken =
      (req.query.sessionToken as string) || (req.body?.sessionToken as string);
    if (!placeId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('INVALID_INPUT', 'Place ID is required'));
    }
    const data = await this._placesClient.getPlaceDetails(
      placeId,
      sessionToken,
    );
    if (!data?.id) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(ApiResponse.error('NOT_FOUND', 'Place not found'));
    }

    const components = data.addressComponents || [];
    const city =
      components.find((c: any) => c.types?.includes('locality'))?.longText ||
      components.find((c: any) =>
        c.types?.includes('administrative_area_level_2'),
      )?.longText ||
      null;

    const state =
      components.find((c: any) =>
        c.types?.includes('administrative_area_level_1'),
      )?.longText || null;

    const country =
      components.find((c: any) => c.types?.includes('country'))?.longText ||
      null;

    const countryCode =
      components.find((c: any) => c.types?.includes('country'))?.shortText ||
      'IN';

    const placeDetails = {
      placeId: data.id,
      displayName:
        data.displayName?.text || data.formattedAddress?.split(',')[0] || '',
      formattedAddress: data.formattedAddress || '',
      city,
      state,
      country,
      countryCode,
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
    };

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Place details fetched', placeDetails));
  };

  getCountries = async (_req: Request, res: Response): Promise<Response> => {
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    const countries = Country.getAllCountries().map((c) => ({
      code: c.isoCode,
      name: c.name,
      flag: c.flag || '',
    }));
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Countries fetched', countries));
  };

  getStates = async (req: Request, res: Response): Promise<Response> => {
    const countryCode = (req.query.countryCode as string) || '';
    if (!countryCode) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'INVALID_PARAM',
            'countryCode query parameter is required',
          ),
        );
    }
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    const states = State.getStatesOfCountry(countryCode.toUpperCase()).map(
      (s) => ({
        code: s.isoCode,
        name: s.name,
      }),
    );
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('States fetched', states));
  };

  getCities = async (req: Request, res: Response): Promise<Response> => {
    const countryCode = (req.query.countryCode as string) || '';
    const stateCode = (req.query.stateCode as string) || '';
    if (!countryCode || !stateCode) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'INVALID_PARAM',
            'countryCode and stateCode query parameters are required',
          ),
        );
    }
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    const cities = City.getCitiesOfState(
      countryCode.toUpperCase(),
      stateCode.toUpperCase(),
    ).map((c) => c.name);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Cities fetched', cities));
  };
}
