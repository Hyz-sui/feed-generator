export type Subject = string | string[]
export type Pattern = string | RegExp

/**
 *
 * @param test 対象の文字列あるいは文字列の配列
 * @param patterns 検証パターンの配列
 * @param requiredMatchCount この数と等しいか、より多い数の検証パターンがマッチした場合にtrueが返却される
 * @returns 指定数のパターンがマッチする場合、true。それ以外はfalse。0が指定された場合、true。
 */
export const includesCountOf = (
  test: Subject,
  patterns: Pattern[],
  requiredMatchCount: number
): boolean => {
  if (requiredMatchCount === 0) {
    return true
  }
  let matchCount = 0
  const subjects = Array.isArray(test) ? test : [test]
  for (const pattern of patterns) {
    const isMatch = subjects.some((subject) =>
      typeof pattern === 'string'
        ? subject.includes(pattern)
        : pattern.test(subject)
    )
    if (isMatch) {
      matchCount++
      if (matchCount >= requiredMatchCount) {
        return true
      }
    }
  }
  return false
}
