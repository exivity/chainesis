import { getLongestLength, iterate, iterateArray } from '../chain/utils'

describe('getLongestLength', () => {
  test('getLongestLength takes multi-dimensional array and returns longest array', () => {
    const sequences = [
      [1,2,3],
      [1,2,3],
      [1,2,3,4],
      [1,2]
    ]

    const result = getLongestLength(sequences)

    expect(result).toBe(4)
  })
})

describe('iterate', () => {
  test('recursive iteration', () => {
    const test = [1, 2, 3, 4]

    const mock = jest.fn(arr => {
      const [first, ...rest] = arr

      if (rest.length) {
        return rest
      }
    })

    iterate(test, mock)

    expect(mock).toHaveBeenCalledTimes(4)
  })
})

describe('iterateArray', () => {
  test('recursive array iteration', () => {
    const test = [[1,2,3,4],[1,2,3,4],[1,2,3,4]]

    const mock = jest.fn(arr => {
      if (Array.isArray(arr)) {
        const [first, ...rest] = arr

        if (rest.length) {
          return rest
        }
      }

      return []
    })

    iterateArray(test, mock)

    expect(mock).toHaveBeenCalledTimes(12)
  })
})