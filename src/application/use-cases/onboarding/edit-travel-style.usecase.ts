import { inject, injectable } from 'tsyringe';
import { TravelType, TravelPersonality, MatchPreference } from '@prisma/client';
import { IEditTravelStyle } from '../../interfaces/use-cases/onboarding/edit-travel-style.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { TravelStyleRequestDTO } from '../../dtos/onbaording/request/travel-style.dto';
@injectable()
export class EditTravelStyle implements IEditTravelStyle {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}
  async execute(dto: TravelStyleRequestDTO): Promise<void> {
    const user = await this._userRepository.getUserWithDetails(dto.userId);
    await this._userRepository.updateUser(dto.userId, {
      travelType: dto.travelType
        ? (dto.travelType.toUpperCase() as TravelType)
        : undefined,
      travelPersonality: dto.travelPersonality
        ? (dto.travelPersonality.toUpperCase() as TravelPersonality)
        : undefined,
      matchPreference: dto.matchWith
        ? (dto.matchWith.toUpperCase() as MatchPreference)
        : undefined,
    });
    await this._userRepository.deleteInterests(user.id);
    await this._userRepository.createTravelInterests(
      dto.userId,
      dto.interests!,
    );
  }
}
