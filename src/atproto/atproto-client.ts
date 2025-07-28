import { AtUri } from '@atproto/syntax'
import {} from '@atproto/lexicon'
import AtpAgent, { Agent, Did } from '@atproto/api'
import { Logger, LoggingService } from '../services/logging/logging-service'

export class AtprotoClient {
  private readonly atpAgent: Agent
  private readonly log: Logger

  constructor(atpAgent: Agent, log: LoggingService) {
    this.atpAgent = atpAgent
    this.log = log.getLogger(AtprotoClient.name)
  }

  getListMembers = async (atUri: AtUri): Promise<string[]> => {
    var members: string[] = []
    // get all list members
    var cursor: string | undefined = undefined
    do {
      const res = await this.atpAgent.app.bsky.graph.getList({
        list: atUri.toString(),
        limit: 100,
        cursor: cursor,
      })
      const newItems = res.data.items
      members = members.concat(newItems.map((item) => item.subject.did))
      cursor = res.data.cursor
      this.log.info(`fetched ${newItems.length} items, total ${members.length}`)
      await new Promise((resolve) => setTimeout(resolve, 100))
    } while (cursor)
    return members
  }
}
