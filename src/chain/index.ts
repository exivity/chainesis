import { Tracker, TrackerItem, CPSMap, Callback } from './types'

function getLongestLength (masterArr: any[]): number {
  let longest = -Infinity

  masterArr.forEach((arr) => {
    if (arr.length > longest) {
      longest = arr.length
    }
  })

  return longest
}

function iterate (obj: object, cb: (arg: any) => any) {
  if (obj) {
    const result = cb(obj)
    iterate(result, cb)
  }
}

function iterateArray (arr: any[], callback: (arg: any) => any[]) {
  if (arr && arr.length) {
    arr.forEach(item => {
      const result = callback(item)
      iterateArray(result, callback)
    })
  }
}

function hookTo (tracker: Tracker) {
  const hookOff = unHookFrom(tracker)

  return function hookOn (currentCb: Callback, parentCb: Callback = () => ({})) {
    tracker.set(currentCb, {
      parent: parentCb,
      children: []
    })

    if (parentCb && tracker.has(parentCb)) {
      const { parent, children } = tracker.get(parentCb) as TrackerItem
      const newChildren = children.concat([currentCb])

      tracker.set(parentCb, {
        parent,
        children: newChildren
      })
    }

    return [
      (childCb: Callback) => hookOn(childCb, currentCb),
      () => hookOff(currentCb, parentCb)
    ] as const
  }
}

function unHookFrom (tracker: Tracker) {
  return function HookOff (currentCb: Callback, parentCb: Callback = () => ({})) {
    if (parentCb && tracker.has(parentCb)) {
      const { parent, children } = tracker.get(parentCb) as TrackerItem
      const newChildren = children.filter(childCb => childCb !== currentCb)

      tracker.set(parentCb, {
        parent,
        children: newChildren
      })
    }

    if (tracker.has(currentCb)) {
      const toHookOff = tracker.get(currentCb) as TrackerItem

      if (toHookOff.children) {
        iterateArray(toHookOff.children, (child: Callback) => {
          const { children } = tracker.get(child) as TrackerItem
          tracker.delete(child)
          return children
        })
      }
    }
  }
}

function buildSequences (tracker: Tracker): Callback[][] {
  const chains = Array.from(tracker.entries())
    .filter(([k, v]) => v.children && !v.children.length)

  return chains.reduce((sequences, [baseCb, { parent: parentCb }]) => {
    const sequence = parentCb
      ? [baseCb, parentCb]
      : [baseCb]

    iterate(tracker.get(parentCb as Callback) as TrackerItem, ({ parent }) => {
      if (parent) {
        sequence.push(parent)
        return tracker.get(parent)
    }
    })

    // @ts-ignore
    return sequences.concat([sequence])
  }, [])
}

function createCPSMap (sequences: Callback[][]): CPSMap {
  return sequences.reduce((map, sequence, index) => {
    map[index] = null
    return map
  }, {} as CPSMap)
}

function mergeEqualSequences (equalHeads: number[][], cpsMap: CPSMap) {
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

function equalHeadsPositions (sequences: Callback[][]) {
  // Before we go on to next tick, first merge and delete rows with same first element (same parents)
  const equalHeadsPositions: number[][] = []
  // rows with same parents
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

function processHeads (sequences: Callback[][], cpsMap: CPSMap, longest: number) {
  return sequences.map((sequence, index) => {
    const clonedSequence = [...sequence]
    // only process longests
    if (clonedSequence.length && clonedSequence.length === longest) {
      const cb = clonedSequence.shift() as Callback
      if (cpsMap[index]) {
        const cpsFn = cpsMap[index] as Callback
        cpsMap[index] = (res) => cb(res, cpsFn)
      } else {
        cpsMap[index] = cb
      }
    }

    return clonedSequence
  })
}

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