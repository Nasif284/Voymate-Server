import { Server } from 'socket.io';
import { container } from 'tsyringe';

import { TOKENS } from '../di/tokens';
import { ITokenService } from '../../application/interfaces/services/token.service.interface';
import { getCookie } from '../../shared/helpers/getCookie';

export function registerSocketAuth(io: Server) {
  io.use((socket, next) => {
    try {
      let accessToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers['authorization'] as string)?.replace(
          'Bearer ',
          '',
        );

      if (!accessToken && socket.handshake.headers.cookie) {
        accessToken = getCookie(socket.handshake.headers.cookie, 'accessToken');
      }

      if (!accessToken) {
        console.warn(
          '[Socket Auth] Authentication required: no token provided',
        );
        return next(new Error('Authentication required'));
      }

      const tokenService = container.resolve<ITokenService>(
        TOKENS.ITokenService,
      );
      const payload = tokenService.verifyAccessToken(accessToken);
      socket.data.userId = payload.userId;
      console.log('[Socket Auth] Authenticated user:', payload.userId);
      next();
    } catch (error) {
      console.error('[Socket Auth] Authentication failed:', error);
      next(new Error('Invalid or expired token'));
    }
  });
}
