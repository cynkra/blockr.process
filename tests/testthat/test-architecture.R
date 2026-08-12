# The package is two layers in one namespace, and this test is the wall
# between them.
#
#   engine  pure R: the table semantics, the event store, instances, the
#           inbox, the worker, and the BPMN model/XML. Runs in Rscript, in
#           cron, in tests -- it has never heard of a board or a session.
#   ui      the blocks and the widget: everything that imports shiny or
#           blockr.*, plus the expression builders (they exist to be
#           emitted BY blocks, so they live on the UI side of the line).
#
# The dependency points one way: ui calls engine, never the reverse. That
# is what keeps the design rule "a live Shiny session never holds workflow
# state" true by construction, and what makes extracting the engine into a
# package of its own a file move rather than a refactor. A grep is crude,
# but it fails loudly the day someone reaches for shiny inside the worker,
# which is exactly when a human should look.

engine_files <- c(
  "process-table.R", "multi.R", "event-store.R", "instance.R",
  "inbox.R", "worker.R", "bpmn-model.R", "bpmn-xml.R", "bpmn-example.R"
)

ui_markers <- c(
  # shiny machinery
  "shiny::", "moduleServer", "reactiveVal", "observeEvent",
  "invalidateLater", "renderUI", "renderText", "tagList",
  # blockr machinery
  "blockr\\.core::", "blockr\\.dplyr::", "blockr\\.outline::",
  "new_[a-z_]+_block\\(", "bbquote", "register_blocks",
  # widgets
  "htmlwidgets::", "htmltools::"
)

test_that("engine files never touch shiny, blockr or the blocks", {
  # R/ sits next to tests/ in the source tree; skip when running against
  # the installed package, which ships no sources
  src <- file.path(testthat::test_path("..", ".."), "R", engine_files)
  skip_if_not(all(file.exists(src)), "source tree not available")

  pattern <- paste(ui_markers, collapse = "|")
  for (f in src) {
    lines <- readLines(f, warn = FALSE)
    # comments may talk about the UI (the worker's header does, on
    # purpose); code may not
    code <- sub("#.*$", "", lines)
    hits <- grep(pattern, code, value = TRUE)
    # string literals mentioning the package name are fine
    hits <- hits[!grepl("\"[^\"]*blockr\\.process[^\"]*\"", hits)]
    expect_length2 <- function(x) {
      expect(
        length(x) == 0,
        sprintf(
          "%s is an engine file but contains UI code:\n  %s",
          basename(f), paste(trimws(x), collapse = "\n  ")
        )
      )
    }
    expect_length2(hits)
  }
})

test_that("every R file is on one side of the line or the other", {
  src_dir <- testthat::test_path("..", "..", "R")
  skip_if_not(dir.exists(src_dir), "source tree not available")

  all_files <- list.files(src_dir, pattern = "\\.R$")
  ui_files <- setdiff(all_files, engine_files)

  # the wall only works if a new engine file cannot appear unnoticed: a
  # file with no UI marker anywhere belongs in engine_files above, so that
  # the stricter test starts guarding it
  pattern <- paste(ui_markers, collapse = "|")
  for (f in ui_files) {
    if (f %in% c("_disable_autoload.R", "blockr.process-package.R")) next
    lines <- sub("#.*$", "", readLines(file.path(src_dir, f), warn = FALSE))
    expect(
      any(grepl(pattern, lines)),
      sprintf(
        "%s has no UI code: add it to engine_files in test-architecture.R",
        f
      )
    )
  }
})
