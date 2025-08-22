import { AtUri } from '@atproto/syntax'
import { Record } from '../../lexicon/types/app/bsky/feed/post'
import { AtprotoClientProvider } from '../../providers/atproto-client-provider'
import { CreateOp, DeleteOp } from '../../util/subscription'
import { Topic } from '../topic'
import { Logger, LoggingService } from '../../services/logging/logging-service'
import * as pattern from '../../text/pattern'
import * as postUtility from '../../atproto/post-utility'
import { MinifiedDb } from '../../db/minified-db'
import { isMain as isEmbedImages } from '../../lexicon/types/app/bsky/embed/images'

// マッチ時点で適合する正規表現
const regex =
  /[わワﾜ][たタﾀ][なナﾅ][れレﾚ]|((わたし|私)が恋人になれ)|(恋人になれる(わけ|訳|ワケ))|(じゃん(、)?(ムリムリ|むりむり|ﾑﾘﾑﾘ))|([^哀憐]|^)れな子([^守]|$)|甘織|王[塚塚]([^古]|$)|紗月さん|琴紗月|紫陽花さん|瀬名紫陽花|小柳香穂|ムリムリ進化論|れなコアラ|ひとよひとよに(人|ひと)見知り/
// 2つ以上マッチすれば適合するパターン
const multiPatterns = [
  /紫陽花|あじさい/,
  '真唯',
  '香穂',
  'なぎぽ',
  '紗月',
  /百合[^子姫]/,
  'ムリムリ',
  'フォーくん',
]

const lower_tags: string[] = ['わたなれ', 'わたなれアニメ'].map((tag) =>
  tag.toLowerCase()
)
const lower_englishTags: string[] = [
  'watanare',
  'theresnofreakingwayillbeyourloverunless',
].map((tag) => tag.toLowerCase())

type MatchReason = 'tag' | 'tag/en' | 'text' | 'alt' | 'multiPattern'

export class WatanareTopic implements Topic {
  private readonly atprotoProvider: AtprotoClientProvider
  private readonly log: Logger
  private ignoredDids?: string[]
  private ignoreListLastUpdateTime: number

  constructor(atprotoProvider: AtprotoClientProvider, log: LoggingService) {
    this.atprotoProvider = atprotoProvider
    this.log = log.getLogger(WatanareTopic.name)
    this.ignoreListLastUpdateTime = Number.NEGATIVE_INFINITY
  }

  handleCreation = async (
    db: MinifiedDb,
    creations: CreateOp<Record>[]
  ): Promise<void> => {
    const matches: CreateOp<Record>[] = []
    for (const creation of creations) {
      const matching = await this.isMatch(creation.author, creation.record)
      if (matching.isMatch) {
        matches.push(creation)

        this.log.info('============================')
        this.log.info(`New post found: ${matching.reason}`)
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
    db: MinifiedDb,
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

  isMatch = async (
    author: string,
    record: Record
  ): Promise<{ readonly isMatch: boolean; readonly reason?: MatchReason }> => {
    // 除外リスト
    if (await this.isIgnored(author)) {
      return { isMatch: false }
    }

    const lower_postTags = postUtility
      .getTags(record)
      .map((tag) => tag.toLowerCase())

    // nofeedは拾わない
    if (lower_postTags.includes('nofeed')) {
      return { isMatch: false }
    }

    // いずれかのタグがついていれば適合
    if (lower_postTags.some((tag) => lower_tags.includes(tag))) {
      return { isMatch: true, reason: 'tag' }
    }
    if (
      lower_postTags.some((tag) => lower_englishTags.includes(tag)) &&
      record.langs &&
      record.langs.includes('ja')
    ) {
      return { isMatch: true, reason: 'tag/en' }
    }

    const text = record.text

    // マッチ時点で適合と判断する条件
    // 本文
    if (regex.test(text)) {
      return { isMatch: true, reason: 'text' }
    }
    // alt
    const alts = isEmbedImages(record.embed)
      ? record.embed.images.map((image) => image.alt)
      : undefined
    if (alts) {
      for (const alt of alts) {
        if (regex.test(alt)) {
          return { isMatch: true, reason: 'alt' }
        }
      }
    }

    // 本文とaltを合算して2つ以上マッチすれば適合する条件
    if (
      pattern.includesCountOf([text, ...(alts ? alts : [])], multiPatterns, 2)
    ) {
      return { isMatch: true, reason: 'multiPattern' }
    }

    return { isMatch: false }
  }

  isIgnored = async (author: string): Promise<boolean> => {
    const ignore = await this.getIgnoredDids()
    return ignore.includes(author)
  }

  getIgnoredDids = async (): Promise<string[]> => {
    // 除外リストは1分間隔で更新する
    if (
      !this.ignoredDids ||
      Date.now() - this.ignoreListLastUpdateTime > 60000
    ) {
      const oldMembers = this.ignoredDids
      this.ignoredDids ??= []
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
