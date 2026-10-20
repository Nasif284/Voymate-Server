import { CookieOptions, Request, Response } from 'express';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { config } from '../../../../config/env.config';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { ApiResponse } from '../../../responses/common-response';
import { ADMIN_MESSAGES } from '../../../../shared/constants/messages/success/admin/admin.messages';
import { AUTH_ERROR_CODES } from '../../../../shared/constants/error-codes/auth.code';
import { AUTH_ERROR_MESSAGES } from '../../../../shared/constants/messages/error/auth.messages';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IAdminLogin } from '../../../../application/interfaces/use-cases/auth/admin/login.interface';
import { ICreate } from '../../../../application/interfaces/use-cases/admins/create.interface';
import { ILogout } from '../../../../application/interfaces/use-cases/auth/user/logout.interface';
import { IAdminRefreshToken } from '../../../../application/interfaces/use-cases/auth/admin/admin-refresh.interface';
@injectable()
export class AdminAuthController {
  private readonly _accessTtl: number;
  private readonly _refreshTtl: number;

  constructor(
    @inject(TOKENS.IAdminLogin) private readonly _loginUseCase: IAdminLogin,
    @inject(TOKENS.ICreateAdmin)
    private readonly _createAdminUseCase: ICreate,
    @inject(TOKENS.ILogout) private readonly _logoutUseCase: ILogout,
    @inject(TOKENS.IAdminRefreshToken)
    private readonly _refreshUseCase: IAdminRefreshToken,
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
      maxAge,
      path: '/',
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
  login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this._loginUseCase.execute(req.body);
    res.cookie(
      'adminAccessToken',
      result.accessToken,
      this.getCookieOptions(this._accessTtl),
    );
    res.cookie(
      'adminRefreshToken',
      result.refreshToken,
      this.getCookieOptions(this._refreshTtl),
    );
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(ADMIN_MESSAGES.LOGGED_ID, result.response.admin),
      );
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await this._createAdminUseCase.execute(req.body);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(ADMIN_MESSAGES.CREATED, result.admin));
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.adminRefreshToken as string | undefined;
    const userId = req.user?.userId;
    if (userId && refreshToken) {
      await this._logoutUseCase.execute({ userId, refreshToken });
    }
    res.clearCookie('adminAccessToken', this.getClearCookieOptions());
    res.clearCookie('adminRefreshToken', this.getClearCookieOptions());
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(ADMIN_MESSAGES.LOGGED_OUT));
  };
  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.adminRefreshToken as string;
      if (!refreshToken) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            ApiResponse.error(
              AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
              AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
            ),
          );
      }
      const decoded = (await jwt.decode(refreshToken)) as {
        userId: string;
        email: string;
      } | null;

      console.log(decoded);

      const userId: string | undefined = decoded?.userId;
      if (!userId) {
        console.log('error here 1');
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            ApiResponse.error(
              AUTH_ERROR_CODES.USER_NOT_FOUND,
              AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
            ),
          );
      }
      const result = await this._refreshUseCase.execute({
        token: refreshToken,
        userId,
      });
      res.cookie(
        'adminAccessToken',
        result.accessToken,
        this.getCookieOptions(this._accessTtl),
      );
      res.cookie(
        'adminRefreshToken',
        result.refreshToken,
        this.getCookieOptions(this._refreshTtl),
      );

      return res
        .status(HttpStatus.OK)
        .json(ApiResponse.success(ADMIN_MESSAGES.REFRESH_TOKEN, result.user));
    } catch (err) {
      res.clearCookie('adminAccessToken', this.getClearCookieOptions());
      res.clearCookie('adminRefreshToken', this.getClearCookieOptions());
      throw err;
    }
  };
}
