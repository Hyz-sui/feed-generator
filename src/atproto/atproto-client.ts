import { AtUri } from '@atproto/syntax'
import { Agent } from '@atproto/api'
import { Logger, LoggingService } from '../services/logging/logging-service'

export class AtprotoClient implements AtprotoAccessor {
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
      await new Promise((resolve) => setTimeout(resolve, 100))
    } while (cursor)
    return members
  }

  getPostLikes = async (uri: string): Promise<number> => {
    const res = await this.atpAgent.app.bsky.feed.getLikes({ uri: uri })
    return res.data.likes.length
  }

  // getPost = async (query: {
  //   repo: string
  //   collection: string
  //   rkey: string
  // }): Promise<Post | undefined> => {
  //   const res = await this.atpAgent.com.atproto.repo.getRecord({
  //     repo: query.repo,
  //     collection: query.collection,
  //     rkey: query.rkey,
  //   })
  //   const record = res.data.value
  //   return isPost(record) ? record : undefined
  // }
}

export interface AtprotoAccessor {
  getListMembers: (atUri: AtUri) => Promise<string[]>
  getPostLikes: (uri: string) => Promise<number>
  // getPost: (query: {
  //   repo: string
  //   collection: string
  //   rkey: string
  // }) => Promise<Post | undefined>
}

