# The "start instance" moment, as a block.
#
# The definition flows IN (from the process block); the element list does
# not appear on the board at all -- it lives wherever the platform keeps
# it (a Postgres table, register), and the card offers the available
# lists as a plain select. Deployments bake their lists in by wrapping the
# constructor (see `sources`), the same way the demo's dcdemo does.
#
# Before opening, the block IS the moment: what will be created, one
# button. After opening it is the instance's header -- id, version, created,
# size -- and, because the live definition keeps flowing in, it can say
# when the process has drifted from the stamped version: edits apply to
# the NEXT instance, never this one.

#' Open-instance block
#'
#' Takes the process definition as its input and opens an instance from it:
#' pick the year (the instance id), pick a collection, click "Start
#' instance" -- one [start_instance()]. Once the instance exists the card shows
#' its header (id, [process_version()], created, size) and warns when the
#' incoming definition no longer matches the stamped one.
#'
#' The block emits [instance_view()], the expanded instance table.
#'
#' @param store Instance store directory (see [instance_event()]).
#' @param instance Instance id.
#' @param source Name of the selected element list.
#' @param sources Named list of element lists: each a data frame (first
#'   column: element ids, e.g. units; further columns become the instance
#'   table's facets, an `assignee` column seeds assignments) or a
#'   zero-argument function returning one (a `SELECT` on the platform's
#'   database). Not serialized: a deployment wraps this constructor with
#'   its lists baked in and registers the wrapper.
#' @param poll Poll interval in seconds.
#' @param class Block S3 class. The wrapping constructor passes its own
#'   subclass (e.g. `c("start_block", "start_instance_block")`) so the registry
#'   keys on the wrapper.
#' @param ctor,ctor_pkg Forwarded to [blockr.core::new_transform_block()];
#'   default: the CALLING constructor becomes the ctor of record, so its
#'   formals (`store`, `instance`, `source`, `poll`) define the block's state.
#' @param ... Forwarded to [blockr.core::new_transform_block()].
#'
#' @section Not registered directly:
#' This is a factory in the spirit of the JS-block factories: `sources`
#' holds data (or query functions) that cannot serialize, so a deployment
#' MUST wrap it in its own constructor -- with the lists baked in -- and
#' register that wrapper. See the demo's `dcdemo::new_start_block()`.
#'
#' @export
#' @importFrom shiny observeEvent renderUI selectInput tags
#'   textInput uiOutput req
new_start_instance_block <- function(store = ".runs", instance = "instance", source = "",
                              sources = list(), poll = 2,
                              class = "start_instance_block",
                              ctor = sys.parent(), ctor_pkg = NULL, ...) {
  if (!nzchar(source) && length(sources)) source <- names(sources)[1L]

  new_transform_block(
    function(id, data) {
      moduleServer(id, function(input, output, session) {
        ns <- session$ns
        r_run <- reactiveVal(instance)
        r_source <- reactiveVal(source)
        tick <- reactiveVal(0L)
        seen <- store_fingerprint(store)

        observe({
          invalidateLater(poll * 1000, session)
          now <- store_fingerprint(store)
          if (!identical(now, seen)) {
            seen <<- now
            tick(isolate(tick()) + 1L)
          }
        })

        instances_of <- function(nm) {
          src <- sources[[nm]]
          if (is.function(src)) src() else src
        }

        observeEvent(input$run_id, {
          if (nzchar(input$run_id)) r_run(input$run_id)
        })
        observeEvent(input$source, r_source(input$source))

        observeEvent(input$open, {
          def <- data()
          req(is.data.frame(def), nrow(def) > 0)
          inst <- instances_of(r_source())
          req(is.data.frame(inst))
          start_instance(def, inst, r_run(), store, actor = "board")
          seen <<- store_fingerprint(store)
          tick(isolate(tick()) + 1L)
        })

        # "New instance\u2026": point the card at the next free id -- since no
        # instance of that id exists, the header becomes the form again. The
        # old instance stays in the log; blocks on `instance = "latest"` move over
        # once the new one is opened.
        observeEvent(input$new_run, {
          r_run(next_free_instance(store, r_run()))
        })

        output$card <- renderUI({
          tick()
          def <- tryCatch(data(), error = function(e) NULL)
          start_card(
            ns, store, r_run(), r_source(), names(sources),
            def = def,
            elements = tryCatch(
              instances_of(r_source()), error = function(e) NULL
            )
          )
        })

        list(
          expr = reactive(
            bbquote(
              blockr.process::instance_view(store = .(s), instance = .(r), stamp = .(k)),
              list(s = store, r = r_run(), k = tick())
            )
          ),
          # `sources` is deliberately NOT state: functions do not serialize.
          # A deployment registers a wrapping ctor with its lists baked in,
          # and restore goes through that wrapper.
          state = list(
            store = reactive(store),
            instance = r_run,
            source = r_source,
            poll = reactive(poll)
          )
        )
      })
    },
    function(id) {
      tagList(
        css_block_dep("start-instance"),
        div(
          class = "block-container",
          uiOutput(NS(id, "card"))
        )
      )
    },
    class = class,
    ctor = ctor,
    ctor_pkg = ctor_pkg,
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}

#' The card: the moment before, the header after
#' @noRd
start_card <- function(ns, store, instance, source, source_names,
                         def = NULL, elements = NULL) {
  stamped <- instance_definition(store, instance)

  if (!is.null(stamped)) {
    return(start_header(ns, store, instance, stamped, def))
  }

  have_def <- is.data.frame(def) && nrow(def) > 0
  # the sub-process containers are structure, not work: they neither count
  # as tasks nor become rows
  n_multi <- if (have_def) sum(nzchar(multi_tasks(def))) else 0L
  n_task <- if (have_def) nrow(process_body(def)) else 0L
  n_inst <- if (is.data.frame(elements)) nrow(elements) else 0L
  n_rows <- if (have_def) {
    n_multi * n_inst + (n_task - n_multi)
  } else {
    0L
  }

  # A help line, not a placeholder: it is a function of the current fields
  # (pick another collection and the numbers move) and it is most useful
  # right before the click, which is the only irreversible moment here.
  meta <- if (!have_def) {
    span("No process definition connected")
  } else if (!n_inst) {
    span("The collection is empty \u2014 nothing to repeat over")
  } else {
    dims <- unique(multi_tasks(def))
    dims <- dims[nzchar(dims)]
    tagList(
      tags$b(n_task), " tasks",
      if (n_multi) {
        tagList(
          " \u00b7 ", tags$b(n_multi), " repeat per ",
          paste(dims, collapse = " / ")
        )
      },
      " \u00b7 ", tags$b(n_inst), " elements \u2192 ", tags$b(n_rows), " task rows"
    )
  }

  div(
    class = "sib-card",
    div(
      class = "sib-head",
      span(class = "sib-title", "No instance yet"),
      if (have_def) span(class = "sib-version", process_version(def))
    ),
    div(
      class = "sib-grid",
      div(
        class = "sib-field sib-field--id",
        textInput(ns("run_id"), "Instance", value = instance)
      ),
      if (length(source_names) > 1) {
        div(
          class = "sib-field",
          # selectize = FALSE on purpose: the design system rejects
          # Selectize, and a native <select> is what the CSS below styles
          selectInput(
            ns("source"), "Collection", choices = source_names,
            selected = source, selectize = FALSE
          )
        )
      },
      div(
        class = "sib-field sib-field--go",
        tags$button(
          id = ns("open"), type = "button", class = "sib-go action-button",
          disabled = if (!have_def || !n_inst) NA else NULL,
          "Start instance"
        )
      )
    ),
    div(class = "sib-meta", meta)
  )
}

#' @noRd
start_header <- function(ns, store, instance, stamped, def) {
  st <- instance_state(store, instance)[["@instance"]]
  tab <- instance_table(store, instance)
  n_inst <- length(unique(tab$element[!is.na(tab$element)]))

  drift <- is.data.frame(def) && nrow(def) > 0 &&
    !identical(process_version(def), st$version %||% "")

  # Same two lines as the card before it -- title and version up top, the
  # numbers below -- so starting an instance does not move anything.
  div(
    class = "sib-card",
    div(
      class = "sib-head",
      span(class = "sib-title", paste("Instance", instance)),
      span(class = "sib-version", st$version %||% "?"),
      span(class = "sib-spring"),
      tags$button(
        id = ns("new_run"), type = "button",
        class = "sib-link action-button", "New instance\u2026"
      )
    ),
    div(
      class = "sib-meta",
      "started ", substr(st$created %||% "", 1, 10), " \u00b7 ",
      tags$b(n_inst), " elements \u00b7 ", tags$b(nrow(tab)), " task rows"
    ),
    if (drift) {
      div(
        class = "sib-drift",
        paste0(
          "The definition has changed since this instance started (now ",
          process_version(def),
          "). It applies to the next instance, never to this one."
        )
      )
    }
  )
}

#' The next instance id no instance exists under: numeric ids count up (2026 ->
#' 2027), anything else leaves the field to the user.
#' @noRd
next_free_instance <- function(store, cur) {
  if (!grepl("^[0-9]+$", cur %||% "")) {
    return("")
  }
  id <- suppressWarnings(as.integer(cur))
  for (i in seq_len(50L)) {
    id <- id + 1L
    if (is.null(instance_definition(store, as.character(id)))) {
      return(as.character(id))
    }
  }
  ""
}
