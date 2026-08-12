# Transform-block variant of the vendored JS-block factory: identical to
# new_js_plot_block() in R/js-block.R but targeting
# blockr.core::new_transform_block() (same server signature). Reuses the
# vendored sync/UI helpers -- do not duplicate them.

#' Build a JS-driven single-input transform block
#'
#' See `new_js_plot_block()` in `R/js-block.R` for parameter docs; this is
#' the same factory targeting [blockr.core::new_transform_block()].
#' @noRd
new_js_transform_block <- function(class,
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

  # Bind the flat constructor fields locally for the static state path
  # (see the comment in the vendored new_js_plot_block()).
  list2env(state, environment())

  new_transform_block(
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
    allow_empty_state = TRUE,
    ...
  )
}

#' Build a JS-driven data block (no upstream input)
#'
#' Same shape as the transform variant but the server takes no data
#' argument and no column metadata is pushed -- the JS UI is fed entirely
#' from its own state. Targets [blockr.core::new_data_block()].
#' @noRd
new_js_data_block <- function(class,
                              name,
                              state,
                              expr_fn,
                              setup = NULL,
                              normalize_state = identity,
                              shared_deps = "select",
                              extra_deps = NULL,
                              ctor = sys.parent(),
                              ctor_pkg = NULL,
                              ...) {
  input_name <- js_block_input_name(name)
  list2env(state, environment())

  blockr.core::new_data_block(
    function(id) {
      moduleServer(id, function(input, output, session) {
        if (!is.null(setup)) {
          setup(input, session, session$ns, NULL, input_name)
        }
        sync <- js_block_state(input, session, name, input_name, state,
                               normalize_state)
        list(
          expr = reactive(expr_fn(sync$state())),
          state = sync$fields
        )
      })
    },
    js_block_ui(name, shared_deps, extra_deps),
    class = class,
    ctor = ctor,
    ctor_pkg = ctor_pkg,
    external_ctrl = TRUE,
    allow_empty_state = TRUE,
    ...
  )
}
