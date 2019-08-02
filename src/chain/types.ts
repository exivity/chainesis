export interface TrackerItem {
  parent: Callback|undefined
  children: Callback[]
}

export type Tracker = Map<Callback, TrackerItem>

export interface CPSMap {
  [key: number]: ((arg: any) => void)|undefined
}

export type Callback = (arg: any, next: (arg: any) => void) => void

export type HookOn = (nextCb: Callback, parentCb?: Callback) => Tuple 

export type HookOff = (cb: Callback) => void

export type Tuple = [
  HookOn,
  HookOff
]
