import { iterate } from '../chain/utils'
import { Tracker, TrackerItem, Callback, CPSMap } from './types'

export function buildSequences (tracker: Tracker): Callback[][] {
  const chains = Array.from(tracker.entries())
    .filter(([k, v]) => v.children && !v.children.length)

  return chains.reduce((sequences, [baseCb, { parent: parentCb }]) => {
    const sequence: Callback[] = parentCb
      ? [baseCb, parentCb]
      : [baseCb]

    iterate(tracker.get(parentCb as Callback) as TrackerItem, ({ parent }) => {
      if (parent) {
        sequence.push(parent)
        return tracker.get(parent)
      }
    })

    return sequences.concat([sequence])
  }, [] as Callback[][])
}

export function mergeEqualSequences (equalSequenceIndex: number[][], cpsMap: CPSMap) {
  const newCps: CPSMap = {}
  
  equalSequenceIndex.forEach((sequence, index) => {
    if (!sequence.length) {
      newCps[index] = cpsMap[index]
    }

    if (sequence[0] > index) {
      const currentEntry = cpsMap[index]
      const allCps = sequence.map(number => cpsMap[number])

      newCps[index] = (res) => {
        currentEntry && currentEntry(res)
        allCps.forEach(cpsFn => cpsFn && cpsFn(res))
      }
    }
  })

  return Object.keys(newCps).reduce((orderedMap, next, index) => {
    orderedMap[index] = newCps[Number(next)]
    return orderedMap
  }, {} as CPSMap)
}