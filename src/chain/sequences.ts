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

// Still want to refactor this
export function mergeEqualSequences (equalHeads: number[][], cpsMap: CPSMap) {
  equalHeads.forEach((sequence, index) => {
    if (!sequence.length) return

    if (sequence[0] > index) {
      const currentEntry = cpsMap[index]
      const allCps = sequence.map(number => cpsMap[number])

      cpsMap[index] = (res) => {
        currentEntry && currentEntry(res)
        allCps.forEach(cpsFn => cpsFn && cpsFn(res))
      }

    } else {
      delete cpsMap[index]
    }
  })
}