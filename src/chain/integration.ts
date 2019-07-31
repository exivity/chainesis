import { chain } from './chain'

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

hookOne((result, next) => {
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

perform('start with me!')