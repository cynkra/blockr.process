# Is a worker running on this store?

Reads the lock a running \[run_worker()\] holds and touches on every
tick. A board can show it ("no worker is running, scripts will not
start"), and a script that would rather ingest the inbox itself can ask
first.

## Usage

``` r
worker_alive(store = ".runs", stale = 120)
```

## Arguments

- store:

  Store directory.

- stale:

  Seconds without a heartbeat after which the answer is \`FALSE\`.

## Value

\`TRUE\` or \`FALSE\`.
