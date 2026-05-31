import { createPoll } from 'ags/time';
import { For, createState, createComputed } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import { wifi, wifiBlocked } from '../polls.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';

const [wifiMargin, setWifiMargin] = createState(0);
const [knownNetworks, setKnownNetworks] = createState<string[]>([]);
const [wifiList, setWifiList] = createState<string[]>([]);

function updateNetworks() {
  setWifiList([]); // visual feedback
  execAsync('nmcli -t -f name connection show')
    .then(out =>
      setKnownNetworks(
        out
          .trim()
          .split('\n')
          .filter(s => s)
          .map(n => n.trim())
      )
    )
    .then(() =>
      execAsync([
        'sh',
        '-c',
        'nmcli -t -f ssid,signal dev wifi list --rescan no | sort -t: -k2 -rn | awk -F: \'!seen[$1]++ && $1!=""\' | cut -d: -f1',
      ])
    )
    .then(out =>
      setWifiList(
        out
          .trim()
          .split('\n')
          .filter(s => s)
          .map(n => n.trim())
          .sort((a, b) => {
            const aKnown = knownNetworks().includes(a) ? -1 : 1;
            const bKnown = knownNetworks().includes(b) ? -1 : 1;
            return aKnown - bKnown;
          })
      )
    )
    .catch(() => {});
}

export function WifiButton({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  function toggleWifi() {
    if (activePopup() == 'wifi') {
      setActivePopup(null);
    } else {
      setWifiMargin(centeredMargin(wifiButtonRef, gdkmonitor));
      updateNetworks();
      setActivePopup('wifi');
    }
  }

  const wifiIcon = createPoll(
    '',
    5000,
    [
      'sh',
      '-c',
      "nmcli -g in-use,signal dev wifi | grep '^\\*' | cut -d: -f2",
    ],
    amt => {
      const percent = parseInt(amt);
      if (percent < 25) {
        return '󰤯'; // empty
      } else if (percent < 50) {
        return '󰤟'; // 25%
      } else if (percent < 75) {
        return '󰤢'; // 50%
      } else if (percent < 90) {
        return '󰤥'; // 75%
      } else {
        return '󰤨'; // full
      }
    }
  );

  const wifiLabel = createComputed(() => {
    if (wifi() === 'lo') return '󰤮';
    return wifiIcon();
  });

  let wifiButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        wifiButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="wifi"
      onClicked={toggleWifi}>
      <box>
        <label class="icon" label={wifiLabel} />
        <label label={wifi} />
      </box>
    </button>
  );
}

export function WifiPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="wifiPopup"
      visible={activePopup(a => a == 'wifi')}
      margin={wifiMargin}
      cssClass="wifiOverlay">
      <box
        visible={wifiBlocked}
        class="rfkill"
        orientation={Gtk.Orientation.VERTICAL}>
        <label label=" wifi is blocked in rfkill" />
        <button
          $={self =>
            self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
          }
          class="rfUnblock"
          onClicked={() => execAsync('rfkill unblock wlan')}>
          <label label="unblock" />
        </button>
      </box>
      <centerbox class="title">
        <label $type="start" label="Networks" />
        <button
          $type="end"
          $={self =>
            self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
          }
          onClicked={updateNetworks}>
          <label label="refresh" />
        </button>
      </centerbox>
      <scrolledwindow heightRequest={300} widthRequest={300}>
        <box orientation={Gtk.Orientation.VERTICAL} class="wifiList">
          <For each={wifiList}>
            {(network: string) => (
              <button
                onClicked={() =>
                  execAsync(`nmcli con up "${network}"`)
                }
                $={self =>
                  self.set_cursor(
                    Gdk.Cursor.new_from_name('pointer', null)
                  )
                }>
                <box>
                  <label
                    class="icon"
                    label="󰸞"
                    visible={wifi(v => v === network)}
                  />
                  <label
                    class="icon"
                    label="󱎜"
                    visible={knownNetworks(v => v.includes(network))}
                  />
                  <label halign={Gtk.Align.CENTER} label={network} />
                </box>
              </button>
            )}
          </For>
        </box>
      </scrolledwindow>
    </Popup>
  );
}
