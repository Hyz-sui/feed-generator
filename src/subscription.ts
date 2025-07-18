import { Database } from './db'
import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { TopicsProvider } from './providers/topics-provider'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  // ポストは話題ごとのDBに分けて保存される
  // firehoseの購読は1件で済む

  readonly topicsProvider: TopicsProvider

  constructor(topicsProvider: TopicsProvider, db: Database, service: string) {
    super(db, service)
    this.topicsProvider = topicsProvider
  }

  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    for (const topic of this.topicsProvider.get()) {
      topic.handleDeletion(this.db, ops.posts.deletes)
      topic.handleCreation(this.db, ops.posts.creates)
    }
  }
}
