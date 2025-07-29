import { Topic } from '../topics/topic'
import { WatanareTopic } from '../topics/topics/watanare-topic'

export class TopicsProvider {
  private readonly topics: Topic[]

  constructor(topics: Topic[]) {
    this.topics = topics
  }

  get = (): Topic[] => this.topics
}
