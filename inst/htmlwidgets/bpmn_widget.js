HTMLWidgets.widget({
  name: "bpmn_widget",
  type: "output",

  factory: function (el, width, height) {
    var viz = null;
    var seq = 0;

    var SPECIAL = ["open", "doing", "blocked", "skipped"];

    return {
      renderValue: function (x) {
        var mySeq = ++seq;
        BlockrBpmn.layoutProcess(x.xml)
          .then(function (res) {
            if (mySeq !== seq) return; // superseded by a newer render
            var xml = typeof res === "string" ? res : res.xml;
            el.innerHTML = "";
            viz = new BlockrBpmn.BpmnVisualization({
              container: el,
              navigation: { enabled: true }
            });
            viz.load(xml, {
              fit: { type: BlockrBpmn.FitType.Center, margin: 24 }
            });
            var reg = viz.bpmnElementsRegistry;
            var status = x.status || {};
            Object.keys(status).forEach(function (id) {
              var s = String(status[id]);
              if (s === "open" || !s.length) return;
              var cls = SPECIAL.indexOf(s) >= 0 ? s : "done";
              try { reg.addCssClasses(id, "st-" + cls); } catch (e) { /* unknown id */ }
            });
            var overlays = x.overlays || {};
            Object.keys(overlays).forEach(function (id) {
              var label = String(overlays[id]);
              if (!label.length) return;
              try {
                reg.addOverlays(id, {
                  position: "bottom-center",
                  label: label,
                  style: {
                    font: { color: "#6b7280", size: 11 },
                    fill: { color: "#f9fafb", opacity: 90 },
                    stroke: { color: "#e5e7eb" }
                  }
                });
              } catch (e) { /* overlay API differences: ignore */ }
            });
          })
          .catch(function (err) {
            if (mySeq !== seq) return;
            el.innerHTML =
              '<pre style="color:#b91c1c;white-space:pre-wrap;font-size:12px;padding:8px;">' +
              "BPMN layout/render error:\n" +
              String(err && err.message ? err.message : err) +
              "</pre>";
          });
      },

      resize: function (width, height) {
        if (viz) {
          try {
            viz.navigation.fit({ type: BlockrBpmn.FitType.Center, margin: 24 });
          } catch (e) {
            /* no-op */
          }
        }
      }
    };
  }
});
