export type Subject = string | string[]
export type Pattern = string | RegExp

export const includesCountOf = (
  test: Subject,
  patterns: Pattern[],
  requiredMatchCount: number
): boolean => {
  let matchCount = 0
  const subjects = Array.isArray(test) ? test : [test]
  for (const pattern of patterns) {
    for (const subject of subjects) {
      if (typeof pattern === 'string') {
        if (subject.includes(pattern)) {
          matchCount++
          // 1度マッチしたら、同じパターンには二度とマッチしない
          break
        }
      } else {
        if (pattern.test(subject)) {
          matchCount++
          // 1度マッチしたら、同じパターンには二度とマッチしない
          break
        }
      }
      // 目標数に達した時点でtrueを返却
      if (matchCount >= requiredMatchCount) {
        return true
      }
    }
  }
  return false
}
