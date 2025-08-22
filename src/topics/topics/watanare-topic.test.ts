import { AtprotoClientProvider } from '../../providers/atproto-client-provider'
import { LoggingService } from '../../services/logging/logging-service'
import { ConsoleLoggingService } from '../../services/logging/console-logging-service'
import { Record as Post } from '../../lexicon/types/app/bsky/feed/post'
import { WatanareTopic } from './watanare-topic'

describe('WatanareTopic', () => {
  const ignores = ['did:plc:spam', 'did:plc:egg']
  const niceDid = 'did:plc:gentleman'
  const atprotoClientProvider = new AtprotoClientProvider({
    getListMembers: async (_) => ignores,
    getPostLikes: async (uri) => uri.length,
  })
  const loggingService: LoggingService = new ConsoleLoggingService()
  const topic = new WatanareTopic(atprotoClientProvider, loggingService)

  describe('isMatch', () => {
    // Test cases for various matching conditions
    it('should return true for posts with matching facet tags', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        facets: [
          {
            index: { byteStart: 0, byteEnd: 5 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#tag',
                tag: 'わたなれ',
              },
            ],
          },
        ],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('tag')
    })

    it('should return true for posts with matching silent tags', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        tags: ['わたなれ'],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('tag')
    })

    it('should return true for posts with matching English facet tags and Japanese language', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        facets: [
          {
            index: { byteStart: 0, byteEnd: 5 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#tag',
                tag: 'watanare',
              },
            ],
          },
        ],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('tag/en')
    })

    it('should return false for posts with matching English facet tags but non-Japanese language', async () => {
      const post: Post = {
        text: 'This is a test post',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['en'],
        facets: [
          {
            index: { byteStart: 0, byteEnd: 5 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#tag',
                tag: 'watanare',
              },
            ],
          },
        ],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(false)
      expect(result.reason).toBeUndefined()
    })

    it('should return true for posts with matching English silent tags and Japanese language', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        tags: ['watanare'],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('tag/en')
    })

    it('should return false for posts with matching English silent tags but non-Japanese language', async () => {
      const post: Post = {
        text: 'This is a test post',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['en'],
        tags: ['watanare'],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(false)
      expect(result.reason).toBeUndefined()
    })

    it('should return true for posts with matching text', async () => {
      const post: Post = {
        text: 'わたなれはいいぞ',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('text')
    })

    it('should return true for posts with matching alt text', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        embed: {
          $type: 'app.bsky.embed.images',
          images: [
            {
              alt: 'わたなれ',
              image: {
                $type: 'blob',
                mimeType: 'image/jpeg',
                ref: {
                  $link: 'example12341234',
                },
                size: 100,
              },
            },
          ],
        },
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(true)
      expect(result.reason).toBe('alt')
    })

    // it('should return true for posts with multiple matching patterns', async () => {
    //
    // })

    it('should return false for posts with "nofeed" tag', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        tags: ['nofeed', 'わたなれ'],
      }
      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(false)
      expect(result.reason).toBeUndefined()
    })

    it('should return false for posts from ignored authors', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        tags: ['わたなれ'],
      }
      const result = await topic.isMatch(ignores[0], post)
      expect(result.isMatch).toBe(false)
      expect(result.reason).toBeUndefined()
    })

    it('should return false for non-matching posts', async () => {
      const post: Post = {
        text: 'これはテスト投稿です',
        $type: 'app.bsky.feed.post',
        createdAt: '2024-01-01T00:00:00.000Z',
        langs: ['ja'],
        tags: ['テスト'],
        embed: {
          $type: 'app.bsky.embed.images',
          images: [
            {
              alt: 'テスト',
              image: {
                $type: 'blob',
                mimeType: 'image/jpeg',
                ref: {
                  $link: 'example12341234',
                },
                size: 100,
              },
            },
          ],
        },
        facets: [
          {
            index: { byteStart: 0, byteEnd: 4 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#tag',
                tag: 'テスト',
              },
            ],
          },
        ],
      }

      const result = await topic.isMatch(niceDid, post)
      expect(result.isMatch).toBe(false)
      expect(result.reason).toBeUndefined()
    })
  })

  describe('isIgnored', () => {
    it('should return true if the author is in the ignored list', async () => {
      const result = await topic.isIgnored(ignores[0])
      expect(result).toBe(true)
    })

    it('should return false if the author is not in the ignored list', async () => {
      const result = await topic.isIgnored(niceDid)
      expect(result).toBe(false)
    })
  })
})
