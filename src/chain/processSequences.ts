import { mergeEqualSequences } from './sequences'
import { Callback, CPSMap } from './types'

export function equalSequenceIndex (sequences: Callback[][]) {
  const equalSequenceIndex: number[][] = []

  sequences.forEach((sequence, index) => {
    equalSequenceIndex[index] = []
    sequences.forEach((seq, i) => {
      if (index !== i && seq[0] === sequence[0]) {
        equalSequenceIndex[index].push(i)
      }
    })
  })

  return equalSequenceIndex
}

export function processFirstOfSequences (
  sequences: Callback[][], 
  cpsMap: CPSMap, 
  longest: number
): [Callback[][], CPSMap] {
  const processedCPSMap: CPSMap = {}

  const processedSequences = sequences.map((sequence, index) => {
    if (sequence.length === longest) {
      const [firstCb, ...rest] = sequence
      const prevCb = cpsMap[index]

      if (prevCb) {
        processedCPSMap[index] = (res) => firstCb(res, prevCb)
      } else {
        processedCPSMap[index] = (res) => firstCb(res, () => ({}))
      }

      return rest
    }

    return sequence
  })

  return [processedSequences, processedCPSMap]
}

export function processSequences (
  sequences: Callback[][], 
  longest: number, 
  cpsMap: CPSMap = {}
): CPSMap {
  const [processedSequences, processedCpsMap] = processFirstOfSequences(sequences, cpsMap, longest)
  const equalSeqIndex = equalSequenceIndex(processedSequences)
  const mergedCpsMap = mergeEqualSequences(equalSeqIndex, processedCpsMap)
  console.log(cpsMap)
  if (longest - 1 > 0) {
    const toFilter = equalSeqIndex
      .filter((item, index) => item[0] > index)
      .reduce((acc, val) => acc.concat(val), [])

    const newSequences = processedSequences.filter((_, index) => !toFilter.includes(index))
    return processSequences(newSequences, longest - 1, mergedCpsMap)
  }

  return mergedCpsMap
}
