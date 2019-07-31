export function equalHeadsPositions (sequences: Callback[][]) {
  // Before we go on to next tick, first merge and delete rows with same first element (same parents)
  const equalHeadsPositions: number[][] = []
  // rows with same parents
  sequences.forEach((sequence, index) => {
    equalHeadsPositions[index] = []
    sequences.forEach((seq, i) => {
      if (index !== i && seq[0] === sequence[0]) {
        equalHeadsPositions[index].push(i)
      }
    })
  })

  return equalHeadsPositions
}

export function processHeads (sequences: Callback[][], cpsMap: CPSMap, longest: number) {
  return sequences.map((sequence, index) => {
    const clonedSequence = [...sequence]
    // only process longests
    if (clonedSequence.length && clonedSequence.length === longest) {
      const cb = clonedSequence.shift() as Callback
      if (cpsMap[index]) {
        const cpsFn = cpsMap[index] as Callback
        cpsMap[index] = (res) => cb(res, cpsFn)
      } else {
        cpsMap[index] = cb
      }
    }

    return clonedSequence
  })
}