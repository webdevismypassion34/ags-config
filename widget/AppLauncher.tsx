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
import { readFile, readFileAsync, writeFileAsync } from 'ags/file';

let maxResultsLength = 11;
let usage: Record<string, number> = {};

const [results, setResults] = createState<App[]>([]);
const [selectedItem, selectItem] = createState(1);

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

  async function updateResults(query: string) {
    selectItem(1);
    if (query == '') {
      usage = JSON.parse(
        await readFileAsync('/home/alexmn/.config/ags/usage.json')
      );
      setResults(
        [...appList()]
          .sort((a, b) => (usage[b[0]] ?? 0) - (usage[a[0]] ?? 0))
          .slice(0, maxResultsLength)
      );
      return;
    }

    const result = fuse.search(query).map(r => r.item);
    setResults(result.slice(0, maxResultsLength));
  }

  function openApp(app: App) {
    setActivePopup(null);
    usage[app[0]] = (usage[app[0]] ?? 0) + 1;
    writeFileAsync(
      '/home/alexmn/.config/ags/usage.json',
      JSON.stringify(usage, null, 2)
    );
    const exec = app[4].replace(/%[a-zA-Z]/g, '').trim();
    if (app[5]) {
      execAsync(['kitty', ...exec.split(' ')]).catch(console.error);
    } else {
      execAsync(exec).catch(console.error);
    }
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
                  selectItem(1);
                  updateResults('');
                }
              });

              self.connect('changed', () => {
                const query = self.get_text();
                updateResults(query);
              });

              self.connect('activate', () => {
                // enter key
                console.log('enter');
                let exec;
                if (selectedItem() == 0) {
                  console.log('is zero');
                  exec = results()[0];
                } else {
                  exec = results()[selectedItem() - 1];
                }

                console.log(selectedItem() == 0);
                if (!exec[0]) return true;
                openApp(exec);
              });
              self.add_controller(
                (() => {
                  const ctrl = new Gtk.EventControllerKey();
                  ctrl.connect('key-pressed', (_, keyval) => {
                    if (keyval === Gdk.KEY_Up) {
                      if (selectedItem() <= 1) {
                        selectItem(maxResultsLength);
                      } else {
                        selectItem(selectedItem() - 1);
                      }
                      return true;
                    }
                    if (keyval === Gdk.KEY_Down) {
                      if (selectedItem() == 0) {
                        selectItem(2);
                        return true;
                      } else if (selectedItem() >= maxResultsLength) {
                        selectItem(1);
                      } else {
                        selectItem(selectedItem() + 1);
                      }
                      return true;
                    }
                  });
                  return ctrl;
                })()
              );
            }}
            placeholderText="search..."
          />
        </box>

        <scrolledwindow
          widthRequest={500}
          heightRequest={490}
          class="list">
          <box orientation={Gtk.Orientation.VERTICAL}>
            <For each={results}>
              {(app: App) => {
                console.log(results());
                return (
                  <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    class={selectedItem(v =>
                      v - 1 === results().indexOf(app)
                        ? 'entry selected'
                        : 'entry'
                    )}
                    $={self => {
                      self.set_cursor(
                        Gdk.Cursor.new_from_name('pointer', null)
                      );
                    }}>
                    <Gtk.GestureClick
                      button={1}
                      onPressed={() => {
                        openApp(app);
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
                );
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </window>
  );
}
