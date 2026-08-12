# Vendored from blockr.dplyr/R/js-block.R (0.2.0, commit 43d92f5) and adapted:
#   - `new_js_plot_block()` targets blockr.core::new_plot_block() instead of
#     new_transform_block() (same server signature: function(id, data)).
#   - Shared JS/CSS assets load through blockr.dplyr's exported dependency
#     functions; only this package's per-block assets are served from here.
#   - The settings-band dependency (Blockr.checkbox, gear popover CSS) is
#     not loaded; add blockr.dplyr's band assets if your block needs them.
# When the shared JS layer moves to blockr.ui, this file shrinks to nothing.
# Until then: do not edit the sync logic -- it is the part that breeds bugs.

#' Build a JS-driven single-input plot block
#'
#' @param class Block S3 class, e.g. `"<yourname>_block"`.
#' @param name Kebab-case block name driving the naming convention:
#'   input id `<name>_input`, container class `<name>-block-container`,
#'   messages `<name>-columns` / `<name>-block-update`, assets
#'   `inst/js/<name>-block.js` + `inst/css/<name>-block.css`.
#' @param state Initial state list, assembled by the calling constructor from
#'   its flat arguments. Its `names()` define the serialized fields and must
#'   match the constructor's formals for save/restore to round-trip.
#' @param expr_fn Function of the state list returning a `bquoted`
#'   language object.
#' @param columns_meta Function of the data frame returning the column
#'   metadata pushed to JS on every data change, or `NULL` to skip.
#' @param setup Optional `function(input, session, ns, data, input_name)`
#'   registering block-specific observers.
#' @param normalize_state Applied to the state before sending it to JS via
#'   the update message (e.g. force length-1 vectors to JSON arrays).
#' @param shared_deps Character subset of `c("select", "input")`.
#' @param extra_deps Further [htmltools::htmlDependency()] objects the block's
#'   JS needs, loaded before its own asset pair (the process block's editor is
#'   built on `blockr.outline::minidag_rail_dep()`).
#' @param ctor,ctor_pkg Forwarded to [blockr.core::new_plot_block()].
#' @param ... Forwarded to [blockr.core::new_plot_block()].
#' @noRd
new_js_plot_block <- function(class,
                              name,
                              state,
                              expr_fn,
                              columns_meta = blockr.dplyr::build_column_picker_meta,
                              setup = NULL,
                              normalize_state = identity,
                              shared_deps = "select",
                              ctor = sys.parent(),
                              ctor_pkg = NULL,
                              ...) {
  input_name <- js_block_input_name(name)

  # blockr.core's `initial_block_state()` reads each constructor formal by
  # name from the (expr-)server's enclosing environment. The flat formals
  # (`x`, `y`, ...) live in the calling constructor's frame, not here --
  # bind them locally so the static state path resolves them.
  # `names(state)` equals the constructor's flat formals by construction.
  list2env(state, environment())

  new_plot_block(
    function(id, data) {
      moduleServer(id, function(input, output, session) {
        ns <- session$ns

        if (!is.null(columns_meta)) {
          # on data change, and again when a late-mounted panel announces
          observeEvent(data(), {
            session$sendCustomMessage(
              paste0(name, "-columns"),
              list(id = ns(input_name), columns = columns_meta(data()))
            )
          })
          observeEvent(input[[paste0(input_name, "_ready")]], {
            tryCatch(
              session$sendCustomMessage(
                paste0(name, "-columns"),
                list(
                  id = ns(input_name),
                  columns = columns_meta(shiny::isolate(data()))
                )
              ),
              error = function(e) NULL
            )
          })
        }

        if (!is.null(setup)) {
          setup(input, session, ns, data, input_name)
        }

        sync <- js_block_state(input, session, name, input_name, state,
                               normalize_state)

        list(
          expr = reactive(expr_fn(sync$state())),
          state = sync$fields
        )
      })
    },
    js_block_ui(name, shared_deps),
    class = class,
    ctor = ctor,
    ctor_pkg = ctor_pkg,
    expr_type = "bquoted",
    external_ctrl = TRUE,
    # All fields may legitimately be empty on a fresh block (the expr
    # builders self-heal via `%||%`). An unconfigured plot block renders a
    # placeholder, never an error.
    allow_empty_state = TRUE,
    ...
  )
}

#' Input id derived from the block name
#' @noRd
js_block_input_name <- function(name) {
  paste0(gsub("-", "_", name, fixed = TRUE), "_input")
}

#' Wire the bidirectional JS <-> R state sync over per-field reactiveVals
#'
#' The JS side maintains state as a single blob, but R holds it as one
#' `reactiveVal` per field (`names(state)`) so external controllers
#' (blockr.ai, board restore) can set individual fields, and so the named
#' fields serialize flat onto the constructor's arguments.
#'
#' - JS -> R: the input binding (one blob) is decomposed into the per-field
#'   reactiveVals.
#' - R -> JS: any field change pushes the recombined blob back via the
#'   `<name>-block-update` message. The `self_write` guard breaks the
#'   R -> JS -> R loop. The observer fires on init (no `ignoreInit`): that
#'   first message delivers the constructor state to the JS class, queued by
#'   `Blockr.registerBlock()` until the element binds.
#' @noRd
js_block_state <- function(input, session, name, input_name, state,
                           normalize_state = identity) {
  fields <- names(state)

  r_fields <- stats::setNames(
    lapply(fields, function(f) reactiveVal(state[[f]])),
    fields
  )
  r_state <- reactive(
    stats::setNames(lapply(fields, function(f) r_fields[[f]]()), fields)
  )

  self_write <- new.env(parent = emptyenv())
  self_write$active <- FALSE

  # JS -> R: decompose the single blob into the per-field reactiveVals.
  observeEvent(input[[input_name]], {
    self_write$active <- TRUE
    blob <- input[[input_name]]
    for (f in fields) r_fields[[f]](blob[[f]])
  })

  # Late-mount handshake: a dock VIEW mounts its panels lazily, so a block
  # created after the initial state push would sit on an empty UI. The JS
  # constructor announces itself (`<input>_ready`) and R replays the blob.
  observeEvent(input[[paste0(input_name, "_ready")]], {
    tryCatch(
      session$sendCustomMessage(
        paste0(name, "-block-update"),
        list(
          id = session$ns(input_name),
          state = normalize_state(shiny::isolate(r_state()))
        )
      ),
      error = function(e) NULL
    )
  })

  # R -> JS: push the recombined blob whenever any field changes. Sent as a
  # custom message (not `sendInputMessage`) on purpose: Shiny drops input
  # messages whose target element isn't bound yet; the custom channel's
  # queue in blockr-core.js replays them on `initialize()`.
  observeEvent(r_state(), {
    if (self_write$active) {
      self_write$active <- FALSE
    } else {
      # This observer runs OUTSIDE blockr.core's per-block error boundary,
      # so a throw here would be session-fatal. Contain it and warn so the
      # block degrades instead.
      tryCatch(
        session$sendCustomMessage(
          paste0(name, "-block-update"),
          list(
            id = session$ns(input_name),
            state = normalize_state(r_state())
          )
        ),
        error = function(e) {
          warning(
            sprintf("could not sync '%s' state to JS: %s",
                    name, conditionMessage(e)),
            call. = FALSE
          )
        }
      )
    }
  })

  list(fields = r_fields, state = r_state)
}

#' Standard block UI: shared dependencies + the container div the JS binds to
#' @noRd
js_block_ui <- function(name, shared_deps = "select", extra_deps = NULL) {
  force(name)
  force(shared_deps)
  force(extra_deps)
  function(id) {
    tagList(
      blockr.dplyr::blockr_core_js_dep(),
      blockr.dplyr::blockr_blocks_css_dep(),
      if ("select" %in% shared_deps) blockr.dplyr::blockr_select_dep(),
      if ("input" %in% shared_deps) blockr.dplyr::blockr_input_dep(),
      extra_deps,
      js_block_dep(name),
      div(
        class = "block-container",
        div(
          id = NS(id, js_block_input_name(name)),
          class = paste0(name, "-block-container")
        )
      )
    )
  }
}

#' HTML dependency for a CSS-only block
#'
#' The R-driven blocks have no JS half, but they style themselves against the
#' same design system, so they need their sheet loaded the same way (and
#' cache-busted by the package version).
#' @noRd
css_block_dep <- local({
  cache <- new.env(parent = emptyenv())
  pkg <- "blockr.process"
  function(name) {
    force(name)
    if (!exists(name, cache, inherits = FALSE)) {
      cache[[name]] <- htmltools::htmlDependency(
        name = paste0(name, "-block-css"),
        version = utils::packageVersion(pkg),
        src = system.file("css", package = pkg),
        stylesheet = paste0(name, "-block.css")
      )
    }
    cache[[name]]
  }
})

#' HTML dependency for this package's per-block JS + CSS pair
#'
#' Versioned by the package version: bump `Version:` in DESCRIPTION after
#' every `inst/js` or `inst/css` edit, or the browser keeps the old asset.
#' @noRd
js_block_dep <- local({
  cache <- new.env(parent = emptyenv())
  pkg <- "blockr.process" # rename along with the package
  function(name) {
    force(name)
    if (!exists(name, cache, inherits = FALSE)) {
      cache[[name]] <- htmltools::tagList(
        htmltools::htmlDependency(
          name = paste0(name, "-block-js"),
          version = utils::packageVersion(pkg),
          src = system.file("js", package = pkg),
          script = paste0(name, "-block.js")
        ),
        htmltools::htmlDependency(
          name = paste0(name, "-block-css"),
          version = utils::packageVersion(pkg),
          src = system.file("css", package = pkg),
          stylesheet = paste0(name, "-block.css")
        )
      )
    }
    cache[[name]]
  }
})
