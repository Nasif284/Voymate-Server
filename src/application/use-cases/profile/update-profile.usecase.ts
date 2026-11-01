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

    if (languages !== undefined) {
      await this._userRepository.deleteLanguages(user.id);
      if (Array.isArray(languages) && languages.length > 0) {
        await this._userRepository.createLanguages(dto.userId, languages);
      }
    }

    if (skills !== undefined) {
      await this._userRepository.deleteSkills(user.id);
      if (Array.isArray(skills) && skills.length > 0) {
        await this._userRepository.createSkills(dto.userId, skills);
      }
    }

    if (interests !== undefined) {
      await this._userRepository.deleteInterests(user.id);
      if (Array.isArray(interests) && interests.length > 0) {
        await this._userRepository.createTravelInterests(dto.userId, interests);
      }
    }

    const updateData: Record<string, any> = {};
    if (bio !== undefined) updateData.bio = bio;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (isTraveling !== undefined) updateData.isTraveling = isTraveling;
    if (travelPersonalityCode !== undefined) {
      updateData.travelPersonality = travelPersonalityCode
        ? (travelPersonalityCode.toUpperCase() as TravelPersonality)
        : null;
    }

    if (Object.keys(updateData).length > 0) {
      await this._userRepository.updateUser(dto.userId, updateData);
    }
  }
}
