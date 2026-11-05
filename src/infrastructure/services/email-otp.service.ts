import { OtpPurpose } from '../../domain/enums';
import { IOtpService } from '../../application/interfaces/services/otp.service.interface';
import { IHashService } from '../../application/interfaces/services/hash.service.interface';
import { IEmailService } from '../../application/interfaces/services/email.service.interface';
import {
  InvalidOtpError,
  OtpMaxAttemptsError,
  OtpNotFoundError,
} from '../../domain/errors/auth.error';
import { config } from '../../config/env.config';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../di/tokens';
import { ICacheService } from '../../application/interfaces/services/cache.service.interface';

interface OtpRedisValue {
  codeHash: string;
  attempts: number;
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@injectable()
export class RedisOtpService implements IOtpService {
  private readonly _expirySeconds: number;
  private readonly _maxAttempts: number;

  constructor(
    @inject(TOKENS.ICacheService) private readonly _cache: ICacheService,
    @inject(TOKENS.IHashService) private readonly _hashService: IHashService,
    @inject(TOKENS.IEmailService) private readonly _emailService: IEmailService,
  ) {
    this._expirySeconds = parseInt(config.otp.expiryInMinutes ?? '10') * 60;
    this._maxAttempts = parseInt(config.otp.maxAttempts ?? '3');
  }

  private _key(email: string, purpose: OtpPurpose): string {
    return `otp:${purpose}:${email}`;
  }

  async send(email: string, purpose: OtpPurpose): Promise<void> {
    const code = generateCode();
    console.log(code);
    const codeHash = await this._hashService.hash(code);

    const value: OtpRedisValue = { codeHash, attempts: 0 };

    await this._cache.set(
      this._key(email, purpose),
      this._expirySeconds,
      JSON.stringify(value),
    );

    await this._emailService.sendOtp(email, code);
  }

  async verify(
    email: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    // Reviewer bypass for App Store / Google Play verification tests
    const normalizedEmail = email.trim().toLowerCase();
    const isReviewer =
      normalizedEmail === 'apple.review@voymate.app' ||
      normalizedEmail === 'google.review@voymate.app' ||
      normalizedEmail === 'reviewer@voymate.app' ||
      (normalizedEmail.endsWith('@voymate.app') &&
        normalizedEmail.includes('review'));

    if (isReviewer && code === '123456') {
      return;
    }

    const raw = await this._cache.get(this._key(email, purpose));

    if (!raw) throw new OtpNotFoundError();

    const data: OtpRedisValue = JSON.parse(raw);

    if (data.attempts >= this._maxAttempts) throw new OtpMaxAttemptsError();

    const isValid = await this._hashService.compare(code, data.codeHash);

    if (!isValid) {
      const ttl = await this._cache.ttl(this._key(email, purpose));
      if (ttl <= 0) {
        throw new OtpNotFoundError();
      }
      const updated: OtpRedisValue = { ...data, attempts: data.attempts + 1 };
      await this._cache.set(
        this._key(email, purpose),
        ttl,
        JSON.stringify(updated),
      );
      throw new InvalidOtpError();
    }
  }

  async delete(phone: string, purpose: OtpPurpose): Promise<void> {
    await this._cache.delete(this._key(phone, purpose));
  }
}
