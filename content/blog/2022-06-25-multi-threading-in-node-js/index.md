---
title: Multi threading in node-js
date: "2022-06-25"
---

Recently I happened to write some nodejs scripts to do some simple static analysis with babel.
But the program took quite some time to finish. Time for optimization.

We always say "nodejs is single-threaded". And we seldom use nodejs to run code with multithreading (maybe it's just me).
Indeed nodejs multithreading support have been here for a while! Let's try to make use of the threads to distribute the loads.

As early as node `v10.5.0` (2018), the experimental feature `Worker` constructor was introduced for spawning workers to utilize the other cores of cpu.
However the interface of it had been changing until `v12.17.0` (2020). ([mdn](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker))

![worker-constructor-nodejs-mdn](worker-constructor-nodejs-mdn.png)

## Nodejs `worker_threads` module

This is an example of the main thread spawning a worker.

```ts
// index.ts
import { Worker } from "worker_threads"

// spawn a worker
const worker = new Worker("./worker")

// send data to worker
worker.postMessage("some message from main thread")
worker.postMessage({ name: "john" })
worker.postMessage(new Set(["a", "b", "c"]))
```

```ts
// worker.ts
import { parentPort } from "worker_threads"

parentPort.on("message", value => {
  console.log("worker received message:", value)
})
```

### What kinds of data can we send to workers?

Usually when doing multithreading, we have to be very careful in sharing data between threads.
Otherwise weird bugs and race condition would mess up your program.

So in nodejs, there is some restriction in what kinds of data can be sent to workers via [`postMessage`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist).
All values that are compatible with [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) are allowed.
It includes a wide variety of complex objects, like `Array`, `Date`, `Map`, `Set`, objects with circular reference, etc.

While values like **functions**, DOM nodes and those "with context / metadata" are not supported, and would cause `DataCloneError` exception.

### How are values passed down to workers?

The values are cloned to the workers. So the workers can freely modify the values!

But there is an exception. `postMessage` supports second function param `transferList`. which
is a list only allows `ArrayBuffer`, `MessagePort` and `FileHandle` values.
Once the message is sent, the listed values are not allowed to be used by the sending side.
It is for some special use, so we won't go further.

### Limitation: code execution isolation

From the API design of `worker_threads`, we can see that we can't share scope of the main thread when execute code in worker.
If we want to pass data to workers, we have to do it explicitly, either with `postMessage` or `setEnvironmentData`.

We cannot have this kind of abstraction of multithreading:

```ts
// imaginary abstraction of defining multithreading jobs
const results = await superStream.fromValues([1,2,3, ...])
        .setMaxThreads(8)
        .runInThreads((value) => {
            // expensiveComputation() is an ordinary function
            const result = expensiveComputation(value)
            return result
        })
        .run()

console.log('main thread got results from workers:', results)
```

### Isolated import in worker

For the sake of thread safety, all data sharing between threads must be explicit.
The import of a file in a worker is isolated from the import of the same file in the main thread / other workers.

```ts
// mutableObj.ts
export const obj = { count: 0 }
```

```ts
// worker.ts
import { parentPort } from "worker_threads"
import { obj } from "./mutableObj"

parentPort.postMessage(obj)
```

```ts
// index.ts
import { Worker } from "worker_threads"
import { obj } from "./mutableObj"

// mutate the value from the import
obj.count += 1

// spawn a worker
const worker = new Worker("./worker")

worker.on("mssage", objFromWorker => {
  assert.deepStrictEqual(objFromWorker, { count: 0 })
})
```

## `threads.js` library

![threads.js](./threads-js-logo.png)

The library [`threads.js`](https://github.com/andywer/threads.js/), created in 2019, provides a higher level abstraction for doing multithreading.
It also supports multi platforms of nodejs, browser and electron!

```ts
// index.ts
import { spawn, Thread, Worker } from "threads"

const worker = await spawn(new Worker("./worker"))
const result = await worker.fib(10)

console.log("main thread got result from worker:", result)
```

```ts
// worker.ts
import { expose } from "threads/worker"

const fib = (n: number) => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2))

expose({ fib })
```

### Thread pool

Most likely you don't want to create too many workers than the actual cpu cores you have,
otherwise the context switching overhead would reduce the overall performance.
You will need to maintain a pool of workers to do your jobs, which is what `threads.js` supports!

```ts
// index.ts
import { spawn, Pool, Worker } from "threads"
import { cpus } from 'os'

const computationParams = [...]
let results = []

const poolSize = cpus().length
const pool = Pool(() => spawn(new Worker("./worker")), poolSize)

for (const param of computationParams) {
    pool.queue(async (worker) => {
        const result = await worker.expensiveComputation(param)
        results.push(result)
    })
}

await pool.completed()
await pool.terminate()

console.log('main thread got results from workers:', results)
```

## Conclusion

The basic use of worker is simple enough. As for my little nodejs program, the utilization of the extra cpu cores reduced the execution time from ~2mins to 38s. Sweet.
