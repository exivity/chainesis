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

// Check if you need to put tallest array on top
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

})
