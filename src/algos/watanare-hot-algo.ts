import {
  OutputSchema,
  QueryParams,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'

import { AppContext } from '../config'
import { Algo } from './algo'
import {
  HnRankingPost,
  orderByHackerNewsRanking,
} from '../ranking/hacker-news-ranking'
import { AtprotoClientProvider } from '../providers/atproto-client-provider'

const gravity = 1.2

export class WatanareHotAlgo implements Algo {
  lastUpdate: number | undefined
  cache: { post: string }[] = []

  readonly shortname: string = 'watanare-hot'

  readonly atprotoClientProvider: AtprotoClientProvider

  constructor(atprotoClientProvider: AtprotoClientProvider) {
    this.atprotoClientProvider = atprotoClientProvider
  }

  get = async (
    context: AppContext,
    params: QueryParams
  ): Promise<OutputSchema> => {
    const limit = params.limit
    const ordered = await this.getOrdered(context, limit)
    return {
      feed: ordered,
    }
  }

  getOrdered = async (
    context: AppContext,
    limit: number
  ): Promise<{ post: string }[]> => {
    // 1分間はキャッシュされた結果を返す
    if (this.lastUpdate && Date.now() - this.lastUpdate < 1000 * 60) {
      return this.cache
    }

    const builder = context.db
      .selectFrom('watanare_post')
      .selectAll()
      .orderBy('indexedAt', 'desc')
      .limit(1000)

    const res = await builder.execute()

    const posts: HnRankingPost[] = await Promise.all(
      res.map(async (row) => ({
        uri: row.uri,
        indexedAt: new Date(row.indexedAt).getTime(),
        likes: await this.atprotoClientProvider.get().getPostLikes(row.uri),
        score: undefined,
      }))
    )

    const ordered = orderByHackerNewsRanking(gravity, posts)
      .slice(0, limit)
      .map((post) => ({
        post: post.uri,
      }))
    this.cache = ordered
    this.lastUpdate = Date.now()

    return ordered
  }
}
