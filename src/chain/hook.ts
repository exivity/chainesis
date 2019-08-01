import { iterateArray } from './utils'
import { Tracker, TrackerItem, Callback } from './types'

export function hookTo (tracker: Tracker) {
  const hookOff = unHookFrom(tracker)

  return function hookOn (currentCb: Callback, parentCb?: Callback) {
    tracker.set(currentCb, {
      parent: parentCb,
      children: []
    })

    addSelfToParent(currentCb, tracker)

    return [
      (nextCb: Callback) => hookOn(nextCb, currentCb),
      () => hookOff(currentCb)
    ] as const
  }
}

export function unHookFrom (tracker: Tracker) {
  return function hookOff (currentCb: Callback) {
    if (tracker.has(currentCb)) {
      removeSelfFromParent(currentCb, tracker)
      deleteChildren(currentCb, tracker)
      tracker.delete(currentCb)
    }
  }
}

function addSelfToParent (currentCb: Callback, tracker: Tracker) {
  const { parent: parentCb } = tracker.get(currentCb) as TrackerItem
  
  if (parentCb) {
    const { parent, children } = tracker.get(parentCb) as TrackerItem
    const newChildren = children.concat([currentCb])

    tracker.set(parentCb, {
      parent,
      children: newChildren
    })
  }
}

function removeSelfFromParent (currentCb: Callback, tracker: Tracker) {
  const { parent: parentCb } = tracker.get(currentCb) as TrackerItem

  if (parentCb) {
    const { children, parent } = tracker.get(parentCb) as TrackerItem
    const newChildren = children.filter(childCb => childCb !== currentCb)

    tracker.set(parentCb, {
      parent,
      children: newChildren
    })
  }
}

function deleteChildren (currentCb: Callback, tracker: Tracker) {
  const { children } = tracker.get(currentCb) as TrackerItem
      
  if (children) {
    iterateArray(children, (child: Callback) => {
      const { children } = tracker.get(child) as TrackerItem
      tracker.delete(child)
      return children
    })
  }
}
