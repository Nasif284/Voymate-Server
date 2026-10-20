import { inject, injectable } from 'tsyringe';
import { TravelPersonality } from '@prisma/client';
import { IUpdateProfile } from '../../interfaces/use-cases/profile/update-profile.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { UpdateProfileRequestDTO } from '../../dtos/profile/request/update-profile.dto';
@injectable()
export class UpdateProfile implements IUpdateProfile {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}
  async execute(dto: {
    userId: string;
    payload: UpdateProfileRequestDTO;
  }): Promise<void> {
    const {
      bio,
      fullName,
      isTraveling,
      travelPersonalityCode,
      interests,
      languages,
      skills,
    } = dto.payload;
    const user = await this._userRepository.getUserWithDetails(dto.userId);

    await this._userRepository.deleteLanguages(user.id);
    await this._userRepository.deleteSkills(user.id);
    await this._userRepository.deleteInterests(user.id);

    await this._userRepository.createTravelInterests(dto.userId, interests!);
    await this._userRepository.createLanguages(dto.userId, languages!);
    await this._userRepository.createSkills(dto.userId, skills!);

    await this._userRepository.updateUser(dto.userId, {
      bio,
      fullName,
      isTraveling,
      travelPersonality: travelPersonalityCode
        ? (travelPersonalityCode.toUpperCase() as TravelPersonality)
        : undefined,
    });
  }
}
