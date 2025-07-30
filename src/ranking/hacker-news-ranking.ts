export type HnRankingPost = {
  uri: string
  indexedAt: number
  likes: number
  score: number | undefined
}

// すべての経過時間に2時間を加算して扱う
// これにより、作成直後のアイテムが過剰に高評価されることを防止できる
// 副次的な効果として、ゼロ除算が確実に発生しなくなる
const baseHour = 2
const ms2Hour = 1000 * 60 * 60

export const orderByHackerNewsRanking = (
  gravity: number,
  posts: HnRankingPost[],
  now?: number
): HnRankingPost[] =>
  posts
    .map((post) => {
      if (post.score !== undefined) {
        return { ...post }
      }
      const ageH = ((now ?? Date.now()) - post.indexedAt) / ms2Hour
      const score = post.likes / Math.pow(ageH + baseHour, gravity)
      return { ...post, score }
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
