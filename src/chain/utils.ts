import { Callback, CPSMap } from './types'

export function getLongestLength (masterArr: any[]): number {
  let longest = -Infinity

  masterArr.forEach((arr) => {
    if (arr.length > longest) {
      longest = arr.length
    }
  })

  return longest
}

export function iterate (obj: object, cb: (arg: any) => any) {
  if (obj) {
    const result = cb(obj)
    iterate(result, cb)
  }
}

export function iterateArray (arr: any[], callback: (arg: any) => any[]) {
  if (arr && arr.length) {
    arr.forEach(item => {
      const result = callback(item)
      iterateArray(result, callback)
    })
  }
}

export function createCPSMap (sequences: Callback[][]): CPSMap {
  return sequences.reduce((map, sequence, index) => {
    map[index] = null
    return map
  }, {} as CPSMap)
}