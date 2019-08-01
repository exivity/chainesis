import { hookTo } from './hook'
import { processHeads, equalHeadsPositions } from './processHeads'
import { buildSequences, mergeEqualSequences } from './sequences'
import { getLongestLength, createCPSMap } from './utils' 
import { Tracker, CPSMap, Callback } from './types'

function processSequences (sequences: Callback[][], cpsMap: CPSMap, longest: number) {
  const processedSequences = processHeads(sequences, cpsMap, longest)
  const equalHeads = equalHeadsPositions(processedSequences)
  mergeEqualSequences(equalHeads, cpsMap)

  if (longest - 1 > 0) {
    const toFilter = equalHeads
      .filter((item, index) => item[0] > index)
      .reduce((acc, val) => acc.concat(val), [])
    const newSequences = processedSequences.map((sequence, index) => {
      if (!toFilter.includes(index)) {
        return sequence
      }
      return []
    })

    processSequences(newSequences, cpsMap, longest - 1)
  }
}

function mergeSequences (sequences: Callback[][]): Callback {
  const cpsMap = createCPSMap(sequences)
  const longestLength = getLongestLength(sequences)
  processSequences(sequences, cpsMap, longestLength)
  return cpsMap[0] as any
}

function createRunner (tracker: Tracker) {
  return function runHooks (firstArg: any) {
    const sequences = buildSequences(tracker)
    const sequence = mergeSequences(sequences)
    sequence(firstArg)
  }
}

export function chain (rootCb: Callback) {
  const tracker: Tracker = new Map()
  const hookOn = hookTo(tracker)

  const [rootHook] = hookOn(rootCb)
  const runner = createRunner(tracker)

  return [rootHook, runner]
}