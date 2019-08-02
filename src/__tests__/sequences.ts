import { buildSequences, mergeEqualSequences } from '../chain/sequences'
import { createTracker } from '../testUtils'

const fakeRootCb = () => ({})
const fakeCbOne = () => ({})
const fakeCbTwo = () => ({})
const fakeCbThree = () => ({})

const root = {
  parent: undefined,
  children: [fakeCbOne, fakeCbTwo]
}

const one = {
  parent: fakeRootCb,
  children: [fakeCbThree]
}

const two = {
  parent: fakeRootCb,
  children: []
}

const three = {
  parent: fakeCbOne,
  children: []
}

describe('buildSequences', () => {
  test('converts map into multi dimensional callback array (as sequences)', () => {
    const tracker = createTracker()

    tracker.set(fakeRootCb, root)
    tracker.set(fakeCbOne, one)
    tracker.set(fakeCbTwo, two)
    tracker.set(fakeCbThree, three)

    const sequences = buildSequences(tracker)
    expect(sequences.length).toBe(2)
    expect([fakeCbTwo, fakeRootCb]).toEqual(sequences[0])
    expect([fakeCbThree, fakeCbOne, fakeRootCb]).toEqual(sequences[1])
  })
})

describe('mergeEqualSequences', () => {
  test('mergeEqualSequences merges key/value pairs of map', () => {
    const fakeCpsMap = {
      0: fakeCbThree,
      1: fakeCbOne,
      2: fakeCbTwo
    }

    const equalInfo = [[1], [0], []]

    const resultCPSMap = mergeEqualSequences(equalInfo, fakeCpsMap)

    expect(Object.keys(resultCPSMap)).toEqual(['0', '1'])
    expect(resultCPSMap[0]).not.toBe(fakeCbThree)
    expect(resultCPSMap[0]).not.toBe(fakeCbOne)
    expect(resultCPSMap[1]).toBe(fakeCbTwo)
    expect(resultCPSMap).not.toBe(fakeCpsMap)
  })
})
