.onLoad <- function(libname, pkgname) {
  blockr.core::register_blocks(
    ctor = c("new_delivery_block", "new_start_block"),
    name = c("Delivery platform", "Start instance"),
    description = c(
      paste(
        "The delivery platform as a button: writes one inbox message per",
        "click, which the worker turns into an event"
      ),
      "Start an instance from the incoming definition; the demo lists baked in"
    ),
    category = c("input", "transform"),
    package = pkgname
  )
}
