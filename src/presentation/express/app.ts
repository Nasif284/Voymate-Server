import 'reflect-metadata';
import express, { Application } from 'express';
import { AppContainer } from '../../infrastructure/di/container';
import cors from 'cors';
import { config } from '../../config/env.config';
import helmet from 'helmet';
import morganMiddleware from '../../infrastructure/logging/morgan.middleware';
import cookieParser from 'cookie-parser';
import { buildRoutes } from '../routes';
import { globalErrorHandler } from '../middleware/error/error.middleware';
import { register } from '../../infrastructure/logging/metrics';
import metricsMiddleware from '../middleware/metrics/metrics-middleware';

export class App {
  private readonly app: Application;
  constructor(private readonly container: AppContainer) {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  private initializeMiddleware(): void {
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
      }),
    );
    this.app.use(helmet());

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.set('trust proxy', true);
    this.app.use(morganMiddleware);

    this.app.use(cookieParser());

    this.app.use(metricsMiddleware);
  }

  private initializeRoutes(): void {
    this.app.get('/metrics', async (_req, res) => {
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    });
    this.app.get('/', (_, res) => {
      res.send('API Running...');
    });
    this.app.use('/api/v1', buildRoutes(this.container));
  }

  private initializeErrorHandling(): void {
    this.app.use(globalErrorHandler);
  }

  public getServer(): Application {
    return this.app;
  }
}
