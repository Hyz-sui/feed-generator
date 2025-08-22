import { includesCountOf } from './pattern'

const str1 = 'suzu'
const str2 = 'atori'
const str3 = 'mizuka'

const pat4 = /yuu?/
const pat5 = /[rl]u[rl]a/
const pat6 = /kiyo[rl]a[kcq]a/

describe('includesCountOf', () => {
  it('should handle basic string matching', () => {
    // 単一の文字列と、文字列のマッチングの基本的なテスト
    expect(
      includesCountOf(`Suzu is my favorite character.`.toLowerCase(), [str1], 1)
    ).toBe(true)
    expect(
      includesCountOf(
        `Atori is my favorite character.`.toLowerCase(),
        [str2],
        1
      )
    ).toBe(true)
    expect(
      includesCountOf(`Suzu and Atori are good.`.toLowerCase(), [str1, str2], 2)
    ).toBe(true)
    expect(
      includesCountOf(`Suzu and Atori are good.`.toLowerCase(), [str1, str3], 2)
    ).toBe(false)
    expect(
      includesCountOf(
        `Suzu and Atori and Mizuka are good.`.toLowerCase(),
        [str1, str2, str3],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(
        `Suzu and Atori and Mizuka are good.`.toLowerCase(),
        [str1, str2, str3, 'hoge'],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(
        `Suzu and Atori and Mizuka are good.`.toLowerCase(),
        [str1, str2, str3, 'hoge'],
        4
      )
    ).toBe(false)
  })

  it('should handle array of strings as subject', () => {
    // 文字列の配列と、文字列のマッチングのテスト
    expect(
      includesCountOf(
        [
          `Suzu is my favorite character.`.toLowerCase(),
          `Atori is my favorite character.`.toLowerCase(),
        ],
        [str1],
        1
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Suzu is my favorite character.`.toLowerCase(),
          `Atori is my favorite character.`.toLowerCase(),
        ],
        [str1, str2],
        2
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Suzu is my favorite character.`.toLowerCase(),
          `Atori is my favorite character.`.toLowerCase(),
        ],
        [str1, str3],
        2
      )
    ).toBe(false)
    expect(
      includesCountOf(
        [
          `Suzu and Atori are good.`.toLowerCase(),
          `Suzu and Mizuka are good.`.toLowerCase(),
        ],
        [],
        1
      )
    ).toBe(false)
    expect(includesCountOf([], [str1], 1)).toBe(false)
    expect(includesCountOf([], [], 1)).toBe(false)
  })

  it('should handle regex patterns', () => {
    // 正規表現パターンのテスト
    expect(
      includesCountOf(`Yuu is my favorite character.`.toLowerCase(), [pat4], 1)
    ).toBe(true)
    expect(
      includesCountOf(`Rura is my favorite character.`.toLowerCase(), [pat5], 1)
    ).toBe(true)
    expect(
      includesCountOf(
        `Kiyoraka is my favorite character.`.toLowerCase(),
        [pat6],
        1
      )
    ).toBe(true)
    expect(
      includesCountOf(`Yuu and Rura are good.`.toLowerCase(), [pat4, pat5], 2)
    ).toBe(true)
    expect(
      includesCountOf(
        `Yuu and Rura and Kiyoraka are good.`.toLowerCase(),
        [pat4, pat5, pat6],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(`Yuu and Rura are good.`.toLowerCase(), [pat4, pat6], 2)
    ).toBe(false)
    expect(
      includesCountOf(
        `Yuu and Rura and Kiyoraka are good.`.toLowerCase(),
        [pat4, pat5, pat6, /hoge/],
        4
      )
    ).toBe(false)
    expect(
      includesCountOf(
        `Yuu and Rura and Kiyoraka are good.`.toLowerCase(),
        [pat4, pat5, pat6, /hoge/],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Yuu is my favorite character.`.toLowerCase(),
          `Rura is my favorite character.`.toLowerCase(),
        ],
        [pat4],
        1
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Yuu is my favorite character.`.toLowerCase(),
          `Rura is my favorite character.`.toLowerCase(),
        ],
        [pat4, pat5],
        2
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Yuu is my favorite character.`.toLowerCase(),
          `Rura is my favorite character.`.toLowerCase(),
        ],
        [pat4, pat6],
        2
      )
    ).toBe(false)
    expect(
      includesCountOf(
        [
          `Yuu and Rura are good.`.toLowerCase(),
          `Yuu and Kiyoraka are good.`.toLowerCase(),
        ],
        [pat4, pat5],
        2
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Yuu and Rura are good.`.toLowerCase(),
          `Yuu and Kiyoraka are good.`.toLowerCase(),
        ],
        [pat4, pat5, pat6],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Yuu and Rura are good.`.toLowerCase(),
          `Yuu and Kiyoraka are good.`.toLowerCase(),
        ],
        [],
        1
      )
    ).toBe(false)
    expect(includesCountOf([], [pat4], 1)).toBe(false)
  })

  it('should handle mixed string and regex patterns', () => {
    // 文字列と正規表現が混在するパターンのテスト
    expect(
      includesCountOf(`Suzu and Yuu are good.`.toLowerCase(), [str1, pat4], 2)
    ).toBe(true)
    expect(
      includesCountOf(
        `Suzu and Yuu and Atori are good.`.toLowerCase(),
        [str1, pat4, str2],
        3
      )
    ).toBe(true)
    expect(
      includesCountOf(
        `Suzu and Yuu and Atori and Rura and Kiyoraka are good.`.toLowerCase(),
        [str1, pat4, str2, pat5, pat6],
        5
      )
    ).toBe(true)
    expect(
      includesCountOf(
        `Suzu and Yuu and Atori and Rura and Kiyoraka are good.`.toLowerCase(),
        [str1, pat4, str2, pat5, pat6, 'hoge'],
        6
      )
    ).toBe(false)
    expect(
      includesCountOf(
        `Suzu and Yuu and Atori and Rura and Kiyoraka are good.`.toLowerCase(),
        [str1, pat4, str2, pat5, pat6, 'hoge'],
        5
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Suzu and Yuu are good.`.toLowerCase(),
          `Atori and Rura are good.`.toLowerCase(),
        ],
        [str1, pat4, str2, pat5],
        4
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Suzu and Yuu are good.`.toLowerCase(),
          `Atori and Rura are good.`.toLowerCase(),
        ],
        [str1, pat4, str2, pat5, pat6],
        4
      )
    ).toBe(true)
    expect(
      includesCountOf(
        [
          `Suzu and Yuu are good.`.toLowerCase(),
          `Atori and Rura are good.`.toLowerCase(),
        ],
        [str1, pat4, str2, pat5, pat6],
        5
      )
    ).toBe(false)
  })

  it('should not count duplicate matches for the same pattern', () => {
    // 同じパターンが複数回一致しても、重複してカウントしないテスト
    expect(includesCountOf(`Suzu Suzu Suzu`.toLowerCase(), [str1], 1)).toBe(
      true
    )
    expect(includesCountOf(`Suzu Suzu Suzu`.toLowerCase(), [str1], 2)).toBe(
      false
    )
    expect(includesCountOf(`Yuu Yuu Yuu`.toLowerCase(), [pat4], 1)).toBe(true)
    expect(includesCountOf(`Yuu Yuu Yuu`.toLowerCase(), [pat4], 2)).toBe(false)
  })

  it('should return true when requiredMatchCount is 0', () => {
    // requiredMatchCount が0の場合に true を返すテスト
    expect(includesCountOf("I'm Maria from ADC".toLowerCase(), [str1], 0)).toBe(
      true
    )
  })

  it('should return false when patterns array is empty and requiredMatchCount is greater than 0', () => {
    // patterns配列が空でrequiredMatchCountが0より大きい場合にfalseを返すテスト
    expect(
      includesCountOf(`Suzu is my favorite character.`.toLowerCase(), [], 1)
    ).toBe(false)
    expect(includesCountOf([`Suzu`.toLowerCase()], [], 1)).toBe(false)
  })

  it('should return true when multiple subjects match the same pattern but only count once per pattern', () => {
    // 複数の対象が同じパターンに一致しても、パターンごとに1回のみカウントするテスト
    expect(
      includesCountOf([`Suzu`.toLowerCase(), `Suzu`.toLowerCase()], [str1], 1)
    ).toBe(true)
    expect(
      includesCountOf([`Suzu`.toLowerCase(), `Suzu`.toLowerCase()], [str1], 2)
    ).toBe(false)
    expect(
      includesCountOf([`Yuu`.toLowerCase(), `Yuu`.toLowerCase()], [pat4], 1)
    ).toBe(true)
    expect(
      includesCountOf([`Yuu`.toLowerCase(), `Yuu`.toLowerCase()], [pat4], 2)
    ).toBe(false)
  })
})
