import { inject, injectable } from 'tsyringe';
import { Gender } from '@prisma/client';
import { IEditOnboardingProfile } from '../../interfaces/use-cases/onboarding/edit-profile.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { EditOnboardingProfileRequestDTO } from '../../dtos/onbaording/request/edit-profile.dto';
@injectable()
export class EditOnboardingProfile implements IEditOnboardingProfile {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}
  async execute(dto: EditOnboardingProfileRequestDTO): Promise<void> {
    console.log(dto);
    const user = await this._userRepository.getUserWithDetails(dto.userId);
    await this._userRepository.updateUser(dto.userId, {
      dateOfBirth: dto.dateOfBirth,
      bio: dto.about,
      gender: dto.gender ? (dto.gender.toUpperCase() as Gender) : undefined,
      countryCode: dto.nationality,
      state: dto.state,
      city: dto.city,
    });

    await this._userRepository.deleteLanguages(user.id);
    await this._userRepository.deleteSkills(user.id);
    await this._userRepository.createLanguages(dto.userId, dto.languages!);
    await this._userRepository.createSkills(dto.userId, dto.travelSkills!);
  }
}
