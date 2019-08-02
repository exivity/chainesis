import { 
  equalSequenceIndex,
  processFirstOfSequences, 
  processSequences 
} from '../chain/processSequences' 

import { CPSMap } from '../chain/types'

const fakeRootCb = (res: string) => res + 'root'
const fakeCbOne = (res: string) => res + 'one'
const fakeCbTwo = (res: string) => res + 'two'
const fakeCbThree = (res: string) => res + 'three'
const fakeCbFour = (res: string) => res + 'four'

describe('equalSequenceIndex', () => {
  test('returns a multi dimensional array with numbers indicating the position of equal sequences', () => {
    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const result = equalSequenceIndex(sequences)

    expect(result).toEqual([
      [1],
      [0],
      []
    ])
  })
})

describe('processFirstOfSequences', () => {
  test('processFirstOfSequences returns a typle with new sequences and new cpsMap', () => {
    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const cpsMap: CPSMap = {
      0: undefined,
      1: undefined,
      2: fakeCbFour
    }

    const [newSeq, newCpsMap] = processFirstOfSequences(sequences, cpsMap, 3)

    expect(newSeq).not.toBe(sequences)
    expect(newCpsMap).not.toBe(cpsMap)
  })

  test('processFirstOfSequences only processes longest sequences and returns new sequence without first element', () => {
    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbFour, fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const cpsMap: CPSMap = {
      0: undefined,
      1: undefined,
      2: fakeCbFour
    }

    const [newSeq] = processFirstOfSequences(sequences, cpsMap, 3)

    expect(newSeq.length).toBe(3)
    expect(newSeq[0]).toEqual([fakeCbOne, fakeRootCb])
    expect(newSeq[1]).toEqual([fakeCbOne, fakeRootCb])
    expect(newSeq[2]).toEqual([fakeCbTwo, fakeRootCb])
  })

  test('processFirstOfSequences puts processed callbacks in a map', () => {
    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const cpsMap: CPSMap = {}

    const [seqOne, mapOne] = processFirstOfSequences(sequences, cpsMap, 3)
    const [seqTwo, mapTwo] = processFirstOfSequences(seqOne, mapOne, 2)

    expect(mapOne[0]).toBeUndefined()
    expect(mapOne[1]).toBeUndefined()
    expect(typeof mapOne[2]).toBe('function')
    expect(Object.keys(mapOne)).toEqual(['2'])

    expect(typeof mapTwo[0]).toBe('function')
    expect(typeof mapTwo[1]).toBe('function')
    expect(Object.keys(mapTwo)).toEqual(['0', '1', '2'])
  })
  
  test('processFirstOfSequences connect all sequence callbacks with eachother', () => {
    const fakeCbOne = (res: string) => {
      expect(res).toBe('rootstart')
    }

    const fakeCbThree = (res: string) => {
      expect(res).toBe('tworootstart')
    }

    const fakeCbTwo = (res: string, next: any) => {
      expect(res).toBe('rootstart')
      next('two' + res)
    }

    const fakeRootCb = (res: string, next: any) => {
      expect(res).toBe('start')
      next('root' + res)
    }

    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const cpsMap: CPSMap = {}

    const [seqOne, mapOne] = processFirstOfSequences(sequences, cpsMap, 3)
    const [seqTwo, mapTwo] = processFirstOfSequences(seqOne, mapOne, 2)
    const [seqThree, mapThree] = processFirstOfSequences(seqTwo, mapTwo, 1)

    // @ts-ignore
    mapThree[0]('start')
    // @ts-ignore
    mapThree[1]('start')
    // @ts-ignore
    mapThree[2]('start')
  })
})

describe('processSequences', () => {
  test('processSequences processes all sequences into a single entry in cpsMap', () => {
    const fakeCbOne = (res: string) => {
      expect(res).toBe('rootstart')
    }

    const fakeCbThree = (res: string) => {
      expect(res).toBe('tworootstart')
    }

    const fakeCbTwo = (res: string, next: any) => {
      expect(res).toBe('rootstart')
      next('two' + res)
    }

    const fakeRootCb = (res: string, next: any) => {
      expect(res).toBe('start')
      next('root' + res)
    }

    const sequences = [
      [fakeCbOne, fakeRootCb],
      [fakeCbOne, fakeRootCb],
      [fakeCbThree, fakeCbTwo, fakeRootCb]
    ]

    const resultingMap = processSequences(sequences, 3)

    expect(Object.keys(resultingMap)).toEqual(['0'])
    // @ts-ignore
    resultingMap[0]('start')
  })
})