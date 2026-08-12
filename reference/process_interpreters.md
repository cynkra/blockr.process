# How a script file is executed, by extension

The worker runs files, not commands: the \`script\` column of a process
table names a file inside the jobs directory, and its extension picks
the interpreter. Pass your own list to \[run_worker()\] to add one
(\`list(jl = list(command = "julia", args = character()))\`); the names
are lowercase extensions.

## Usage

``` r
process_interpreters()
```

## Value

A named list of \`list(command, args)\`.

## Details

\`Rscript –vanilla\` on purpose: a script that needs a package
environment should say so itself (\`renv::load()\` on line one), so that
what ran is visible in the script rather than in the worker's shell.
