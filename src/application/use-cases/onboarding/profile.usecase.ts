import { inject, injectable } from 'tsyringe';
import { Gender } from '@prisma/client';
import { OnboardingProfileRequestDTO } from '../../dtos/onbaording/request/profile.dto';
import { ISetUserProfile } from '../../interfaces/use-cases/onboarding/profile.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { IStorageService } from '../../interfaces/services/storage.service.interface';

@injectable()
export class SetUserProfile implements ISetUserProfile {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}
  async execute(dto: OnboardingProfileRequestDTO): Promise<void> {
    const avatarKey = `users/profile-images/${crypto.randomUUID()}`;
    await this._storageService.upload(
      dto.imageBuffer,
      avatarKey,
      dto.profMimeType,
    );
    const coverKey = `users/cover-images/${crypto.randomUUID()}`;
    await this._storageService.upload(
      dto.coverImageBuffer,
      coverKey,
      dto.coverMimeType,
    );
    await this._userRepository.updateUser(dto.userId, {
      dateOfBirth: dto.dateOfBirth,
      avatarUrl: avatarKey,
      coverUrl: coverKey,
      bio: dto.about,
      gender: dto.gender ? (dto.gender.toUpperCase() as Gender) : undefined,
      countryCode: dto.nationality,
      state: dto.state,
      city: dto.city,
    });
    await this._userRepository.createSkills(dto.userId, dto.travelSkills);
    await this._userRepository.createLanguages(dto.userId, dto.languages);
    await this._userRepository.updateOnboarding(dto.userId, {
      onboardingStep: 3,
    });
  }
}
