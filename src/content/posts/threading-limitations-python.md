---
author: Venkatramani Rajgopal
pubDatetime: 2026-07-24T00:00:00Z
title: Threading limitations in Python
slug: threading-limitations-python
featured: true
draft: false
tags:
  - python 🐍
  - rust 🦀
description:
  Why Python threads can't speed up CPU-bound work, how multiprocessing helps, and how Rust's Rayon achieves true parallelism without a GIL.
---

## Table of Contents
- [The Illusion of Parallelism: Python Threading 🧵](#the-illusion-of-parallelism-python-threading-)
  - [The Result?](#the-result)
  - [Why This Happens: A Closer Look at the GIL](#why-this-happens-a-closer-look-at-the-gil)
- [The Python Alternative: Multiprocessing](#the-python-alternative-multiprocessing)
  - [The Hidden Cost: Overhead](#the-hidden-cost-overhead)
  - [Other Multiprocessing Gotchas](#other-multiprocessing-gotchas)
- [True Parallelism with Rust 🦀](#true-parallelism-with-rust-)
- [Summary](#summary)


On a multi-core machine, splitting a CPU-heavy loop across threads should make the work finish faster — that's the entire point of having more cores. In Python, it doesn't. The threads don't crash and they don't throw errors; they just quietly fail to speed anything up.

Here's a concrete example: a single-threaded script that counts the number of primes between 1 and 3 million.


```python
import time
import math

def is_prime(n): 
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

def count_primes(start, end):
    return sum(1 for n in range(start, end) if is_prime(n))

if __name__ == "__main__":
    start_time = time.time()
    num_primes = count_primes(1, 3_000_000)
    end_time = time.time()

    print(f"Number of primes between 1 and 3 million: {num_primes}")
    print(f"Sequential Time taken: {end_time - start_time:.2f} seconds")
```

```shell
Number of primes between 1 and 3 million: 216816
Sequential Time taken: 8.69 seconds
```


For a CPU-heavy task like this, splitting the `for` loop across `n` threads is expected to finish roughly n times faster on a quad-core machine. Instead, it takes the same time — sometimes even longer. This is because of the **Global Interpreter Lock (GIL)** in Python, which allows only one thread to execute Python bytecode at a time, even on multi-core systems.

## The Illusion of Parallelism: Python Threading 🧵
On paper, a 4-core CPU should let us split the 3 million numbers into four chunks and process them simultaneously. Here's what that looks like with Python's `ThreadPoolExecutor`:

```python
import time
from concurrent.futures import ThreadPoolExecutor

if __name__ == "__main__":
    start_time = time.time()
    
    # Split the workload into 4 chunks
    ranges = [
        (1, 750_000), 
        (750_000, 1_500_000), 
        (1_500_000, 2_250_000), 
        (2_250_000, 3_000_000)
    ]
    
    total_primes = 0
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = executor.map(lambda r: count_primes(*r), ranges)
        total_primes = sum(results)

    end_time = time.time()
    print(f"Number of primes between 1 and 3 million: {total_primes}")
    print(f"Threaded Time taken: {end_time - start_time:.2f} seconds")
```
### The Result? 

```shell
Number of primes between 1 and 3 million: 216816
Threaded Time taken: 8.67 seconds
```

### Why This Happens: A Closer Look at the GIL

The GIL isn't an arbitrary restriction — it exists because CPython's memory management relies on reference counting. Every object carries a counter of how many references point to it, incremented and decremented constantly as objects are created, passed around, and discarded. Without a lock serializing access to that counter, two threads updating it at the same time could corrupt it, leaking memory or freeing an object still in use. The GIL is the trade-off CPython made to keep that bookkeeping simple and fast in the single-threaded case, at the cost of parallelism in the multi-threaded one.

A few details that are easy to miss:

- **It's not a per-loop lock, it's a per-instruction one.** The interpreter switches which thread holds the GIL every few milliseconds (`sys.getswitchinterval()`, 5ms by default) or on certain bytecode boundaries — not once per `for` loop. Threads are genuinely interleaved, just never running Python bytecode *simultaneously*.
- **The GIL is released around blocking calls.** File I/O, network calls, `time.sleep`, and `subprocess` calls all release the GIL while they wait, which is exactly why threading *does* help I/O-bound work — the thread isn't holding the lock while it's idle.
- **Some C extensions release it too.** Libraries like NumPy, hashlib, and zlib drop the GIL during their C-level number crunching, so threaded code that spends most of its time inside those calls can see real speedups even though it's "just Python threading."
- **The GIL prevents memory corruption, not race conditions.** Because bytecode instructions can interleave, something as simple as `counter += 1` across multiple threads is still not atomic (it's a read, an add, and a write — three separate opportunities to switch threads) and can lose updates. The GIL guarantees the interpreter itself won't crash; it says nothing about your program's logic being correct.
- **This may not be permanent.** Python 3.13 shipped an experimental free-threaded build (PEP 703) that can run without the GIL entirely. It's opt-in and the C-extension ecosystem is still catching up, but it's the first real crack in an assumption that's held since Python's early days.

## The Python Alternative: Multiprocessing
If you have a CPU-bound task (like mathematical computations, image processing, or heavy loops), Python threads will not help you. You need `Multiprocessing`.

Instead of creating new threads within the same program, the multiprocessing module creates entirely new, separate OS processes.

```python
import time
import math
from concurrent.futures import ProcessPoolExecutor

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

# A small helper to unpack the tuple, since mapping works best with one argument
def count_primes_range(args):
    start, end = args
    return sum(1 for n in range(start, end) if is_prime(n))

if __name__ == "__main__":
    start_time = time.time()
    
    # Split the workload into 4 chunks
    ranges = [
        (1, 750_000), 
        (750_000, 1_500_000), 
        (1_500_000, 2_250_000), 
        (2_250_000, 3_000_000)
    ]
    
    total_primes = 0
    
    # The magic swap: We use ProcessPoolExecutor instead of ThreadPoolExecutor
    with ProcessPoolExecutor(max_workers=4) as executor:
        # The main process serializes 'ranges', sends them to the 4 worker processes,
        # they do the math simultaneously, and send the answers back.
        results = executor.map(count_primes_range, ranges)
        total_primes = sum(results)
        
    print(f"Found {total_primes} primes.")
    print(f"Multiprocessing Time: {time.time() - start_time:.2f} seconds")
```

```shell
Found 216816 primes.
Multiprocessing Time: 3.09 seconds
```
### The Hidden Cost: Overhead
> If multiprocessing is so great, why doesn't Python just use it for everything? 

Because spawning a brand new OS process is incredibly heavy compared to spawning a thread.

| | Multithreading | Multiprocessing |
|---|---|---|
| Memory Footprint | Tiny. All threads share the same RAM. | Huge. Each process copies the entire Python runtime into RAM. |
| Startup Time | Instantaneous. | Slow. The OS has to allocate new resources for every worker. |
| Data Sharing | Easy (but dangerous). Variables are shared instantly. | Hard. Data must be "pickled" (serialized), copied across memory boundaries, and "unpickled". |


> [!tip] Takeway
> `Multiprocessing` is perfect for CPU-bound tasks where the computation takes a long time *(like our prime number crunching)*. 
> 
> But if you try to use multiprocessing to run thousands of small, quick tasks, the time it takes Python to serialize the data, boot up the new processes, and copy the memory will actually take longer than the math itself!

### Other Multiprocessing Gotchas

The memory/startup/data-sharing table above is the headline cost, but a few other sharp edges are worth knowing about before reaching for `multiprocessing`:

- **Not everything can cross the process boundary.** `multiprocessing` uses pickle to hand data across the boundary between your main process and each worker process, since they don't share memory — everything you send has to be serialized, shipped over, and unpickled on the other side. Arguments and return values are pickled to get between processes, and pickle can't serialize lambdas, closures over local state, open file handles, database connections, or generators. This is why `count_primes_range` above is a plain top-level function instead of an inline lambda — `executor.map(lambda r: ..., ranges)` would fail with a `PicklingError` under `ProcessPoolExecutor`.
- **The start method changes the rules.** On Linux, `multiprocessing` defaults to `fork`, which clones the parent process's memory instantly — cheap, and children inherit already-loaded state. On macOS (since Python 3.8) and Windows, the default is `spawn`: each worker boots a fresh interpreter and re-imports the module from scratch. That's why the `if __name__ == "__main__":` guard is mandatory — without it, `spawn` re-executes your top-level code in every worker, including re-launching the pool itself.
- **There's no shared state by default.** Each process gets its own copy of memory, so global variables and objects aren't shared the way they are with threads. Sharing state on purpose requires `multiprocessing.Value`/`Array` for simple types, a `Manager` for shared proxies of dicts/lists (with its own IPC overhead), or `multiprocessing.shared_memory` (Python 3.8+) for raw shared buffers — all slower and more error-prone than a thread just reading a shared variable.
- **Debugging is harder.** A traceback raised in a worker has to be pickled and shipped back to the main process before you see it, which can lose context. Python's built-in interactive debugger, `pdb`, attaches to a single running process and can't just hop between workers. You generally need explicit logging or a remote debugger attached per process.
- **Locks are still your problem.** Multiprocessing sidesteps the GIL, but if workers do share memory (via `Manager` or `shared_memory`), you're back to needing `Lock`/`Semaphore` to avoid race conditions — parallelism doesn't remove the need for synchronization, it just moves where you need it.

---

## True Parallelism with Rust 🦀
Rust does not have a GIL. It achieves memory safety at compile time, meaning threads are free to run truly in parallel without needing a giant lock to protect the interpreter.

To make this dead simple in Rust, we use a massively popular crate (library) called [`Rayon`](https://github.com/rayon-rs/rayon). `Rayon` introduces data parallelism. By changing a call from `iter()` to `par_iter()` (parallel iterator) will automatically divide the work and distribute it across all available CPU cores.

Here is the equivalent Rust code:

```rust
use std::time::Instant;

use rayon::iter::{IntoParallelIterator, ParallelIterator};

fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false;
    }

    let limit = (n as f32).sqrt() as u32;
    for i in 2..=limit {
        if n % i == 0 {
            return false;
        }
    }
    true
}

fn main() {
    let start_time = Instant::now();

    // into_par_iter() will split the range across all available CPU threads safely
    let primes: usize = (1..3_000_000)
        .into_par_iter()
        .filter(|&n| is_prime(n))
        .count();

    let duration = start_time.elapsed();

    println!("Found {} primes.", primes);
    println!("🦀 Time taken {:.2?}", duration);
}
```

```shell
Found 216816 primes.
🦀 Time taken 764.18ms
```

Rust finishes in under a second — roughly **11× faster** than sequential Python and **4× faster** than Python's multiprocessing. It utilizes 100% of the available hardware, bypassing the limitations you hit in Python.

> Rust's compiler guarantees that because `is_prime` doesn't mutate any shared state outside of its local scope, it is perfectly safe to run in parallel, avoiding race conditions entirely without a GIL.

## Summary

Here is a quick recap of the results across all three approaches, counting primes from 1 to 3 million on a 4-core machine:

| Approach | Time | Speedup |
|---|---|---|
| Python — Sequential | 8.69s | 1× (baseline) |
| Python — `ThreadPoolExecutor` (4 threads) | 8.67s | ~1× (no gain) |
| Python — `ProcessPoolExecutor` (4 processes) | 3.09s | ~2.8× |
| Rust — `Rayon` `par_iter()` | 0.76s | ~11.4× |

The key takeaways:

- **Threading** in Python is useful for I/O-bound tasks (network calls, file reads), not CPU-bound work. The GIL ensures only one thread runs Python bytecode at a time, though it's released around blocking I/O and inside some C extensions like NumPy.
- **Multiprocessing** sidesteps the GIL by spawning separate OS processes, giving real parallelism at the cost of process startup overhead, pickling, and no shared memory by default.
- **Asyncio** is a third option worth knowing: single-threaded cooperative concurrency, no GIL contention or process overhead, but only useful for I/O-bound work — it doesn't help CPU-bound loops any more than threading does.
- **Rust** has no GIL. With `Rayon`, adding parallelism is a one-line change and the compiler statically proves the code is race-free, giving you full CPU utilization with zero runtime overhead.
- **Looking ahead:** Python 3.13's experimental free-threaded build removes the GIL entirely — still early, but worth watching if CPU-bound threading is a recurring pain point.