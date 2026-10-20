import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { config } from '../../../../config/env.config';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { ApiResponse } from '../../../responses/common-response';
import { USER_MESSAGES } from '../../../../shared/constants/messages/success/user/user.messages';
import { AUTH_ERROR_CODES } from '../../../../shared/constants/error-codes/auth.code';
import { AUTH_ERROR_MESSAGES } from '../../../../shared/constants/messages/error/auth.messages';
import { inject, injectable } from 'tsyringe';
import { IRegister } from '../../../../application/interfaces/use-cases/auth/user/register.interface';
import { ILogin } from '../../../../application/interfaces/use-cases/auth/user/login.interface';
import { IForgotPassword } from '../../../../application/interfaces/use-cases/auth/user/forgot-password.interface';
import { IResetPassword } from '../../../../application/interfaces/use-cases/auth/user/reset-password.interface';
import { IRefreshToken } from '../../../../application/interfaces/use-cases/auth/user/refresh-token.interface';
import { ISendOtp } from '../../../../application/interfaces/use-cases/auth/user/send-otp.interface';
import { ILogout } from '../../../../application/interfaces/use-cases/auth/user/logout.interface';
import { IVerifyOtp } from '../../../../application/interfaces/use-cases/auth/user/verify-otp.interface';
import { IGoogleAuth } from '../../../../application/interfaces/use-cases/auth/user/google-auth.interface';
import { IVerifyEmail } from '../../../../application/interfaces/use-cases/auth/user/verify-email.interface';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IAuthMe } from '../../../../application/interfaces/use-cases/auth/user/auth-me.interface';
import { IVerifyPhoneOtp } from '../../../../application/interfaces/use-cases/auth/user/verify-phone-otp.interface';
import { ISendPhoneOtp } from '../../../../application/interfaces/use-cases/auth/user/send-otp-sms.interface';
import { loginAttemptsTotal } from '../../../../infrastructure/logging/metrics';
@injectable()
export class AuthController {
  private readonly _accessTtl: number;
  private readonly _refreshTtl: number;

  constructor(
    @inject(TOKENS.IRegister)
    private readonly _registerUseCase: IRegister,
    @inject(TOKENS.IVerifyEmail)
    private readonly _verifyEmailUseCase: IVerifyEmail,
    @inject(TOKENS.ILogin)
    private readonly _loginUseCase: ILogin,
    @inject(TOKENS.IForgotPassword)
    private readonly _forgotPasswordUseCase: IForgotPassword,
    @inject(TOKENS.IResetPassword)
    private readonly _resetPasswordUseCase: IResetPassword,
    @inject(TOKENS.IRefreshToken)
    private readonly _refreshTokenUseCase: IRefreshToken,
    @inject(TOKENS.ISendOtp)
    private readonly _sendOtp: ISendOtp,
    @inject(TOKENS.ILogout)
    private readonly _logout: ILogout,
    @inject(TOKENS.IVerifyOtp)
    private readonly _verifyOtp: IVerifyOtp,
    @inject(TOKENS.IGoogleAuth)
    private readonly _googleAuth: IGoogleAuth,
    @inject(TOKENS.IAuthMe)
    private readonly _authMe: IAuthMe,
    @inject(TOKENS.IVerifyPhoneOtp)
    private readonly _verifyPhoneOtp: IVerifyPhoneOtp,
    @inject(TOKENS.ISendPhoneOtp)
    private readonly _sendPhoneOtp: ISendPhoneOtp,
  ) {
    this._accessTtl = ms((config.jwt.accessExpiration ?? '15m') as StringValue);
    this._refreshTtl = ms(
      (config.jwt.refreshExpiration ?? '7d') as StringValue,
    );
  }

  private getCookieOptions(maxAge: number): CookieOptions {
    const isProduction = config.env === 'production';
    const domain = process.env.FRONTEND_URL?.split('www.')[1];
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge,
      ...(isProduction ? { domain } : {}),
    };
  }
  private getClearCookieOptions(): CookieOptions {
    const isProduction = config.env === 'production';
    const domain = process.env.FRONTEND_URL?.split('www.')[1];
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      ...(isProduction ? { domain } : {}),
    };
  }
  register = async (req: Request, res: Response): Promise<Response> => {
    const result = await this._registerUseCase.execute(req.body);
    res.cookie(
      'accessToken',
      result.accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'refreshToken',
      result.refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(USER_MESSAGES.REGISTER_SUCCESS, result.user));
  };
  verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const { code, email } = req.body;
    const result = await this._verifyEmailUseCase.execute({ email, code });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.EMAIL_VERIFIED, result));
  };
  login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this._loginUseCase.execute(req.body);
    res.cookie(
      'accessToken',
      result.accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'refreshToken',
      result.refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );
    loginAttemptsTotal.inc({
      status: 'success',
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.LOGIN_SUCCESS, result.response));
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string;
      if (!refreshToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Session expired, login again',
        });
      }
      const decoded = jwt.decode(refreshToken) as {
        userId: string;
        email: string;
      } | null;
      const userId: string | undefined = decoded?.userId;
      if (!userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            ApiResponse.error(
              AUTH_ERROR_CODES.USER_NOT_FOUND,
              AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
            ),
          );
      }

      const result = await this._refreshTokenUseCase.execute({
        token: refreshToken,
        userId,
      });
      res.cookie(
        'accessToken',
        result.accessToken,
        this.getCookieOptions(this._accessTtl),
      );
      res.cookie(
        'refreshToken',
        result.refreshToken,
        this.getCookieOptions(this._refreshTtl),
      );

      return res
        .status(HttpStatus.OK)
        .json(ApiResponse.success(USER_MESSAGES.TOKEN_REFRESHED, result.user));
    } catch (err) {
      res.clearCookie('accessToken', this.getClearCookieOptions());
      res.clearCookie('refreshToken', this.getClearCookieOptions());
      throw err;
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    await this._forgotPasswordUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT));
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    await this._resetPasswordUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.PASSWORD_RESET_SUCCESS));
  };

  sendOtp = async (req: Request, res: Response): Promise<Response> => {
    await this._sendOtp.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.OTP_SENT));
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const userId = req.user?.userId;
    if (userId && refreshToken) {
      await this._logout.execute({ userId, refreshToken });
    }

    res.clearCookie('accessToken', this.getClearCookieOptions());
    res.clearCookie('refreshToken', this.getClearCookieOptions());

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.LOGOUT_SUCCESS));
  };

  verifyOtp = async (req: Request, res: Response): Promise<Response> => {
    await this._verifyOtp.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.OTP_VERIFIED));
  };
  googleAuth = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await this._googleAuth.execute({ token });

    res.cookie(
      'accessToken',
      result.accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'refreshToken',
      result.refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(USER_MESSAGES.GOOGLE_AUTH_SUCCESS, {
        ...result.response,
        isNew: result.isNew,
      }),
    );
  };
  authMe = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._authMe.execute({ userId: userId! });
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(USER_MESSAGES.USER_AUTHENTICATED, data.response),
      );
  };
  sendPhoneOtp = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    await this._sendPhoneOtp.execute({
      userId: userId!,
      phone: req.body.phone,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.OTP_SENT));
  };
  verifyPhoneOtp = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { otp, phone } = req.body;
    await this._verifyPhoneOtp.execute({
      userId: userId!,
      otp,
      phone,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(USER_MESSAGES.OTP_VERIFIED));
  };
}
