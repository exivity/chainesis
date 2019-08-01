import { iterateArray } from './utils'
import { Tracker, TrackerItem, Callback, HookOn, HookOff, Tuple } from './types'

export function hookTo (tracker: Tracker): HookOn {
  const hookOff = unHookFrom(tracker)

  return function hookOn (cb: Callback, parentCb?: Callback): Tuple {
    tracker.set(cb, {
      parent: parentCb,
      children: []
    })

    addSelfToParent(cb, tracker)

    return [
      (nextCb: Callback) => hookOn(nextCb, cb),
      () => hookOff(cb)
    ]
  }
}

export function unHookFrom (tracker: Tracker): HookOff {
  return function hookOff (cb: Callback): void {
    if (tracker.has(cb)) {
      removeSelfFromParent(cb, tracker)
      deleteChildren(cb, tracker)
      tracker.delete(cb)
    }
  }
}

function addSelfToParent (cb: Callback, tracker: Tracker) {
  const { parent: parentCb } = tracker.get(cb) as TrackerItem
  
  if (parentCb) {
    const { parent, children } = tracker.get(parentCb) as TrackerItem
    const newChildren = children.concat([cb])

    tracker.set(parentCb, {
      parent,
      children: newChildren
    })
  }
}

function removeSelfFromParent (cb: Callback, tracker: Tracker) {
  const { parent: parentCb } = tracker.get(cb) as TrackerItem

  if (parentCb) {
    const { children, parent } = tracker.get(parentCb) as TrackerItem
    const newChildren = children.filter(childCb => childCb !== cb)

    tracker.set(parentCb, {
      parent,
      children: newChildren
    })
  }
}

function deleteChildren (cb: Callback, tracker: Tracker) {
  const { children } = tracker.get(cb) as TrackerItem
      
  if (children) {
    iterateArray(children, (child: Callback) => {
      const { children } = tracker.get(child) as TrackerItem
      tracker.delete(child)
      return children
    })
  }
}
