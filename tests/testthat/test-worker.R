# The worker is the only part of the package that executes anything, so
# these tests care about two things above all: that it runs what the table
# says (once per element, once per attempt), and that it refuses to run
# anything the table has no right to name.

jobs_dir <- function(scripts) {
  dir <- tempfile("jobs")
  dir.create(dir)
  for (nm in names(scripts)) writeLines(scripts[[nm]], file.path(dir, nm))
  dir
}

single_process <- function(script = "hello.R") {
  data.frame(
    task = "greet", name = "Greet", role = "system", depends_on = "",
    script = script, stringsAsFactors = FALSE
  )
}

group_process <- function() {
  data.frame(
    task = c("each_unit", "prepare", "review"),
    name = c("for each unit", "Prepare", "Review"),
    role = c("", "system", "analyst"),
    depends_on = c("", "", "prepare"),
    script = c("", "prep.R", ""),
    collection = c("unit", "", ""),
    parent = c("", "each_unit", "each_unit"),
    stringsAsFactors = FALSE
  )
}

test_that("the worker runs a script task and records what happened", {
  store <- tempfile()
  jobs <- jobs_dir(list("hello.R" = "cat('hello\n')"))

  run_worker(single_process(), store = store, jobs = jobs, wait = FALSE,
             quiet = TRUE)

  ev <- instance_events(store, "instance")
  expect_equal(ev$value[ev$field == "status"], c("doing", "done"))
  expect_true(all(ev$actor[ev$field == "status"] == "worker"))
  expect_true(any(ev$field == "took"))
  expect_true(any(ev$field == "code_version"))
  expect_true(file.exists(file.path(store, "instance", "logs", "greet-1.log")))
})

test_that("script tasks inside a group run once per element", {
  store <- tempfile()
  jobs <- jobs_dir(list(
    "prep.R" = paste(
      "el <- Sys.getenv('PROC_ELEMENT')",
      "writeLines(el, file.path(Sys.getenv('PROC_ARTIFACTS'), paste0(el, '.txt')))",
      sep = "\n"
    )
  ))
  start_instance(group_process(), c("north", "south"), "2026Q1", store)

  run_worker(group_process(), store = store, instance = "2026Q1", jobs = jobs,
             wait = FALSE, quiet = TRUE)

  tab <- instance_view(store, "2026Q1")
  prep <- tab[tab$task == "prepare", ]
  expect_equal(nrow(prep), 2L)
  expect_equal(sort(prep$status), c("done", "done"))
  # the script saw its element, so the two runs did different work
  expect_setequal(
    list.files(file.path(store, "2026Q1", "artifacts")),
    c("north.txt", "south.txt")
  )
  # and the humans it handed over to are per element, too
  expect_equal(sort(tab$status[tab$task == "review"]), c("open", "open"))
})

test_that("a sequential group runs one element at a time", {
  store <- tempfile()
  jobs <- jobs_dir(list("prep.R" = "cat('ok\n')"))
  process <- group_process()
  process$sequential <- c(TRUE, "", "")
  start_instance(process, c("north", "south", "east"), "2026Q1", store)

  # one pass of the loop: exactly one element may have been started
  work <- blockr.process:::ready_work(process, store, "2026Q1")
  mine <- work$ready[work$ready$task == "prepare", ]
  expect_equal(nrow(mine), 3L)
  expect_equal(
    nrow(blockr.process:::drop_parallel_elements(mine, process)), 1L
  )
})

test_that("a script outside the jobs directory is refused, not run", {
  store <- tempfile()
  jobs <- jobs_dir(list("hello.R" = "cat('hello\n')"))
  outside <- file.path(dirname(jobs), "escaped.txt")
  writeLines("stop('this must never run')", paste0(outside, ".R"))
  on.exit(unlink(paste0(outside, ".R")), add = TRUE)

  for (bad in c("../escaped.R", "/etc/passwd", "~/evil.R", "nope.R")) {
    st <- tempfile()
    run_worker(single_process(bad), store = st, jobs = jobs, wait = FALSE,
               quiet = TRUE)
    ev <- instance_events(st, "instance")
    expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
    expect_true(any(ev$field == "error"))
    # nothing was executed: no interpreter ran, so no timing was recorded
    expect_false(any(ev$field == "took"))
  }
})

test_that("a failing task is retried as often as the table says", {
  store <- tempfile()
  jobs <- jobs_dir(list("boom.R" = "stop('nope')"))
  process <- single_process("boom.R")
  process$retry <- 2

  run_worker(process, store = store, jobs = jobs, wait = FALSE, quiet = TRUE,
             tick = 0)

  ev <- instance_events(store, "instance")
  expect_equal(max(as.integer(ev$value[ev$field == "attempt"])), 3L)
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
  # every retry is a decision in the log, not a hidden loop
  expect_true(any(grepl("^worker \\(retry", ev$actor)))
})

test_that("a task that outstays its timeout fails", {
  skip_on_cran()
  store <- tempfile()
  jobs <- jobs_dir(list("slow.R" = "Sys.sleep(30)"))
  process <- single_process("slow.R")
  process$timeout <- 1

  run_worker(process, store = store, jobs = jobs, wait = FALSE, quiet = TRUE)

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
  expect_true(any(grepl("timeout", ev$value[ev$field == "error"])))
})

test_that("a check's answer on stdout becomes its status", {
  store <- tempfile()
  jobs <- jobs_dir(list("qa.R" = "cat('::process-output status=false::\n')"))

  run_worker(single_process("qa.R"), store = store, jobs = jobs, wait = FALSE,
             quiet = TRUE)

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "false")
})

test_that("two workers cannot run on one store", {
  store <- tempfile()
  lock <- blockr.process:::worker_lock(store, quiet = TRUE)
  on.exit(blockr.process:::worker_unlock(lock), add = TRUE)

  expect_error(
    run_worker(single_process(), store = store, jobs = tempdir(),
               wait = FALSE, quiet = TRUE),
    "another worker"
  )
  # ... and the lock is gone once the first one is done
  blockr.process:::worker_unlock(lock)
  expect_silent(blockr.process:::worker_lock(store, quiet = TRUE))
})

test_that("a lock nobody has touched is broken", {
  store <- tempfile()
  lock <- blockr.process:::worker_lock(store, quiet = TRUE)
  Sys.setFileTime(file.path(lock, "owner"), Sys.time() - 3600)

  expect_message(
    blockr.process:::worker_lock(store, stale = 120),
    "stale lock"
  )
})

test_that("code_version answers a stable hash for a plain directory", {
  jobs <- jobs_dir(list("a.R" = "1", "b.R" = "2"))
  v <- code_version(jobs)
  expect_match(v, "^[0-9a-f]{8}$")
  expect_identical(v, code_version(jobs))
  writeLines("3", file.path(jobs, "b.R"))
  expect_false(identical(v, code_version(jobs)))
})

test_that("process_act writes the events a person's click stands for", {
  store <- tempfile()
  process_act("review", "done", assignee = "ana", store = store,
              instance = "2026Q1", element = "north")

  ev <- instance_events(store, "2026Q1")
  expect_equal(ev$field, c("assignee", "status"))
  expect_true(all(ev$element == "north"))
  expect_true(all(ev$actor == "ana"))
})

# ---- the function form: `script` may name pkg::fun -----------------------

# A worker deployment usually has its jobs in a package already; naming the
# function directly means there is no jobs directory to ship, mount or
# version separately. The tests below install a throwaway package so the
# child process can actually resolve it -- `pkgload::load_all()` is invisible
# to a subprocess, which is the whole reason this needs a real install.
tiny_package <- function(name = "procdemo") {
  lib <- tempfile("lib")
  dir.create(lib)
  src <- file.path(tempfile("src"), name)
  dir.create(file.path(src, "R"), recursive = TRUE)
  writeLines(c(
    paste0("Package: ", name), "Title: Throwaway", "Version: 0.4.2",
    "Description: Throwaway package for the worker tests.",
    "Author: t", "Maintainer: t <t@example.com>", "License: GPL-3"
  ), file.path(src, "DESCRIPTION"))
  writeLines("export(note)", file.path(src, "NAMESPACE"))
  writeLines(c(
    "note <- function() {",
    "  el <- Sys.getenv('PROC_ELEMENT')",
    "  writeLines(",
    "    paste(Sys.getenv('PROC_TASK'), el),",
    "    file.path(Sys.getenv('PROC_ARTIFACTS'), paste0('note-', el, '.txt'))",
    "  )",
    "}"
  ), file.path(src, "R", "note.R"))
  out <- system2(
    file.path(R.home("bin"), "R"),
    c("CMD", "INSTALL", "--no-docs", "--no-byte-compile",
      paste0("--library=", shQuote(lib)), shQuote(src)),
    stdout = FALSE, stderr = FALSE
  )
  if (!identical(out, 0L)) skip("could not install the throwaway package")
  lib
}

fun_process <- function(script = "procdemo::note") {
  data.frame(
    task = "annotate", name = "Annotate", role = "system", depends_on = "",
    script = script, stringsAsFactors = FALSE
  )
}

test_that("a task can name a function in an allowed package", {
  skip_on_cran()
  skip_if_not_installed("withr")
  lib <- tiny_package()
  store <- tempfile()

  withr::with_libpaths(lib, action = "prefix", {
    withr::with_envvar(c(R_LIBS = lib), {
      run_worker(fun_process(), store = store, jobs = tempdir(),
                 packages = "procdemo", wait = FALSE, quiet = TRUE)
    })
  })

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "done")
  # the package version IS the code version -- truer than a hash of a folder
  expect_equal(ev$value[ev$field == "code_version"], "procdemo 0.4.2")
  # the function ran in a real subprocess and saw the same environment a
  # script would
  expect_true(file.exists(
    file.path(store, "instance", "artifacts", "note-.txt")
  ))
})

test_that("a package not on the allowlist is refused, not run", {
  skip_on_cran()
  skip_if_not_installed("withr")
  lib <- tiny_package()
  store <- tempfile()

  withr::with_libpaths(lib, action = "prefix", {
    run_worker(fun_process(), store = store, jobs = tempdir(),
               packages = "somethingelse", wait = FALSE, quiet = TRUE)
  })

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
  expect_match(ev$value[ev$field == "error"], "allowlist")
  expect_false(any(ev$field == "took"))
})

test_that("with no allowlist the function form is off entirely", {
  store <- tempfile()
  run_worker(fun_process(), store = store, jobs = tempdir(), wait = FALSE,
             quiet = TRUE)

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
  expect_match(ev$value[ev$field == "error"], "runs no package functions")
})

test_that("only a plain pkg::fun reference is accepted", {
  # the allowlist would pass, but the reference itself must not be a way to
  # smuggle in an expression
  bad <- c(
    "base:::Sys.setenv", "base::system('rm -rf /')", "base::q()",
    "utils::download.file(x)", "base::system;base::q"
  )
  for (script in bad) {
    store <- tempfile()
    run_worker(fun_process(script), store = store, jobs = tempdir(),
               packages = c("base", "utils"), wait = FALSE, quiet = TRUE)
    ev <- instance_events(store, "instance")
    expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
    expect_match(ev$value[ev$field == "error"], "plain 'pkg::fun'")
    expect_false(any(ev$field == "took"))
  }
})

test_that("an allowed package must still export the function", {
  store <- tempfile()
  run_worker(fun_process("stats::no_such_function"), store = store,
             jobs = tempdir(), packages = "stats", wait = FALSE, quiet = TRUE)

  ev <- instance_events(store, "instance")
  expect_equal(utils::tail(ev$value[ev$field == "status"], 1), "failed")
  expect_match(ev$value[ev$field == "error"], "is not an exported function")
})
