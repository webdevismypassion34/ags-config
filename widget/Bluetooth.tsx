import { For, createState, createComputed } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import {
  bluetoothDevice,
  bluetoothBlocked,
  bluetoothPercent,
} from '../polls.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';

const [bluetoothMargin, setBluetoothMargin] = createState(0);
type BtDevice = { mac: string; name: string };
const [bluetoothDevices, setBluetoothDevices] = createState<
  BtDevice[]
>([]);
const [bluetoothScanning, setBluetoothScanning] = createState(false);

function updateBluetoothDevices() {
  setBluetoothDevices([]);
  execAsync([
    'sh',
    '-c',
    "bluetoothctl devices | sed 's/\\x1b\\[[0-9;]*m//g'",
  ])
    .then(d =>
      d
        .split('\n')
        .map(line => {
          const parts = line.trim().split(' ');
          return { mac: parts[1], name: parts.slice(2).join(' ') };
        })
        .filter(
          ({ name, mac }) =>
            name &&
            mac &&
            !/^([0-9A-F]{2}[-:]){5}[0-9A-F]{2}$/i.test(name)
        )
    )
    .then(a => setBluetoothDevices(a))
    .catch(() => {});
}

export function BluetoothButton({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  function toggleBluetooth() {
    if (activePopup() == 'bluetooth') {
      setActivePopup(null);
    } else {
      setBluetoothMargin(
        centeredMargin(bluetoothButtonRef, gdkmonitor)
      );
      updateBluetoothDevices();
      setActivePopup('bluetooth');
    }
  }

  const bluetoothIcon = createComputed(() => {
    return bluetoothDevice() != 'none' ? '' : '󰂲';
  });

  let bluetoothButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        bluetoothButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="bluetooth"
      onClicked={toggleBluetooth}>
      <box>
        <label label={bluetoothIcon} class="icon" />
        <label label={bluetoothDevice} />
      </box>
    </button>
  );
}

export function BluetoothPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="bluetoothPopup"
      visible={activePopup(a => a == 'bluetooth')}
      margin={bluetoothMargin}
      cssClass="bluetoothOverlay">
      <box
        visible={bluetoothBlocked}
        class="rfkill"
        orientation={Gtk.Orientation.VERTICAL}>
        <label label=" bluetooth is blocked in rfkill" />
        <button
          $={self =>
            self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
          }
          class="rfUnblock"
          onClicked={() => execAsync('rfkill unblock bluetooth')}>
          <label label="unblock" />
        </button>
      </box>
      <centerbox class="title">
        <label $type="start" label="Bluetooth" />
        <box $type="end">
          <button
            sensitive={bluetoothScanning(v => !v)}
            $={self =>
              self.set_cursor(
                Gdk.Cursor.new_from_name('pointer', null)
              )
            }
            onClicked={() => {
              if (bluetoothScanning()) return;
              setBluetoothScanning(true);
              execAsync([
                'sh',
                '-c',
                'bluetoothctl scan on & sleep 10 && bluetoothctl scan off',
              ])
                .then(() => setBluetoothScanning(false))
                .catch(() => setBluetoothScanning(false));
            }}>
            <label
              label={bluetoothScanning(v =>
                v ? 'scanning' : 'scan'
              )}
            />
          </button>
          <button
            $={self =>
              self.set_cursor(
                Gdk.Cursor.new_from_name('pointer', null)
              )
            }
            onClicked={updateBluetoothDevices}>
            <label label="refresh" />
          </button>
        </box>
      </centerbox>
      <scrolledwindow heightRequest={300} widthRequest={300}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={bluetoothDevices}>
            {(device: BtDevice) => (
              <button
                $={self =>
                  self.set_cursor(
                    Gdk.Cursor.new_from_name('pointer', null)
                  )
                }
                onClicked={() =>
                  execAsync(
                    `bluetoothctl connect ${device.mac}`
                  ).catch(() => {})
                }>
                <box>
                  <label
                    class="icon"
                    label="󰸞"
                    visible={bluetoothDevice(v => v === device.name)}
                  />
                  <label
                    label={bluetoothPercent(v => `${v}% `)}
                    visible={bluetoothDevice(v => v === device.name)}
                  />
                  <label
                    halign={Gtk.Align.CENTER}
                    label={device.name}
                  />
                </box>
              </button>
            )}
          </For>
        </box>
      </scrolledwindow>
    </Popup>
  );
}
