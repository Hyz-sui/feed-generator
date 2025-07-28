import winston from 'winston'
import { Logger, LoggingService } from './logging-service'
import SlackHook from 'winston-slack-webhook-transport'
import DailyRotateFile from 'winston-daily-rotate-file'

export class WinstonLoggingService implements LoggingService {
  global: Logger = {
    silly: (message: string): void => {
      this.winstonLogger.silly(message)
    },
    debug: (message: string): void => {
      this.winstonLogger.debug(message)
    },
    verbose: (message: string): void => {
      this.winstonLogger.verbose(message)
    },
    info: (message: string): void => {
      this.winstonLogger.info(message)
    },
    warn: (message: string): void => {
      this.winstonLogger.warn(message)
    },
    error: (message: string): void => {
      this.winstonLogger.error(message)
    },
  }

  private readonly winstonLogger: winston.Logger

  constructor(logger: winston.Logger) {
    this.winstonLogger = logger
  }
  getLogger = (tag: string): Logger => ({
    silly: (message: string): void => {
      this.winstonLogger.silly(`${tag}: ${message}`)
    },
    debug: (message: string): void => {
      this.winstonLogger.debug(`${tag}: ${message}`)
    },
    verbose: (message: string): void => {
      this.winstonLogger.verbose(`${tag}: ${message}`)
    },
    info: (message: string): void => {
      this.winstonLogger.info(`${tag}: ${message}`)
    },
    warn: (message: string): void => {
      this.winstonLogger.warn(`${tag}: ${message}`)
    },
    error: (message: string): void => {
      this.winstonLogger.error(`${tag}: ${message}`)
    },
  })

  static configureDefaultWinstonOption = (
    slackWebhook?: string
  ): winston.LoggerOptions => {
    return {
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // 通常のログ
        new DailyRotateFile({
          frequency: '1d',
          dirname: 'data/logs',
          filename: 'feedgenlog-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          handleExceptions: true,
          handleRejections: true,
          zippedArchive: true,
          maxFiles: '30d',
        }),
        // エラーログ
        new DailyRotateFile({
          frequency: '7d',
          dirname: 'data/logs',
          filename: 'errors.log',
          level: 'error',
          handleExceptions: true,
          handleRejections: true,
          zippedArchive: true,
          maxFiles: '183d',
        }),
        // console
        new winston.transports.Console({
          level: 'silly',
          handleExceptions: true,
          handleRejections: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.timestamp(),
            winston.format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`
            })
          ),
        }),
        // Slack通知
        ...(slackWebhook
          ? [
              new SlackHook({
                webhookUrl: slackWebhook,
                level: 'error',
                handleExceptions: true,
                handleRejections: true,
              }),
            ]
          : []),
      ],
    }
  }
}
