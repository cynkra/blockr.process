# The smallest board that shows the idea: the organization as a data frame.
#
#   process (edit the tasks) -> roster (who may be assigned)
#                                 -> assign (who / due / status)
#                                      |-> bpmn  (diagram, status painted on)
#                                      \-> mine  (a stock dplyr filter)
#
# Every edge carries the same wide table, so the whole blockr ecosystem
# composes with it and a personal task view costs no new code.
#
# This board keeps its instance data in block state, which is enough to
# look at. The real thing -- an event log, people clicking in a task list,
# a worker running the scripts, other systems writing in -- is
# dev/data-collection-demo/.
#
#   shiny::runApp("<this package dir>")

library(blockr.core)
library(blockr.dplyr)
library(blockr.dock)
library(blockr.outline)
pkgload::load_all(".")

serve(
  new_dock_board(
    blocks = c(
      process = new_process_block(),
      # Who may be assigned is a property of the DATA, not of the assign
      # block: a factor column carries its own vocabulary, and the block
      # turns the levels into a picker. Nothing in blockr.process knows
      # these names. `assignee` is created here rather than converted,
      # because the definition has no instance columns until they are
      # applied.
      roster = new_mutate_block(
        mutations = list(list(
          name = "assignee",
          expr = 'factor(NA_character_, levels = c("ana", "ben", "mira", "theo"))'
        )),
        block_name = "Who may be assigned"
      ),
      assign = new_assign_block(assignments = example_assignments()),
      bpmn = new_bpmn_block(title = "Quarterly data collection"),
      mine = new_filter_block(
        conditions = list(list(
          type = "values", column = "assignee",
          values = list("ben"), mode = "include",
          colType = "character"
        )),
        block_name = "My tasks"
      )
    ),
    links = c(
      new_link(from = "process", to = "roster", input = "data"),
      new_link(from = "roster", to = "assign", input = "data"),
      new_link(from = "assign", to = "bpmn", input = "data"),
      new_link(from = "assign", to = "mine", input = "data")
    ),
    extensions = new_minidag_extension()
  )
)
