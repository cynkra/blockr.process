# Short content hash of a process definition

Polynomial rolling hash over the definition's cells; enough to tell two
versions of a process apart in an audit line, not a cryptographic
commitment. Deterministic across sessions.

## Usage

``` r
process_version(process)
```

## Arguments

- process:

  A wide process table.

## Value

An 8-character hex string.
