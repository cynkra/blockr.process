# Which version of the code ran

Recorded on every attempt as a \`code_version\` event, so the log
answers "what exactly ran here" a year later. The git commit of the jobs
directory when it is a working tree, otherwise a content hash of the
scripts – both are 8 hex characters, and neither claims more than "these
bytes, that day".

## Usage

``` r
code_version(jobs = ".")
```

## Arguments

- jobs:

  Directory holding the scripts.

## Value

An 8-character string, or \`""\` when the directory is unreadable.
