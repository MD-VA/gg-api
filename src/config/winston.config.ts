import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export const createWinstonConfig = (
  configService: ConfigService,
): WinstonModuleOptions => {
  const logLevel = configService.get('logging.level') || 'info';
  const errorLogFile = configService.get('logging.fileError') || 'logs/error.log';
  const combinedLogFile = configService.get('logging.fileCombined') || 'logs/combined.log';

  return {
    transports: [
      // Console transport
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}${
                trace ? `\n${trace}` : ''
              }`;
            },
          ),
        ),
      }),
      // Error log file
      new winston.transports.File({
        filename: errorLogFile,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Combined log file
      new winston.transports.File({
        filename: combinedLogFile,
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  };
};
