export interface LoggingService {
  global: Logger
  getLogger: (tag: string) => Logger
}
export interface Logger {
  silly: (message: string) => void
  debug: (message: string) => void
  verbose: (message: string) => void
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}
