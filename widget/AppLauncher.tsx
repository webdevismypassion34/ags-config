import app from "ags/gtk4/app"
import Fuse from "fuse.js"
import { Astal, Gtk, Gdk } from "ags/gtk4"
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
import Graphene from "gi://Graphene?version=1.0"
import { activePopup, setActivePopup } from "../state"

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  let ref!: Gtk.Widget

  return (
    <window
      visible={activePopup((v) => v == "launcher")}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      gdkmonitor={gdkmonitor}
      name="launcher"
    >
      <Gtk.GestureClick
        onPressed={(ctrl, _, x, y) => {
          const [ok, rect] = ref.compute_bounds(ctrl.get_widget()!)
          if (ok && !rect.contains_point(new Graphene.Point({ x, y }))) {
            setActivePopup(null)
          }
        }}
      />
      <box
        $={(self) => (ref = self)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
        class="launcher"
        widthRequest={300}
      >
        <label label="Hello, world!" />
      </box>
    </window>
  )
}
