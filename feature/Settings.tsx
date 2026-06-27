import app from 'ags/gtk4/app';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { activePopup, setActivePopup } from '../state';
import Graphene from 'gi://Graphene?version=1.0';
import { execAsync } from 'ags/process';
import { Accessor, createState, For } from 'ags';

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

const [sections, _] = createState<[string, string][]>([
  ['This Device', 'this-device'],
  ['Users', 'users'],
  ['Wifi', 'wifi'],
  ['Bluetooth', 'bluetooth'],
  ['Notifications', 'notifications'],
  ['Sound', 'sound'],
  ['General', 'general'],
  ['Appearance', 'appearance'],
  ['AGS', 'ags'],
] as const);

const sectionIcons: Record<string, string> = {
  'this-device': '󰣇',
  users: '',
  wifi: '󰤨',
  bluetooth: '󰂯',
  notifications: '',
  sound: '󰕾',
  general: '',
  appearance: '󰈈',
  ags: '',
} as const;

const [activePage, setActivePage] = createState<string>(
  sections()[0][1]
);

function thisDevice() {
  return <label label="device options" />;
}

function users() {
  return <label label="users options" />;
}

export default function settingsApp(gdkmonitor: Gdk.Monitor) {
  let ref!: Gtk.Widget;

  return (
    <window
      visible={activePopup(v => v == 'settings')}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      gdkmonitor={gdkmonitor}
      name="settings"
      keymode={Astal.Keymode.ON_DEMAND}
      focusable={true}
      $={self => {
        activePopup.subscribe(() => {
          if (activePopup() === 'settings') {
          }
        });
        const ctrl = new Gtk.EventControllerKey();

        ctrl.connect('key-pressed', async (_, keyval) => {
          if (keyval === Gdk.KEY_Escape) {
            setActivePopup(null);
          }
        });
        self.add_controller(ctrl);
      }}>
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
        class="settingsOverlay"
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.HORIZONTAL}
        heightRequest={600}>
        <box
          class="sidebar"
          orientation={Gtk.Orientation.VERTICAL}
          widthRequest={150}>
          <For each={sections}>
            {([label, slug]: [string, string]) => (
              <button
                onClicked={() => setActivePage(slug)}
                class={activePage(
                  p => `page${p === slug ? ' selected' : ''}`
                )}
                hexpand
                // halign={Gtk.Align.START}
                $={self =>
                  self.set_cursor(
                    Gdk.Cursor.new_from_name('pointer', null)
                  )
                }>
                <label
                  label={`${sectionIcons[slug]} ${label}`}
                  hexpand
                  halign={Gtk.Align.START}
                />
              </button>
            )}
          </For>
        </box>
        <box
          class="main"
          orientation={Gtk.Orientation.VERTICAL}
          widthRequest={500}>
          <label
            class="title"
            label={activePage(
              p => (sections()?.find(s => s[1] === p) ?? ['error'])[0]
            )}
            halign={Gtk.Align.START}
          />
          <For each={activePage(p => [p])}>
            {(page: string) => {
              if (page === 'this-device') return thisDevice();
              if (page === 'users') return users();
              return <label label={`unknown page: ${page}`} />;
            }}
          </For>
        </box>
      </box>
    </window>
  );
}
