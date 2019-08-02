import { chain } from '../chain'

const [hookOn, perform] = chain((result, next) => {
  setTimeout(() => {
    console.log('1', result)
    next(result + ' one')
  }, 2000)
})

const [hookOne] = hookOn((result, next) => {
  setTimeout(() => {
    console.log('2', result)
    next(result + ' two')
  }, 2000)
})

const [hookTwo] = hookOne((result, next) => {
  setTimeout(() => {
    console.log('3', result)
    next(result + ' two22')
  }, 2000)
})

hookOne((result, next) => {
  setTimeout(() => {
    console.log('4', result)
    next(result + 'three')
  }, 2000)
})

hookOne((result, next) => {
  setTimeout(() => {
    console.log('5', result)
    next(result + 'three')
  }, 2000)
})

const [anotherOne] = hookOn((result, next) => {
  setTimeout(() => {
    console.log('anothger one on root', result)
    next(result + ' two')
  }, 2000)
})

const [test] = anotherOne((result, next) => {
  setTimeout(() => {
    console.log('anothger one on root another one', result)
    next(result + ' two')
  }, 2000)
})

test((result, next) => {
  setTimeout(() => {
    console.log('teeeeest', result)
    next(result + ' two')
  }, 2000)
})

const [flooker] = hookTwo((result, next) => {
  setTimeout(() => {
    console.log('6', result)
    next(result + 'three')
  }, 2000)
})

hookTwo((result, next) => {
  setTimeout(() => {
    console.log('7', result)
    next(result + 'three')
  }, 2000)
})

const [hooker] = hookTwo((result, next) => {
  setTimeout(() => {
    console.log('8', result)
    next(result + 'three')
  }, 2000)
})

const [resHooker] = hooker((result, next) => {
  setTimeout(() => {
    console.log('hoookerrrrrrrrr', result)
    next('shoookerrrrrrrrr' + result)
  }, 2000)
})

const [resFlooker] = flooker((result, next) => {
  setTimeout(() => {
    console.log('together with hoookerrrrrrrrr', result)
    next('together with hoookerrrrrrrrr' + result)
  }, 1000)
})

resFlooker((res) => {
  console.log('me' + res)
})

resHooker((res) => {
  console.log('youooo' + res)
})

perform('start with me!')