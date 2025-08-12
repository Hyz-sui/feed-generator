import dotenv from 'dotenv'
import FeedGenerator from './server'
import { TopicsProvider } from './providers/topics-provider'
import { AlgosProvider } from './providers/algos-provider'
import { Topic } from './topics/topic'
import { WatanareTopic } from './topics/topics/watanare-topic'
import { WatanareTimelineAlgo } from './algos/watanare-timeline-algo'
import { Algo } from './algos/algo'
import { Agent } from '@atproto/api'
import { AtprotoClientProvider } from './providers/atproto-client-provider'
import { AtprotoClient } from './atproto/atproto-client'
import { FileLoggingService } from './services/logging/file-logging-service'
import { ConsoleLoggingService } from './services/logging/console-logging-service'
import { WinstonLoggingService } from './services/logging/winston-logging-service'
import winston from 'winston'
import { WatanareHotAlgo } from './algos/watanare-hot-algo'
import { createDb } from './db'
import { isMinifiedDb } from './db/minified-db'

const run = async () => {
  dotenv.config()

  // ロギングを初期化
  const loggerConfig = maybeInt(process.env.LOGGER)
  const loggingService =
    (() => {
      switch (loggerConfig) {
        case 0:
          return process.env.NODE_ENV === 'production'
            ? new WinstonLoggingService(
                winston.createLogger(
                  WinstonLoggingService.configureDefaultWinstonOption(
                    process.env.SLACK_WEBHOOK_URL ?? undefined
                  )
                )
              )
            : new ConsoleLoggingService()
        case 1:
          return new ConsoleLoggingService()
        case 2:
          return new FileLoggingService('data/feedgen.log')
        case 3:
          return new WinstonLoggingService(
            winston.createLogger(
              WinstonLoggingService.configureDefaultWinstonOption(
                process.env.SLACK_WEBHOOK_URL ?? undefined
              )
            )
          )
      }
    })() ?? new ConsoleLoggingService()

  // その他依存オブジェクトを初期化
  const atprotoAgent = new Agent('https://public.api.bsky.app')
  const atprotoClientProvider = new AtprotoClientProvider(
    new AtprotoClient(atprotoAgent, loggingService)
  )

  const topics: Topic[] =
    process.env.NODE_ENV === 'production'
      ? [new WatanareTopic(atprotoClientProvider, loggingService)]
      : [
          // デバッグ用トピックを入れるところ

          new WatanareTopic(atprotoClientProvider, loggingService),
        ]
  const topicsProvider = new TopicsProvider(topics)

  const algos: Algo[] = [
    new WatanareTimelineAlgo(),
    new WatanareHotAlgo(atprotoClientProvider),
  ]
  const algosProvider = new AlgosProvider(algos)

  const sqliteLocation =
    maybeStr(process.env.FEEDGEN_SQLITE_LOCATION) ?? ':memory:'
  const db = (() => {
    const rawDb: any = createDb(sqliteLocation)
    rawDb.isDatabase = true
    if (!isMinifiedDb(rawDb)) {
      throw new Error(
        'This should not be possible, but we got an illegal db object. Check your code.'
      )
    }
    return rawDb
  })()

  // 起動
  const hostname = maybeStr(process.env.FEEDGEN_HOSTNAME) ?? 'example.com'
  const serviceDid =
    maybeStr(process.env.FEEDGEN_SERVICE_DID) ?? `did:web:${hostname}`
  const server = FeedGenerator.create(
    {
      port: maybeInt(process.env.FEEDGEN_PORT) ?? 3000,
      listenhost: maybeStr(process.env.FEEDGEN_LISTENHOST) ?? 'localhost',
      sqliteLocation: sqliteLocation,
      subscriptionEndpoint:
        maybeStr(process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT) ??
        'wss://bsky.network',
      publisherDid:
        maybeStr(process.env.FEEDGEN_PUBLISHER_DID) ?? 'did:example:alice',
      subscriptionReconnectDelay:
        maybeInt(process.env.FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY) ?? 3000,
      hostname,
      serviceDid,
    },
    db,
    topicsProvider,
    algosProvider
  )
  await server.start()
  loggingService.global.info(
    `🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`
  )
  loggingService.global.info(`with [${process.env.NODE_ENV}] env`)
}

const maybeStr = (val?: string) => {
  if (!val) return undefined
  return val
}

const maybeInt = (val?: string) => {
  if (!val) return undefined
  const int = parseInt(val, 10)
  if (isNaN(int)) return undefined
  return int
}

run()
