import app from 'ags/gtk4/app';
import { Astal, Gtk, Gdk } from 'ags/gtk4';
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
import Graphene from 'gi://Graphene?version=1.0';
import { activePopup, setActivePopup } from '../state.ts';

export default function Popup({
  gdkmonitor,
  name,
  visible,
  margin,
  cssClass,
  halign = Gtk.Align.CENTER,
  widthRequest,
  children,
  valign = Gtk.Align.START,
  fullscreen = false,
}: {
  gdkmonitor: Gdk.Monitor;
  name: string;
  visible: any;
  margin: any;
  cssClass: string;
  halign?: Gtk.Align;
  widthRequest?: number;
  children?: any;
  valign?: Gtk.Align;
  fullscreen?: boolean;
}) {
  let ref!: Gtk.Widget;
  return (
    <window
      name={name}
      visible={visible}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      gdkmonitor={gdkmonitor}>
      <Gtk.GestureClick
        onPressed={(ctrl, _, x, y) => {
          const [ok, rect] = ref.compute_bounds(ctrl.get_widget()!);
          if (
            ok &&
            !rect.contains_point(new Graphene.Point({ x, y }))
          ) {
            setActivePopup(null);
          }
        }}
      />
      <Gtk.Revealer
        transitionType={
          fullscreen
            ? Gtk.RevealerTransitionType.SWING_LEFT
            : valign === Gtk.Align.START
              ? Gtk.RevealerTransitionType.SWING_DOWN
              : Gtk.RevealerTransitionType.SWING_UP
        }
        transitionDuration={300}
        revealChild={false}
        $={self => {
          visible.subscribe(() => {
            if (visible()) {
              setTimeout(() => self.set_reveal_child(true), 0);
            } else {
              self.set_reveal_child(false);
            }
          });
        }}>
        <box
          heightRequest={fullscreen ? 1000 : -1}
          $={self => (ref = self)}
          halign={halign}
          valign={valign}
          orientation={Gtk.Orientation.VERTICAL}
          marginStart={margin((v: number) => (v > 0 ? v : 0))}
          marginEnd={margin((v: number) => (v < 0 ? -v : 0))}
          class={cssClass}
          widthRequest={widthRequest ?? (fullscreen ? 400 : -1)}>
          {children}
        </box>
      </Gtk.Revealer>
    </window>
  );
}
