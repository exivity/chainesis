import { mergeEqualSequences } from './sequences'
import { Callback, CPSMap } from './types'

export function equalHeadsPositions (sequences: Callback[][]) {
  const equalHeadsPositions: number[][] = []

  sequences.forEach((sequence, index) => {
    equalHeadsPositions[index] = []
    sequences.forEach((seq, i) => {
      if (index !== i && seq[0] === sequence[0]) {
        equalHeadsPositions[index].push(i)
      }
    })
  })

  return equalHeadsPositions
}

export function processFirstOfSequences (
  sequences: Callback[][], 
  cpsMap: CPSMap, 
  longest: number
) {
  return sequences.map((sequence, index) => {
    if (sequence.length === longest) {
      const [firstCb, ...rest] = sequence
      const prevCb = cpsMap[index]

      if (prevCb) {
        cpsMap[index] = (res) => firstCb(res, prevCb)
      } else {
        cpsMap[index] = (res) => firstCb(res, () => ({}))
      }

      return rest
    }

    return sequence
  })
}

export function processSequences (
  sequences: Callback[][], 
  longest: number, 
  cpsMap: CPSMap = {}
): CPSMap {
  const processedSequences = processFirstOfSequences(sequences, cpsMap, longest)
  const equalHeads = equalHeadsPositions(processedSequences)
  const newCpsMap = mergeEqualSequences(equalHeads, cpsMap)

  if (longest - 1 > 0) {
    const toFilter = equalHeads
      .filter((item, index) => item[0] > index)
      .reduce((acc, val) => acc.concat(val), [])

    const newSequences = processedSequences.filter((_, index) => !toFilter.includes(index))
    return processSequences(newSequences, longest - 1, newCpsMap)
  }

  return newCpsMap
}
