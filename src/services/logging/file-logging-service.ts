import { appendFileSync } from 'fs'
import { LoggingService, Logger } from './logging-service'

export class FileLoggingService implements LoggingService {
  private readonly filePath: string

  global: Logger = {
    silly: (message: string) => {
      this.log(`[SILLY] ${message}`)
    },
    debug: (message: string) => {
      this.log(`[DEBUG] ${message}`)
    },
    verbose: (message: string) => {
      this.log(`[VERBOSE] ${message}`)
    },
    info: (message: string) => {
      this.log(`[INFO] ${message}`)
    },
    warn: (message: string) => {
      this.log(`[WARN] ${message}`)
    },
    error: (message: string) => {
      this.log(`[ERROR] ${message}`)
    },
  }

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private log = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp}: ${message}\n`
    appendFileSync(this.filePath, logMessage)
  }
  getLogger = (tag: string): Logger => ({
    silly: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [SILLY]   ${message}`)
    },
    debug: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [DEBUG]   ${message}`)
    },
    verbose: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [VERBOSE] ${message}`)
    },
    info: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [INFO]    ${message}`)
    },
    warn: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [WARN]    ${message}`)
    },
    error: (message: string) => {
      this.log(`${`[${tag}]`.padEnd(30)} [ERROR]   ${message}`)
    },
  })
}
