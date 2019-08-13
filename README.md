Chains
=============

Chain functions to other functions.

Installation
------------

_npm_

```
npm install --save chains
```

_yarn_

```
yarn add chains
```

API
---

### `chain`

```jsx
import { chain } from 'chains'

const [hookOnChain, runChain] = chain((runChainArg, next) => {
 // do something
 // pass something to next function
 next(something)
})

// chained to chain
hookOnChain((something, next) => {
 // Do new stuff with something from root function
 next(new stuff)
})

// chained to chain
const [hookOnSecond, hookOff] = hookOnChain((something, next) => {
 // Do new stuff with something from root function
 next(new stuff)
})

// chained to hookOnChain
const [goOnForeverHook, hookOffBranchToo] = hookOnSecond((argsFromHookOnChain, next) => {
 // here we go again!
  next(indefinitely)   
})

````
License
-------

MIT
