import app from 'ags/gtk4/app';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { activePopup, setActivePopup } from '../state';
import Graphene from 'gi://Graphene?version=1.0';
import { execAsync } from 'ags/process';
import { Accessor, createComputed, createState, For } from 'ags';
import { formatBytes, formatDate } from '../utils/format';
import { home } from '../polls';

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

const [deviceName, setDeviceName] =
  createState<string>('device name');

execAsync([
  'cat',
  '/sys/class/dmi/id/product_name',
  '/sys/class/dmi/id/product_version',
])
  .then(r => {
    const [name, version] = r.split('\n');
    setDeviceName(`${name} ${version}`);
  })
  .catch(console.error);

const [kernel, setKernel] = createState<string>(
  'an unknown Linux version'
);

execAsync(['uname', '-r']).then(setKernel).catch(console.error);

const [hyprVersion, setHyprVersion] = createState<
  Record<string, string | string[]>
>({});

execAsync(['hyprctl', 'version', '-j'])
  .then(r => setHyprVersion(JSON.parse(r) ?? {}))
  .catch(console.error);

const hyprReleased = createComputed(() => {
  if (!hyprVersion().commit_date) return 'wait';
  return `${hyprVersion().tag} (released ${formatDate(hyprVersion().commit_date as string, 'relative')})`;
});

const [storage, setStorage] = createState<{
  source?: string;
  fstype?: string;
  size?: string;
  used?: string;
  avail?: string;
  'use%'?: string;
}>({});

let storageSizeBytes: number = 1;

execAsync([
  'findmnt',
  '-J',
  '/',
  '-o',
  'SOURCE,FSTYPE,SIZE,USED,AVAIL,USE%',
])
  .then(r => {
    const json = JSON.parse(r).filesystems[0];
    storageSizeBytes = formatBytes(json.used, 'number') as number;
    setStorage(json);
  })
  .catch(console.error);

const [storageDirs, setStorageDirs] = createState<
  [string, string, string][]
>([]);

// if it doesn't exist prints nothing instead of exiting, so it's safe to add anything here
const checkDirs = [
  '/var/cache/pacman/pkg',
  '%H/Downloads',
  '%H/Videos',
  '%H/Pictures',
  '%H/Documents',
  '%H/.cache',
  '%H/Projects',
  '%H/.config',
  '%H/.local/share/Steam',
];

execAsync([
  'sh',
  '-c',
  `du -s --block-size=1 ${checkDirs.map(dir => dir.replaceAll('%H', home)).join(' ')} 2>/dev/null || true`,
])
  .then(r => {
    const lines = r.split('\n');
    const entries: [string, string, string][] = lines.map(line => {
      let [num, dir] = line.split('\t') as [string, string];
      const number = parseInt(num);
      return [
        dir.replaceAll(home, '~'),
        formatBytes(number) as string,
        ((number / storageSizeBytes) * 100)
          .toFixed(2)
          .padStart(5, '0'),
      ];
    });
    setStorageDirs(
      entries.sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]))
    );
  })
  .catch(console.error);

const [pacmanVersion, setPacmanVersion] =
  createState<string>('unknown');
const [installedPackages, setInstalledPackages] =
  createState<string>('unknown');
const [pendingUpdates, setPendingUpdates] =
  createState<string>('unknown');
const [yayVersion, setYayVersion] = createState<string>('unknown');
const [aurInstalledPackages, setAurInstalledPackages] =
  createState<string>('unknown');
const [aurPendingUpdates, setAurPendingUpdates] =
  createState<string>('unknown');

execAsync(['pacman', '-Q', 'pacman'])
  .then(setPacmanVersion)
  .catch(console.error);

execAsync(['sh', '-c', 'pacman -Q | wc -l'])
  .then(setInstalledPackages)
  .catch(console.error);

execAsync(['sh', '-c', 'pacman -Qu | wc -l'])
  .then(setPendingUpdates)
  .catch(console.error);

execAsync(['pacman', '-Q', 'yay'])
  .then(setYayVersion)
  .catch(console.error);

execAsync(['sh', '-c', 'pacman -Qmq | wc -l'])
  .then(setAurInstalledPackages)
  .catch(console.error);

execAsync(['sh', '-c', 'yay -Qua | wc -l'])
  .then(setAurPendingUpdates)
  .catch(console.error);

const [memory, setMemory] = createState<
  Record<string, string | number>
>({});

execAsync(['free', '-b']).then(r => {
  const [, total, used] = r.split('\n')[1].split(/\s+/);
  setMemory({
    total: +total,
    used: +used,
    percent:
      ((parseInt(used) / parseInt(total)) * 100).toFixed(2) + '%',
  });
});

const [memoryApps, setMemoryApps] = createState<
  [string, string, string][]
>([]);

execAsync([
  'sh',
  '-c',
  'ps -eo comm,rss --sort=-rss --no-headers | head -10',
])
  .then(r => {
    const lines = r.split('\n');
    const entries: [string, string, string][] = lines.map(line => {
      const name = line.replace(/\s+\d+$/, '');
      const bytes = +(line.match(/\d+$/) ?? [0])[0] * 1024;
      return [
        name.length === 15 ? name.substring(0, 14) + '…' : name,
        formatBytes(bytes) as string,
        ((bytes / (memory().used as number)) * 100).toFixed(2) + '%',
      ];
    });
    setMemoryApps(entries);
  })
  .catch(console.error);

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
  ['Hyprland', 'hypr'],
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
  hypr: '',
} as const;

const [activePage, setActivePage] = createState<string>(
  sections()[0][1]
);

// const [storageExpanded, setStorageExpanded] =
//   createState<boolean>(false);

const [padLengthStorage1, setPadLengthStorage1] = createState(0);
const [padLengthStorage2, setPadLengthStorage2] = createState(0);
const [padLengthMemory1, setPadLengthMemory1] = createState(0);
const [padLengthMemory2, setPadLengthMemory2] = createState(0);

const padLength1 = createComputed(() =>
  Math.max(padLengthStorage1(), padLengthMemory1())
);
const padLength2 = createComputed(() =>
  Math.max(padLengthStorage2(), padLengthMemory2())
);

function thisDevice() {
  return (
    <box class="thisDevice" orientation={Gtk.Orientation.VERTICAL}>
      <box class="overview" orientation={Gtk.Orientation.HORIZONTAL}>
        <label label="󰣇" class="deviceIcon" />
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              class="desktop"
              label="󰌢 "
              halign={Gtk.Align.START}
            />
            <label label={deviceName} halign={Gtk.Align.START} />
          </box>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label=" "
              halign={Gtk.Align.START}
              class="linux"
            />
            <label
              label={kernel(k => `Arch Linux on ${k}`)}
              halign={Gtk.Align.START}
            />
          </box>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label=" "
              halign={Gtk.Align.START}
              class="hyprland"
            />
            <label label={hyprReleased} halign={Gtk.Align.START} />
          </box>
        </box>
      </box>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        class="storage page">
        <label
          halign={Gtk.Align.START}
          label=" Storage"
          class="header"
        />
        <label
          halign={Gtk.Align.START}
          label={storage(
            s =>
              `${formatBytes(s.used ?? '123')}/${formatBytes(
                s.size ?? '123'
              )} (${s['use%'] ?? '100%'})`
          )}
          class="summary"
        />
        <box
          orientation={Gtk.Orientation.VERTICAL}
          // visible={storageExpanded}
        >
          {/* hi to anyone reading this */}
          <label
            label="loading..."
            class="dir static"
            visible={storageDirs(d => !d.length)}
            halign={Gtk.Align.START}
          />
          <For each={storageDirs}>
            {([dir, size, percent]) => {
              setPadLengthStorage1(
                Math.max(
                  ...storageDirs().map(([s, _, __]) => s.length)
                )
              );
              setPadLengthStorage2(
                Math.max(
                  ...storageDirs().map(([_, s, __]) => s.length)
                )
              );

              return (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  <label
                    class="dir"
                    halign={Gtk.Align.START}
                    $={self =>
                      self.set_cursor(
                        Gdk.Cursor.new_from_name('pointer', null)
                      )
                    }
                    label={padLength1(pl1 => dir.padEnd(pl1, ' '))}>
                    <Gtk.GestureClick
                      button={1}
                      onPressed={() => {
                        execAsync([
                          'setsid',
                          'xdg-open',
                          dir.replace('~', home),
                        ]);
                        setActivePopup(null);
                      }}
                    />
                  </label>
                  <label
                    class="dir"
                    halign={Gtk.Align.START}
                    $={self =>
                      self.set_cursor(
                        Gdk.Cursor.new_from_name('pointer', null)
                      )
                    }
                    label={padLength2(
                      pl2 =>
                        `: ${size.padEnd(padLength2(), ' ')} (${parseFloat(percent) > 0 ? percent : '<0.01'}%)`
                    )}>
                    <Gtk.GestureClick
                      button={1}
                      onPressed={() => {
                        execAsync([
                          'setsid',
                          'xdg-open',
                          dir.replace('~', home),
                        ]);
                        setActivePopup(null);
                      }}
                    />
                  </label>
                </box>
              );
            }}
          </For>
        </box>
        {/* <label
          label={storageExpanded(e =>
            e ? '󰞙 Collapse' : '󰞖 Expand'
          )}
          $={self =>
            self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
          }
          class="summary"
          halign={Gtk.Align.START}>
          <Gtk.GestureClick
            button={1}
            onPressed={() => setStorageExpanded(!storageExpanded())}
          />
        </label> */}
      </box>
      <box class="memory page" orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <label
            class="header icon"
            label=""
            halign={Gtk.Align.START}
          />
          <label
            class="header"
            label="Memory"
            halign={Gtk.Align.START}
          />
        </box>
        <label
          halign={Gtk.Align.START}
          class="summary"
          label={memory(
            m =>
              `${formatBytes(m.used)}/${formatBytes(m.total)} (${m.percent})`
          )}
        />
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={memoryApps}>
            {app => {
              setPadLengthMemory1(
                Math.max(
                  ...memoryApps().map(([s, _, __]) => s.length)
                )
              );
              setPadLengthMemory2(
                Math.max(
                  ...memoryApps().map(([_, s, __]) => s.length)
                )
              );
              return (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  <label
                    label={padLength1(pl1 => app[0].padEnd(pl1, ' '))}
                    halign={Gtk.Align.START}
                  />
                  <label
                    label={padLength2(
                      pl2 =>
                        `: ${app[1].padEnd(pl2, ' ')} (${app[2].padStart(6, '0')})`
                    )}
                    halign={Gtk.Align.START}
                  />
                </box>
              );
            }}
          </For>
        </box>
      </box>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        class="packages page">
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <label halign={Gtk.Align.START} label="󰏗" class="icon" />
          <label
            halign={Gtk.Align.START}
            label="Pacman"
            class="header"
          />
        </box>
        <label
          label={pacmanVersion(p => `Pacman Version: ${p}`)}
          halign={Gtk.Align.START}
        />
        <label
          label={yayVersion(p => `Yay Version: ${p}`)}
          halign={Gtk.Align.START}
        />
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <label
            label={installedPackages(p => `Installed Packages: ${p}`)}
            halign={Gtk.Align.START}
          />
          <label
            label={aurInstalledPackages(p => ` (+${p} AUR)`)}
            halign={Gtk.Align.START}
          />
        </box>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <label
            label={pendingUpdates(p => `Pending Updates: ${p}`)}
            halign={Gtk.Align.START}
          />
          <label
            label={aurPendingUpdates(p => ` (+${p} AUR)`)}
            halign={Gtk.Align.START}
          />
        </box>
      </box>
    </box>
  );
}

function users() {
  return (
    <label label="not doing this cause there's only one user on my system" />
  );
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
        <scrolledwindow heightRequest={800} widthRequest={600}>
          <box
            class="main"
            orientation={Gtk.Orientation.VERTICAL}
            widthRequest={500}>
            <label
              class="title"
              label={activePage(
                p =>
                  (sections()?.find(s => s[1] === p) ?? ['error'])[0]
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
        </scrolledwindow>
      </box>
    </window>
  );
}
