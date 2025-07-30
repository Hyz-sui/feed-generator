import { AppContext } from '../config'
import {
  OutputSchema,
  QueryParams,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'

import { Algo } from './algo'

export class WatanareTimelineAlgo implements Algo {
  shortname: string = 'watanare-timeline'
  get = async (
    context: AppContext,
    params: QueryParams
  ): Promise<OutputSchema> => {
    const builder = context.db
      .selectFrom('watanare_post')
      .selectAll()
      .orderBy('indexedAt', 'desc')
      .orderBy('cid', 'desc')
      .limit(params.limit)

    const res = await builder.execute()

    const feed = res.map((row) => ({
      post: row.uri,
    }))

    let cursor: string | undefined
    const last = res.at(-1)
    if (last) {
      cursor = new Date(last.indexedAt).getTime().toString(10)
    }

    return {
      cursor,
      feed,
    }
  }
}
