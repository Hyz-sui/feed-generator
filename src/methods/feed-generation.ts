import { InvalidRequestError } from '@atproto/xrpc-server'
import { Server } from '../lexicon'
import { AppContext } from '../config'
import { AtUri } from '@atproto/syntax'
import { AlgosProvider } from '../providers/algos-provider'

export default function (
  server: Server,
  ctx: AppContext,
  algosProvider: AlgosProvider
) {
  server.app.bsky.feed.getFeedSkeleton(async ({ params, req }) => {
    const feedUri = new AtUri(params.feed)
    const algos = algosProvider.get()
    const algo = algos.find((algo) => algo.shortname === feedUri.rkey)
    if (
      !algo ||
      feedUri.hostname !== ctx.cfg.publisherDid ||
      feedUri.collection !== 'app.bsky.feed.generator'
    ) {
      throw new InvalidRequestError(
        'Unsupported algorithm',
        'UnsupportedAlgorithm'
      )
    }

    const body = await algo.get(ctx, params)
    return {
      encoding: 'application/json',
      body: body,
    }
  })
}
