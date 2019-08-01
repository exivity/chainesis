import { chain } from './'

const [hookOn, perform] = chain((result: any, next: any) => {
  setTimeout(() => {
    console.log('1', result)
    next && next(result + ' one')
  }, 2000)
})

// @ts-ignore
const [hookOne] = hookOn((result: any, next: any) => {
  setTimeout(() => {
    console.log('2', result)
    next && next(result + ' two')
  }, 2000)
})

hookOne((result: any, next: any) => {
  setTimeout(() => {
    console.log('3', result)
    next && next(result + ' two22')
  }, 2000)
})

hookOne((result: any, next: any) => {
  setTimeout(() => {
    console.log('4', result)
    next && next(result + 'three')
  }, 2000)
})

hookOne((result: any, next: any) => {
  setTimeout(() => {
    console.log('5', result)
    next && next(result + 'three')
  }, 2000)
})

// @ts-ignore
perform('start with me!')