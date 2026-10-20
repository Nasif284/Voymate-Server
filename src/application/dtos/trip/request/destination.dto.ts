export interface Destination {
  id: string;
  placeId: string;
  name: string;
  city: string | null;
  state: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  coverUrl: string | null;
}

export interface CreateDestinationRequestDTO {
  placeId: string;
  name: string;
  city?: string | null;
  state?: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
  coverUrl: string | null;
}
