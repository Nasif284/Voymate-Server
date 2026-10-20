import { container } from 'tsyringe';
import { TOKENS } from '../../tokens';
import { CreateTrip } from '../../../../application/use-cases/trip/create-trip.usecase';
import { CalculateMatch } from '../../../../application/use-cases/trip/calculate-match.usecase';
import { GetTripMatches } from '../../../../application/use-cases/trip/get-matches.usecase';
import { GetActiveTrip } from '../../../../application/use-cases/trip/get-active-trip.usecase';
import { GetUserUpcomingTrips } from '../../../../application/use-cases/trip/get-upcoming-trips.usecase';
import { GetMatchProfile } from '../../../../application/use-cases/trip/get-match-profile.usecase';
import { GetPastTrips } from '../../../../application/use-cases/trip/get-past-trips.usecase';
import { EditTrip } from '../../../../application/use-cases/trip/editTrip.usecase';
import { DeleteTrip } from '../../../../application/use-cases/trip/delete-trip.usecase';
import { MatchingEngine } from '../../../../domain/services/matching-engine.service';
import { IMatchingEngine } from '../../../../application/interfaces/services/matching-engine.service.interface';
import { SearchTripMatches } from '../../../../application/use-cases/trip/search-trip-matches.usecase';
import { GetBuddiesUpcomingTrips } from '../../../../application/use-cases/trip/get-buddies-upcoming-trips.usecase';
import { GetAllTripMatches } from '../../../../application/use-cases/trip/get-all-trip-matches.usecase';

export function registerTripDependency() {
  container.registerSingleton<IMatchingEngine>(
    TOKENS.IMatchingEngine,
    MatchingEngine,
  );
  container.registerSingleton<CreateTrip>(TOKENS.ICreateTrip, CreateTrip);
  container.registerSingleton<CalculateMatch>(
    TOKENS.ICalculateMatch,
    CalculateMatch,
  );
  container.registerSingleton<GetTripMatches>(
    TOKENS.IGetTripMatches,
    GetTripMatches,
  );
  container.registerSingleton<GetActiveTrip>(
    TOKENS.IGetActiveTrip,
    GetActiveTrip,
  );
  container.registerSingleton<GetUserUpcomingTrips>(
    TOKENS.IGetUserUpcomingTrips,
    GetUserUpcomingTrips,
  );
  container.registerSingleton<GetMatchProfile>(
    TOKENS.IGetMatchProfile,
    GetMatchProfile,
  );
  container.registerSingleton<GetPastTrips>(TOKENS.IGetPastTrips, GetPastTrips);
  container.registerSingleton<EditTrip>(TOKENS.IEditTrip, EditTrip);
  container.registerType<DeleteTrip>(TOKENS.IDeleteTrip, DeleteTrip);
  container.registerSingleton<SearchTripMatches>(
    TOKENS.ISearchTripMatches,
    SearchTripMatches,
  );
  container.registerSingleton<GetBuddiesUpcomingTrips>(
    TOKENS.IGetBuddiesUpcomingTrips,
    GetBuddiesUpcomingTrips,
  );
  container.registerSingleton<GetAllTripMatches>(
    TOKENS.IGetAllTripMatches,
    GetAllTripMatches,
  );
}
