import { For, createState } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import { openWindows as openWindowsPoll } from '../polls.ts';
import iconsData from '../icons.json';
import Gio from 'gi://Gio?version=2.0';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';
import { centeredMargin } from '../utils/margin.ts';

const [appPopup, setAppPopup] = createState('');
const [appMargin, setAppMargin] = createState(0);
const [openWindows, setOpenWindows] = createState<
  Record<string, string>[]
>([]);

// purely visual
const visualClassOverrides: Record<string, string> = {"com.obsproject.Studio": "OBS", 'code-oss': 'VS Code'}

const titles = (w: Record<string, string>[]) =>
  w
    .map(w => w.title)
    .sort()
    .join(',');

// increase performance, reduce visual bugs (hover, cursor, etc) by only updating when it changes instead of every 500ms, when it polls
openWindowsPoll.subscribe(() => {
  if (titles(openWindowsPoll()) !== titles(openWindows())) {
    setOpenWindows(openWindowsPoll());
  }
});

activePopup.subscribe(() => {
  if (activePopup() === null) setAppPopup('');
});

const icons = iconsData as Record<string, Record<string, string>>;

export function Apps({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <box class="appContainer">
      <For
        each={openWindows(w =>
          w
            .sort(
              (
                a: Record<string, string>,
                b: Record<string, string>
              ) => a.initialClass.localeCompare(b.initialClass)
            )
            .filter(
              (
                w: Record<string, string>,
                i: number,
                arr: Record<string, string>[]
              ) =>
                arr.findIndex(
                  x => x.initialClass === w.initialClass
                ) === i
            )
        )}>
        {(window: Record<string, string>) => {
          const icon =
            Object.values(icons)?.filter(
              icon =>
                icon.class.toLowerCase() ==
                  window.initialClass.toLowerCase() ||
                icon.class.toLowerCase() ==
                  window.initialTitle.toLowerCase()
            )?.[0]?.icon ?? null;
          return (
            <button
              class="apps"
              onClicked={self => {
                if (appPopup() === window.initialClass) {
                  setActivePopup(null);
                } else {
                  setAppMargin(centeredMargin(self, gdkmonitor));
                  setAppPopup(window.initialClass);
                  setActivePopup('app');
                }
              }}>
              <box
                orientation={Gtk.Orientation.VERTICAL}
                $={self =>
                  self.set_cursor(
                    Gdk.Cursor.new_from_name('pointer', null)
                  )
                }
                class={appPopup(p =>
                  p == window.initialClass ? 'app viewing' : 'app'
                )}>
                <overlay widthRequest={40} heightRequest={40}>
                  {icon ? (
                    <Gtk.Picture
                      file={Gio.File.new_for_path(icon)}
                      contentFit={Gtk.ContentFit.CONTAIN}
                      $type="overlay"
                    />
                  ) : (
                    <Gtk.Image
                      iconName={window.initialClass.toLowerCase()}
                      iconSize={Gtk.IconSize.LARGE}
                      $type="overlay"
                    />
                  )}
                </overlay>
                <label label={visualClassOverrides[window.initialClass] ? visualClassOverrides[window.initialClass] : window.initialClass} />
              </box>
            </button>
          );
        }}
      </For>
    </box>
  );
}

export function AppsPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="appPopup"
      visible={appPopup(p => p !== '')}
      margin={appMargin}
      cssClass="appPopup"
      valign={Gtk.Align.END}>
      <For
        each={openWindows(w =>
          w.filter(
            (win: Record<string, string>) =>
              win.initialClass === appPopup()
          )
        )}>
        {(window: Record<string, string>) => (
          <button $={self => self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))}
            onClicked={() => {
              setActivePopup(null)
              execAsync(
                `hyprctl dispatch focuswindow address:${window.address}`
              );
            }}>
            <label
              label={
                window.title.length > 60
                  ? window.title.slice(0, 60) + '…'
                  : window.title
              }
            />
          </button>
        )}
      </For>
    </Popup>
  );
}
