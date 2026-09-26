import { inject, injectable } from 'tsyringe';
import { IGenerateAiItineraryUseCase } from '../../interfaces/use-cases/itenary/generate-ai-itinerary.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  GroupTripForAI,
  ITripGroupRepository,
} from '../../interfaces/repositories/trip-group.repository';
import { IAiItineraryService } from '../../interfaces/services/ai-itinerary.service.interface';
import { GenerateAiItineraryRequestDTO } from '../../dtos/itenary/request/generate-ai-itinerary.dto';

import { TripPlanningContext } from '../../dtos/itenary/request/ai-itinery-trip-context.dto';
import { GeneratedItinerary } from '../../dtos/itenary/response/ai-itinerary-result.dto';

@injectable()
export class GenerateAiItineraryUseCase implements IGenerateAiItineraryUseCase {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly tripGroupRepository: ITripGroupRepository,

    @inject(TOKENS.IAiItineraryService)
    private readonly aiItineraryService: IAiItineraryService,
  ) {}
  async execute(
    request: GenerateAiItineraryRequestDTO,
  ): Promise<GeneratedItinerary> {
    const trip = await this.tripGroupRepository.getGroupTrip(request.groupId);

    if (!trip) {
      throw new Error('Trip not found.');
    }

    const context = this.buildTripPlanningContext(trip, request);
    return await this.aiItineraryService.generate(context);
  }
  private buildTripPlanningContext(
    trip: GroupTripForAI,
    request: GenerateAiItineraryRequestDTO,
  ): TripPlanningContext {
    return {
      destination: {
        placeId: trip.destination.placeId,
        name: trip.destination.name,
        city: trip.destination.city,
        state: trip.destination.state,
        country: trip.destination.country,
        latitude: trip.destination.latitude,
        longitude: trip.destination.longitude,
      },

      trip: {
        startDate: this.formatDate(trip.startDate),
        endDate: this.formatDate(trip.endDate),
        travellers: trip.travellers,
      },

      preferences: {
        tripPace: request.tripPace,
        budgetStyle: trip.budgetStyle,
        travelStyle: trip.travelStyle,
        interests: request.interests,
      },

      notes: request.notes,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
