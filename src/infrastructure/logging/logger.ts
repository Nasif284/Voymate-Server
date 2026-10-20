import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, errors, printf, colorize } = format;

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = printf(
  ({
    level,
    message,
    timestamp,
    method,
    url,
    statusCode,
    duration,
    contentLength,
    stack,
    service: _s,
    environment: _e,
    ...rest
  }) => {
    if (method && url) {
      const statusNum = Number(statusCode);
      const statusColor =
        statusNum >= 500
          ? '\x1b[31m' // Red
          : statusNum >= 400
            ? '\x1b[33m' // Yellow
            : statusNum >= 300
              ? '\x1b[36m' // Cyan
              : '\x1b[32m'; // Green
      const reset = '\x1b[0m';
      const formattedMethod = String(method).toUpperCase().padEnd(6);
      const formattedDuration =
        typeof duration === 'number'
          ? `${duration.toFixed(1)}ms`
          : `${duration}ms`;
      const size = contentLength ? `(${contentLength}B)` : '';
      return `${timestamp} [${level}] ${formattedMethod} ${url} ${statusColor}${statusCode}${reset} ${size} - ${formattedDuration}`;
    }

    const restKeys = Object.keys(rest);
    const meta = restKeys.length > 0 ? ` ${JSON.stringify(rest)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${meta}`;
  },
);

// Daily rotated JSON file transport: 20MB max per file, gzipped, max 7 days retention
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/voymate-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: combine(timestamp(), errors({ stack: true }), json()),
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'voymate-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // 1. Console: pretty colorized for developer terminal in dev, JSON in prod
    new transports.Console({
      format: isDev
        ? combine(
            colorize({ all: false }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            devFormat,
          )
        : combine(timestamp(), errors({ stack: true }), json()),
    }),
    // 2. Rotating File: automated retention, pure JSON for metrics & log scrapers
    fileRotateTransport,
  ],
});

export default logger;
