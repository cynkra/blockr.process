#' @keywords internal
#' @importFrom blockr.core bbquote new_data_block new_plot_block
#'   new_transform_block
#' @importFrom htmltools htmlDependency
#' @importFrom shiny NS div span moduleServer observeEvent reactive
#'   reactiveVal tagList invalidateLater isolate observe renderText
#'   textOutput
"_PACKAGE"

# The block constructors build their expressions with bbquote(), whose
# placeholders (`.`, `data`, and the `s`/`r`/`k` of the state templates) are
# substituted at eval time and so look like undefined globals to R CMD check.
utils::globalVariables(c(".", "a", "data", "k", "r", "s"))
