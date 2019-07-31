export interface TrackerItem {
  parent: Callback|undefined
  children: Callback[]
}

export type Tracker = Map<Callback, TrackerItem>

export interface CPSMap {
  [key: number]: null|Callback
}

export type Callback = (arg: any, next?: Callback) => void
