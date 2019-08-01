import { hookTo } from './hook'
import { processSequences } from './processSequences'
import { buildSequences } from './sequences'
import { getLongestLength } from './utils' 
import { Tracker, Callback, HookOn } from './types'

function createRunner (tracker: Tracker) {
  return function runHooks (firstArg: any) {
    const sequences = buildSequences(tracker)
    const finishedMap = processSequences(sequences, getLongestLength(sequences))
    return finishedMap[0](firstArg)
  }
}

export function chain (rootCb: Callback): [HookOn, (arg: any) => void] {
  const cbTracker: Tracker = new Map()
  const hookOn = hookTo(cbTracker)

  const [rootHook] = hookOn(rootCb)
  const runner = createRunner(cbTracker)

  return [rootHook, runner]
}