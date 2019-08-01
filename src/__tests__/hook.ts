import { hookTo, unHookFrom } from '../chain/hook'
import { createTracker } from '../testUtils'

const fakeRootCb = () => ({})
const fakeCbOne = () => ({})
const fakeCbTwo = () => ({})
const fakeCbThree = () => ({})

describe('hookTo', () => {
  test('hookTo returns hookOn function', () => {  
    const tracker = createTracker()
    expect(typeof hookTo(tracker)).toBe('function')
  })

  test('hookOn function return a tuple with two functions', () => {
    const tracker = createTracker()
    const hookOn = hookTo(tracker)
    const tuple = hookOn(fakeRootCb)

    expect(typeof tuple[0]).toBe('function')
    expect(typeof tuple[1]).toBe('function')
  })

  test('hookOn registers passed callback to tracker', () => {
    const tracker = createTracker()
    const hookOn = hookTo(tracker)
    
    hookOn(fakeRootCb)
    const registeredCb = tracker.get(fakeRootCb)

    expect(tracker.size).toBe(1)
    expect(registeredCb).toEqual({
      parent: undefined,
      children: []
    })
  })

  describe('hookOn', () => {
    test('first function in the tuple is another hookOn which registers passed callback to itself', () => {
      const tracker = createTracker()
      const hookOn = hookTo(tracker)
      const [anotherHookOn] = hookOn(fakeRootCb)

      anotherHookOn(fakeCbOne)
      const registeredRootCb = tracker.get(fakeRootCb)
      const registeredChildCb = tracker.get(fakeCbOne)

      expect(tracker.size).toBe(2)
      expect(registeredRootCb).toEqual({ parent: undefined, children: [fakeCbOne] })
      expect(registeredChildCb).toEqual({ parent: fakeRootCb, children: [] })
    })

    test('I can re-use hookOn to register multiple callbacks', () => {
      const tracker = createTracker()
      const hookOn = hookTo(tracker)
      const [anotherHookOn] = hookOn(fakeRootCb)

      anotherHookOn(fakeCbOne)
      anotherHookOn(fakeCbTwo)
      const registeredRootCb = tracker.get(fakeRootCb)
      const registeredChildCbOne = tracker.get(fakeCbOne)
      const registeredChildCbTwo = tracker.get(fakeCbTwo)

      expect(tracker.size).toBe(3)
      expect(registeredRootCb).toEqual({ parent: undefined, children: [fakeCbOne, fakeCbTwo] })
      expect(registeredChildCbOne).toEqual({ parent: fakeRootCb, children: [] })
      expect(registeredChildCbTwo).toEqual({ parent: fakeRootCb, children: [] })
    })

    test('second function in the tuple is an unHook function to deregister itself and children', () => {
      const tracker = createTracker()

      const hookOn = hookTo(tracker)
      const [anotherHookOn, deregisterRoot] = hookOn(fakeRootCb)

      anotherHookOn(fakeCbOne)
      const [_, deregisterTwo] = anotherHookOn(fakeCbTwo)

      deregisterTwo()
      expect(tracker.size).toBe(2)
      expect(tracker.get(fakeRootCb)!.children.length).toBe(1)

      deregisterRoot()
      expect(tracker.size).toBe(0)
    })
  })
})

describe('unHookFrom', () => {
  test('unHookFrom returns hookOff function', () => {  
    const tracker = createTracker()
    expect(typeof hookTo(tracker)).toBe('function')
  })

  test('hookOff removes registered function from map', () => {
    const tracker = createTracker()
    const hookOn = hookTo(tracker)
    const hookOff = unHookFrom(tracker)
    
    hookOn(fakeRootCb)
    expect(tracker.size).toBe(1)
    hookOff(fakeRootCb)
    expect(tracker.size).toBe(0)
  })

  test('hookOff removes all child callbacks associated with removed callback', () => {
    const tracker = createTracker()
    const hookOff = unHookFrom(tracker)

    const hookOn = hookTo(tracker)
    const [hookOnOne] = hookOn(fakeRootCb)
    
    hookOnOne(fakeCbOne)
    const [hookOnTwo] = hookOnOne(fakeCbTwo)
    hookOnTwo(fakeCbThree)

    expect(tracker.size).toBe(4)
    hookOff(fakeCbTwo)

    const rootCb = tracker.get(fakeRootCb)
    const cbOne = tracker.get(fakeCbOne)

    expect(tracker.size).toBe(2)
    expect(rootCb!.children.length).toBe(1)
    expect(rootCb!.parent).toBe(undefined)
    expect(cbOne!.children.length).toBe(0)
    expect(cbOne!.parent).toBe(fakeRootCb)
  })
})
