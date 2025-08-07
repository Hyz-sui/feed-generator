import { Database } from './db'
import { DidResolver } from '@atproto/identity'
import { MinifiedDb } from './db/minified-db'

export type AppContext = {
  db: MinifiedDb
  didResolver: DidResolver
  cfg: Config
}

export type Config = {
  port: number
  listenhost: string
  hostname: string
  sqliteLocation: string
  subscriptionEndpoint: string
  serviceDid: string
  publisherDid: string
  subscriptionReconnectDelay: number
}
