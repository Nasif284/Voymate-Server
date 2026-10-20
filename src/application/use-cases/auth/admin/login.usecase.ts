import ms, { StringValue } from 'ms';
import { config } from '../../../../config/env.config';
import { AdminNotFoundError } from '../../../../domain/errors/admin.error';
import { IncorrectPasswordError } from '../../../../domain/errors/auth.error';
import { LoginRequestDTO } from '../../../dtos/auth/user/request/login.dto';
import { IAdminRepository } from '../../../interfaces/repositories/admin.respository';
import { IHashService } from '../../../interfaces/services/hash.service.interface';
import { ISessionService } from '../../../interfaces/services/session.service.interface';
import { ITokenService } from '../../../interfaces/services/token.service.interface';
import { IAdminLogin } from '../../../interfaces/use-cases/auth/admin/login.interface';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { AdminLoginResponseDTO } from '../../../dtos/auth/admin/response/admin-login.dto';
import { formatAdminRoleDisplayName } from '../../../../domain/enums/admin-role.enum';
@injectable()
export class AdminLogin implements IAdminLogin {
  private readonly _refreshTtl: number;
  constructor(
    @inject(TOKENS.IAdminRepository)
    private readonly _adminRepository: IAdminRepository,
    @inject(TOKENS.ITokenService)
    private readonly _tokenService: ITokenService,
    @inject(TOKENS.ISessionService)
    private readonly _sessionService: ISessionService,
    @inject(TOKENS.IHashService)
    private readonly _hashService: IHashService,
  ) {
    this._refreshTtl =
      ms((config.jwt.refreshExpiration ?? '7d') as StringValue) / 1000;
  }
  async execute(dto: LoginRequestDTO): Promise<AdminLoginResponseDTO> {
    const { email, password } = dto;
    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) {
      throw new AdminNotFoundError();
    }
    const valid = await this._hashService.compare(password, admin.passwordHash);
    if (!valid) {
      throw new IncorrectPasswordError();
    }

    const accessToken = this._tokenService.generateAccessToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role.name,
    });
    const refreshToken = this._tokenService.generateRefreshToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role.name,
    });

    const tokenHash = this._tokenService.hashToken(refreshToken);
    await this._sessionService.store(admin.id, tokenHash, this._refreshTtl);

    return {
      accessToken,
      refreshToken,
      response: {
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          role: formatAdminRoleDisplayName(admin.role.name),
        },
      },
    };
  }
}
