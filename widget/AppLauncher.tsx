import app from 'ags/gtk4/app';
import Fuse from 'fuse.js';
import { For } from 'ags';
import appList, { App } from '../utils/appList';
import { Astal, Gtk, Gdk } from 'ags/gtk4';
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
import Graphene from 'gi://Graphene?version=1.0';
import { activePopup, setActivePopup } from '../state';
import Gio from 'gi://Gio?version=2.0';

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  let ref!: Gtk.Widget;

  return (
    <window
      visible={activePopup(v => v == 'launcher')}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      gdkmonitor={gdkmonitor}
      name="launcher"
      keymode={Astal.Keymode.ON_DEMAND}>
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
      <box
        $={self => (ref = self)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
        class="launcher"
        widthRequest={300}>
        <box orientation={Gtk.Orientation.HORIZONTAL} class="search">
          <label label="" class="icon" />
          <Gtk.Entry
            $={self => {
              activePopup.subscribe(() => {
                if (activePopup() === 'launcher') {
                  self.grab_focus();
                  self.text = '';
                }
              });
            }}
            placeholderText="search..."
          />
        </box>

        <scrolledwindow widthRequest={500} heightRequest={500}>
          <box orientation={Gtk.Orientation.VERTICAL} class="list">
            <For each={appList}>
              {(app: App) => (
                <box
                  orientation={Gtk.Orientation.HORIZONTAL}
                  class="entry">
                  <Gtk.Picture
                    contentFit={Gtk.ContentFit.COVER}
                    $type="overlay"
                    file={Gio.File.new_for_path(
                      app[3] ||
                        '/home/alexmn/.config/ags/spotify/local.png'
                    )}
                  />
                  <label label={app[1]} />
                </box>
              )}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </window>
  );
}
