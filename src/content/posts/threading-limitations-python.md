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
  - concurrency
description:
  Why Python threads can't speed up CPU-bound work, how multiprocessing helps, and how Rust's Rayon achieves true parallelism without a GIL.
---

# 🧵 Threading limitations in Python
Take a look at the for loop which is a CPU heavy operation. Here is a single-threaded script that counts the number of primes between 1 and 10 million.


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


A massive CPU heavy task like this, a `for` loop across `n` threads is expected to finish n times faster on your quad-core machine. Instead it takes the same time or sometimes even longer. This is because of the **Global Interpreter Lock (GIL)** in Python, which allows only one thread to execute at a time, even on multi-core systems.

## The Illusion: Python Threading 🧵
Logically, if we have a 4-core CPU, we should be able to split the 3 million numbers into four chunks and process them simultaneously. Using Python's `ThreadPoolExecutor` this would be:

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


# The Python Alternative: Multiprocessing
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
If multiprocessing is so great, why doesn't Python just use it for everything? Because spawning a brand new OS process is incredibly heavy compared to spawning a thread.

| | Multithreading | Multiprocessing |
|---|---|---|
| Memory Footprint | Tiny. All threads share the same RAM. | Huge. Each process copies the entire Python runtime into RAM. |
| Startup Time | Instantaneous. | Slow. The OS has to allocate new resources for every worker. |
| Data Sharing | Easy (but dangerous). Variables are shared instantly. | Hard. Data must be "pickled" (serialized), copied across memory boundaries, and "unpickled". |


> [!tip] Key Insight
> Multiprocessing is perfect for CPU-bound tasks where the computation takes a long time (like our prime number crunching). But if you try to use multiprocessing to run thousands of small, quick tasks, the time it takes Python to serialize the data, boot up the new processes, and copy the memory will actually take longer than the math itself!


# True Parallelism: Rust 🦀
Rust does not have a GIL. It achieves memory safety at compile time, meaning threads are free to run truly in parallel without needing a giant lock to protect the interpreter.

To make this dead simple in Rust, we use a massively popular crate (library) called `Rayon`. `Rayon` introduces data parallelism. By changing a call from `iter()` to `par_iter()` (parallel iterator) will automatically divide the work and distribute it across all available CPU cores.

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

- **Threading** in Python is useful for I/O-bound tasks (network calls, file reads), not CPU-bound work. The GIL ensures only one thread runs Python bytecode at a time.
- **Multiprocessing** sidesteps the GIL by spawning separate OS processes, giving real parallelism at the cost of process startup overhead and serialization between workers.
- **Rust** has no GIL. With `Rayon`, adding parallelism is a one-line change and the compiler statically proves the code is race-free, giving you full CPU utilization with zero runtime overhead.