import axios, { AxiosInstance } from 'axios';
import { injectable } from 'tsyringe';
import { config } from '../../config/env.config';

@injectable()
export class GooglePlacesClient {
  private readonly http: AxiosInstance;

  constructor() {
    const apiKey =
      process.env.GEOCODING_API_KEY || config.geoCoding.apiKey || '';
    this.http = axios.create({
      baseURL: 'https://places.googleapis.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
    });
  }

  async searchNearby(body: object, fieldMask: string) {
    const response = await this.http.post('/places:searchNearby', body, {
      headers: {
        'X-Goog-FieldMask': fieldMask,
      },
    });
    return response.data;
  }

  async autocomplete(input: string, sessionToken?: string) {
    const body: Record<string, unknown> = { input };
    if (sessionToken) {
      body.sessionToken = sessionToken;
    }
    const response = await this.http.post('/places:autocomplete', body, {
      headers: {
        'X-Goog-FieldMask':
          'suggestions.placePrediction.place,suggestions.placePrediction.text.text',
      },
    });
    return response.data;
  }

  async getPlaceDetails(placeId: string, sessionToken?: string) {
    const cleanId = placeId.startsWith('places/')
      ? placeId.replace('places/', '')
      : placeId;
    const params = sessionToken ? { sessionToken } : undefined;
    const response = await this.http.get(`/places/${cleanId}`, {
      params,
      headers: {
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,location,addressComponents',
      },
    });
    return response.data;
  }
}
