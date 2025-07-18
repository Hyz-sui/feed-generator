import { Server } from '../lexicon'
import { AppContext } from '../config'
import { AtUri } from '@atproto/syntax'
import { AlgosProvider } from '../providers/algos-provider'

export default function (server: Server, ctx: AppContext, algosProvider: AlgosProvider) {
  server.app.bsky.feed.describeFeedGenerator(async () => {
    const algos = algosProvider.get()
    const feeds = algos.map((algo) => ({
      uri: AtUri.make(
        ctx.cfg.publisherDid,
        'app.bsky.feed.generator',
        algo.shortname,
      ).toString(),
    }))
    return {
      encoding: 'application/json',
      body: {
        did: ctx.cfg.serviceDid,
        feeds,
      },
    }
  })
}
