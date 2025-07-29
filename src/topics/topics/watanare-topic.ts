import { AtUri } from '@atproto/syntax'
import { Database } from '../../db'
import { Record } from '../../lexicon/types/app/bsky/feed/post'
import { AtprotoClientProvider } from '../../providers/atproto-client-provider'
import { CreateOp, DeleteOp } from '../../util/subscription'
import { Topic } from '../topic'
import { Logger, LoggingService } from '../../services/logging/logging-service'
import * as pattern from '../../text/pattern'

// マッチ時点で適合する正規表現
const regex =
  /[わワﾜ][たタﾀ][なナﾅ][れレﾚ]|((わたし|私)が恋人になれ)|(恋人になれる(わけ|訳|ワケ))|(じゃん(、)?(ムリムリ|むりむり|ﾑﾘﾑﾘ))|甘織|王[塚塚]([^古]|$)|紗月さん|琴紗月|紫陽花さん|瀬名紫陽花|小柳香穂|ムリムリ進化論|れなコアラ|ひとよひとよに(人|ひと)見知り/
// 2つ以上マッチすれば適合するパターン
const multiPatterns = [
  /れな子|れなこ/,
  /紫陽花|あじさい/,
  '真唯',
  '香穂',
  'なぎぽ',
  '紗月',
  /百合[^子姫]/,
  'ムリムリ',
  'フォーくん',
]

export class WatanareTopic implements Topic {
  private readonly atprotoProvider: AtprotoClientProvider
  private readonly log: Logger
  private ignoredDids?: string[]
  private ignoreListLastUpdateTime: number

  constructor(atprotoProvider: AtprotoClientProvider, log: LoggingService) {
    this.atprotoProvider = atprotoProvider
    this.log = log.getLogger(WatanareTopic.name)
  }

  handleCreation = async (
    db: Database,
    creations: CreateOp<Record>[]
  ): Promise<void> => {
    const matches: CreateOp<Record>[] = []
    for (const creation of creations) {
      if (await this.isMatch(creation.author, creation.record)) {
        matches.push(creation)

        this.log.info('============================')
        this.log.info(`New post found:`)
        this.log.info('------------------------------')
        const rkey = creation.uri.split('/').at(-1)
        this.log.info(
          `https://bsky.app/profile/${creation.author}/post/${rkey}`
        )
        this.log.info(creation.record.text.split('\n')[0])
        this.log.info('============================')
      }
    }
    if (matches.length === 0) {
      return
    }
    db.insertInto('watanare_post')
      .values(
        matches.map((match) => ({
          uri: match.uri,
          cid: match.cid,
          indexedAt: new Date().toISOString(),
        }))
      )
      .onConflict((oc) => oc.doNothing())
      .execute()
  }
  handleDeletion = async (
    db: Database,
    deletion: DeleteOp[]
  ): Promise<void> => {
    db.deleteFrom('watanare_post')
      .where(
        'uri',
        'in',
        deletion.map((d) => d.uri)
      )
      .execute()
  }

  private isMatch = async (
    author: string,
    record: Record
  ): Promise<boolean> => {
    // 除外リスト
    const ignore = await this.getIgnoredDids()
    if (ignore.includes(author)) {
      return false
    }

    const text = record.text
    // マッチ時点で適合と判断する条件
    if (regex.test(text)) {
      return true
    }
    const alts = (
      record.embed?.images as { images: { alt: string }[] }
    )?.images?.map((image) => image.alt)
    if (alts) {
      for (const alt of alts) {
        if (regex.test(alt)) {
          return true
        }
      }
    }

    // 本文とaltを合算して2つ以上マッチすれば適合
    if (
      pattern.includesCountOf([text, ...(alts ? alts : [])], multiPatterns, 2)
    ) {
      return true
    }
    return false
  }

  getIgnoredDids = async (): Promise<string[]> => {
    // 除外リストは1分間隔で更新する
    if (
      !this.ignoredDids ||
      Date.now() - this.ignoreListLastUpdateTime > 60000
    ) {
      const oldMembers = this.ignoredDids
      this.ignoredDids = []
      this.ignoreListLastUpdateTime = Date.now()
      const newMembers = await this.atprotoProvider
        .get()
        .getListMembers(ignoreModListUri)
      if (
        !oldMembers ||
        newMembers.length !== oldMembers.length ||
        newMembers.some((did) => !oldMembers.includes(did))
      ) {
        this.log.info('🐨🐨🐨🐨🐨 Ignoring DIDs 🐨🐨🐨🐨🐨🐨')
        for (const did of newMembers) {
          this.log.info(`🐨 ${did} 🐨`)
        }
        this.log.info('🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨🐨')
      }
      this.ignoredDids = newMembers
    }
    return this.ignoredDids
  }
}

const ignoreModListUri = AtUri.make(
  'did:plc:plvfzwfp73ezywxils6e6u2n',
  'app.bsky.graph.list',
  '3lth3afpjg62e'
)
