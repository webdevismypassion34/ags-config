import app from 'ags/gtk4/app';
import Fuse from 'fuse.js';
import { createState, For } from 'ags';
import { execAsync } from 'ags/process';
import appList, { App } from '../utils/appList';
import { Astal, Gtk, Gdk } from 'ags/gtk4';
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
import Graphene from 'gi://Graphene?version=1.0';
import { activePopup, setActivePopup } from '../state';
import Gio from 'gi://Gio?version=2.0';

let maxResultsLength = 11;

const [results, setResults] = createState<App[]>([]);
const [selectedItem, selectItem] = createState(0);

let fuse = new Fuse(appList(), {
  keys: [{ name: 'name', getFn: app => app[1] }],
});

appList.subscribe(() => {
  fuse = new Fuse(appList(), {
    keys: [{ name: 'name', getFn: app => app[1] }],
  });
});

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  let ref!: Gtk.Widget;

  function updateResults(query: string) {
    if (query == '') {
      setResults(appList().slice(0, maxResultsLength));
      return;
    }

    const result = fuse.search(query).map(r => r.item);
    setResults(result.slice(0, maxResultsLength));
  }

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
                  setResults(appList().slice(0, maxResultsLength));
                }
              });

              self.connect('changed', () => {
                const query = self.get_text();
                updateResults(query);
              });
            }}
            placeholderText="search..."
          />
        </box>

        <scrolledwindow
          widthRequest={500}
          heightRequest={480}
          class="list">
          <box orientation={Gtk.Orientation.VERTICAL}>
            <For each={results}>
              {(app: App) => (
                <box
                  orientation={Gtk.Orientation.HORIZONTAL}
                  class="entry"
                  $={self => {
                    self.set_cursor(
                      Gdk.Cursor.new_from_name('pointer', null)
                    );
                  }}>
                  <Gtk.GestureClick
                    button={1}
                    onPressed={() => {
                      if (app[5]) {
                        execAsync([
                          'kitty',
                          ...app[4].split(' '),
                        ]).catch(console.error);
                      } else {
                        execAsync(app[4]).catch(console.error);
                      }
                    }}
                  />
                  <overlay widthRequest={44} heightRequest={32}>
                    <Gtk.Picture
                      contentFit={Gtk.ContentFit.COVER}
                      $type="overlay"
                      class="icon"
                      file={Gio.File.new_for_path(
                        app[3] ||
                          '/usr/share/icons/Tokyonight-Dark/status/32/image-missing.svg'
                      )}
                    />
                  </overlay>
                  <label label={app[1]} />
                  {/* {app[2] ? (
                    <label class="comment" label={app[2]} />
                  ) : (
                    ''
                  )} */}
                </box>
              )}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </window>
  );
}
