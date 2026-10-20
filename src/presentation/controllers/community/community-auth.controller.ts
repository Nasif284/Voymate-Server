import { inject, injectable } from 'tsyringe';
import { Request, Response, CookieOptions } from 'express';
import ms, { StringValue } from 'ms';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  IRegisterCommunityUseCase,
  ILoginCommunityUseCase,
  IVerifyCommunityEmailUseCase,
  IResendCommunityOtpUseCase,
  IOnboardCommunityUseCase,
  ISubmitCommunityVerificationUseCase,
  IGetCommunityProfileUseCase,
  IRefreshCommunityTokenUseCase,
} from '../../../application/interfaces/use-cases/community';
import { HttpStatus } from '../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../responses/common-response';
import { COMMUNITY_MESSAGES } from '../../../shared/constants/messages/success/community/community.messages';
import { config } from '../../../config/env.config';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

@injectable()
export class CommunityAuthController {
  private readonly _accessTtl: number;
  private readonly _refreshTtl: number;

  constructor(
    @inject(TOKENS.IRegisterCommunity)
    private readonly _registerUseCase: IRegisterCommunityUseCase,
    @inject(TOKENS.ILoginCommunity)
    private readonly _loginUseCase: ILoginCommunityUseCase,
    @inject(TOKENS.IVerifyCommunityEmail)
    private readonly _verifyEmailUseCase: IVerifyCommunityEmailUseCase,
    @inject(TOKENS.IResendCommunityOtp)
    private readonly _resendOtpUseCase: IResendCommunityOtpUseCase,
    @inject(TOKENS.IOnboardCommunity)
    private readonly _onboardUseCase: IOnboardCommunityUseCase,
    @inject(TOKENS.ISubmitCommunityVerification)
    private readonly _submitVerificationUseCase: ISubmitCommunityVerificationUseCase,
    @inject(TOKENS.IGetCommunityProfile)
    private readonly _getProfileUseCase: IGetCommunityProfileUseCase,
    @inject(TOKENS.IRefreshCommunityToken)
    private readonly _refreshTokenUseCase: IRefreshCommunityTokenUseCase,
  ) {
    this._accessTtl = ms((config.jwt.accessExpiration ?? '15m') as StringValue);
    this._refreshTtl = ms(
      (config.jwt.refreshExpiration ?? '7d') as StringValue,
    );
  }

  private getCookieOptions(maxAge: number): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.FRONTEND_URL?.split('www.')[1];
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge,
      ...(isProduction && domain ? { domain } : {}),
    };
  }

  private getClearCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.FRONTEND_URL?.split('www.')[1];
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      ...(isProduction && domain ? { domain } : {}),
    };
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    const { community, accessToken, refreshToken } =
      await this._registerUseCase.execute(req.body);

    res.cookie(
      'communityAccessToken',
      accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'communityRefreshToken',
      refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );

    return res
      .status(HttpStatus.CREATED)
      .json(
        ApiResponse.success(COMMUNITY_MESSAGES.COMMUNITY_REGISTERED, community),
      );
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { community, accessToken, refreshToken } =
      await this._loginUseCase.execute(req.body);

    res.cookie(
      'communityAccessToken',
      accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'communityRefreshToken',
      refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(COMMUNITY_MESSAGES.COMMUNITY_LOGGED_IN, community),
      );
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.communityRefreshToken as string;
    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          ApiResponse.error('UNAUTHORIZED', 'Session expired, login again'),
        );
    }

    const result = await this._refreshTokenUseCase.execute(refreshToken);

    res.cookie(
      'communityAccessToken',
      result.accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'communityRefreshToken',
      result.refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Token refreshed successfully', result));
  };

  verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const result = await this._verifyEmailUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(COMMUNITY_MESSAGES.EMAIL_VERIFIED_SUCCESS, result),
      );
  };

  resendOtp = async (req: Request, res: Response): Promise<Response> => {
    await this._resendOtpUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.OTP_SENT_SUCCESS));
  };

  logout = async (_req: Request, res: Response): Promise<Response> => {
    const clearOptions = this.getClearCookieOptions();
    res.clearCookie('communityAccessToken', clearOptions);
    res.clearCookie('communityRefreshToken', clearOptions);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Logged out successfully'));
  };

  getMe = async (req: Request, res: Response): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized access'));
    }

    const profile = await this._getProfileUseCase.execute(communityId);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Community profile retrieved', profile));
  };

  onboard = async (req: Request, res: Response): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized access'));
    }

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const avatarFile = files?.avatar?.[0];
    const coverFile = files?.cover?.[0];

    if (avatarFile) {
      if (!ALLOWED_IMAGE_MIMES.includes(avatarFile.mimetype)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            ApiResponse.error(
              'INVALID_FILE_TYPE',
              'Avatar must be a JPEG, PNG, or WebP image.',
            ),
          );
      }
      if (avatarFile.size > MAX_IMAGE_SIZE) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            ApiResponse.error(
              'FILE_TOO_LARGE',
              'Avatar image size must not exceed 5MB.',
            ),
          );
      }
    }

    if (coverFile) {
      if (!ALLOWED_IMAGE_MIMES.includes(coverFile.mimetype)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            ApiResponse.error(
              'INVALID_FILE_TYPE',
              'Cover image must be a JPEG, PNG, or WebP image.',
            ),
          );
      }
      if (coverFile.size > MAX_IMAGE_SIZE) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            ApiResponse.error(
              'FILE_TOO_LARGE',
              'Cover image size must not exceed 5MB.',
            ),
          );
      }
    }

    const profile = await this._onboardUseCase.execute({
      ...req.body,
      communityId,
      avatarBuffer: avatarFile?.buffer,
      avatarMimeType: avatarFile?.mimetype,
      coverBuffer: coverFile?.buffer,
      coverMimeType: coverFile?.mimetype,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.PROFILE_UPDATED, profile));
  };

  submitVerification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized access'));
    }

    const docFile = req.file;
    if (!docFile) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'VALIDATION_ERROR',
            'Verification document file is required.',
          ),
        );
    }

    if (!ALLOWED_DOC_MIMES.includes(docFile.mimetype)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'INVALID_FILE_TYPE',
            'Verification document must be a PDF or image (JPEG, PNG, WebP).',
          ),
        );
    }

    if (docFile.size > MAX_DOC_SIZE) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'FILE_TOO_LARGE',
            'Verification document size must not exceed 10MB.',
          ),
        );
    }

    const profile = await this._submitVerificationUseCase.execute({
      communityId,
      notes: req.body.notes,
      documentBuffer: docFile.buffer,
      mimeType: docFile.mimetype,
    });

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(COMMUNITY_MESSAGES.VERIFICATION_SUBMITTED, profile),
      );
  };
}
