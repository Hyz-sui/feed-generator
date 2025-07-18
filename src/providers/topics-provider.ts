import { Topic } from "../topics/topic"
import { WatanareTopic } from "../topics/topics/watanare-topic"

const topics: Topic[] = process.env.NODE_ENV === 'production'
    ? [new WatanareTopic()]
    : [
        // デバッグ用トピックを入れるところ

        new WatanareTopic()
    ]

export class TopicsProvider {
    get = (): Topic[] => topics
}
