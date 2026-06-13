import { createPoll } from 'ags/time';
import { execAsync } from 'ags/process';
import { createComputed, createState } from 'ags';
import GLib from 'gi://GLib?version=2.0';
import Gio from 'gi://Gio?version=2.0';
export const home = GLib.get_home_dir();

let lastBatteryNotif = 0;

export const wifi = createPoll(
  '',
  5000,
  'nmcli -g name connection show --active',
  out => out.split('\n')[0]
);

export const wifiBlocked = createPoll(false, 5000, () =>
  execAsync('rfkill list wifi')
    .then(out => out.includes('Soft blocked: yes'))
    .catch(() => false)
);

export const bluetoothBlocked = createPoll(false, 5000, () =>
  execAsync('rfkill list bluetooth')
    .then(out => out.includes('Soft blocked: yes'))
    .catch(() => false)
);

export const brightness = createPoll(
  0,
  1000,
  'brightnessctl -m',
  out => parseInt(out.split(',')[3].split('%')[0])
);

const volumePoll = createPoll(
  '',
  2000,
  'wpctl get-volume @DEFAULT_SINK@'
);

export const volume = createComputed(() =>
  Math.floor(
    parseFloat(volumePoll().replace('Volume: ', '')) * 100
  ).toString()
);
export const volumeMuted = createComputed(
  () => volumePoll().includes('[MUTED]') as boolean
);

const inputPoll = createPoll(
  '',
  2000,
  'wpctl get-volume @DEFAULT_SOURCE@'
);

export const input = createComputed(() =>
  Math.floor(
    parseFloat(inputPoll().replace('Volume: ', '')) * 100
  ).toString()
);
export const inputMuted = createComputed(
  () => inputPoll().includes('[MUTED]') as boolean
);

export const appsUsingMic = createPoll(
  [],
  2000,
  [
    'sh',
    '-c',
    `pactl list source-outputs | awk -v mic=$(pactl list sources short | grep "$(pactl info | sed -n 's/^Default Source: //p')" | cut -f1) '/Source:/{src=$2} /application.process.binary/{bin=$3} /application.process.binary/ && src==mic{print bin}'`,
  ],
  out =>
    out
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(s => s.replace(/"/g, ''))
);

export const bluetoothDevice = createPoll(
  '',
  2500,
  ['sh', '-c', "bluetoothctl info | grep Name | cut -d' ' -f2-"],
  out => (out ? out : 'none')
);

export const inputMethod = createPoll('', 1000, () =>
  execAsync([
    'sh',
    '-c',
    'grep -A 3 "\\[$(fcitx5-remote -n)\\]" ~/.config/fcitx5/conf/cached_layouts',
  ])
    .then(
      out =>
        out.split('=').pop()?.replaceAll('"', '').trim() ?? 'unknown'
    )
    .catch(async () => {
      const method = await execAsync('fcitx5-remote -n');
      return method == 'pinyin' ? '拼' : 'unknown';
    })
);

export const lock = createPoll(
  { caps: false, num: false },
  1000,
  () =>
    execAsync('cat /sys/class/leds/input3::capslock/brightness')
      .then(async out => {
        const num = await execAsync(
          'cat /sys/class/leds/input3::numlock/brightness'
        );
        return { caps: parseInt(out) ?? 0, num: parseInt(num) ?? 0 };
      })
      .then(out => {
        return {
          caps: !!out.caps,
          num: !!out.num,
        };
      })
      .catch(out => {
        console.error(out);
        return { caps: false, num: false };
      })
);

export const bluetoothPercent = createPoll(
  '',
  10000,
  'bluetoothctl info',
  (out: string) => {
    const regex = /Battery Percentage:\s*0x[0-9a-fA-F]+\s*\((\d+)\)/;
    return (out.match(regex) ?? ['', ''])[1];
  }
);

export const batteryStatus = createPoll(
  '',
  5000,
  ['upower', '-b'],
  out =>
    JSON.stringify(
      Object.fromEntries(
        out
          .split('History')[0]
          .split('\n')
          .filter(x => x.split(':')[1])
          .map(l => [l.split(':')[0].trim(), l.split(':')[1].trim()])
      ),
      null,
      2
    )
);

export const batteryPercent = createPoll(
  '',
  10000,
  'cat /sys/class/power_supply/BAT0/capacity',
  out => {
    if (
      parseInt(out) == 20 &&
      Date.now() - lastBatteryNotif > 300000 &&
      JSON.parse(batteryStatus()).state == 'discharging'
    ) {
      lastBatteryNotif = Date.now();
      execAsync([
        'notify-send',
        '-u',
        'critical',
        'Low Battery',
        '20% remaining',
      ]);
    }
    return out;
  }
);

export const [activeWindow, setActiveWindow] = createState<
  Record<string, any>
>({});
export const [openWindows, setOpenWindows] = createState<any[]>([]);
export const [workspaces, setWorkspaces] = createState<any[]>([]);
export const [activeWorkspace, setActiveWorkspace] = createState<any>(
  { id: 0 }
);

const refreshActiveWindow = () =>
  execAsync(['hyprctl', 'activewindow', '-j'])
    .then(out => setActiveWindow(JSON.parse(out)))
    .catch(() => {});

const refreshOpenWindows = () =>
  execAsync(['hyprctl', 'clients', '-j'])
    .then(out => setOpenWindows(JSON.parse(out)))
    .catch(() => {});

const refreshWorkspaces = () =>
  execAsync(['hyprctl', 'workspaces', '-j'])
    .then(out =>
      setWorkspaces(
        JSON.parse(out)
          .filter((ws: any) => ws.id > 0)
          .sort((a: any, b: any) => a.id - b.id)
      )
    )
    .catch(() => {});

const refreshActiveWorkspace = () =>
  execAsync(['hyprctl', 'activeworkspace', '-j'])
    .then(out => setActiveWorkspace(JSON.parse(out)))
    .catch(() => {});

refreshActiveWindow();
refreshOpenWindows();
refreshWorkspaces();
refreshActiveWorkspace();

const his = GLib.getenv('HYPRLAND_INSTANCE_SIGNATURE');
const socketPath = `${GLib.getenv('XDG_RUNTIME_DIR')}/hypr/${his}/.socket2.sock`;
const conn = new Gio.SocketClient().connect(
  Gio.UnixSocketAddress.new(socketPath),
  null
);
const stream = new Gio.DataInputStream({
  base_stream: conn.get_input_stream(),
});

function readLine() {
  stream.read_line_async(
    GLib.PRIORITY_DEFAULT,
    null,
    (_: any, result: any) => {
      const [line] = stream.read_line_finish_utf8(result);
      if (line) {
        const event = line.split('>>')[0];
        if (event === 'activewindow' || event === 'activewindowv2')
          refreshActiveWindow();
        if (
          ['openwindow', 'closewindow', 'movewindow'].includes(event)
        )
          refreshOpenWindows();
        if (
          [
            'createworkspace',
            'destroyworkspace',
            'renameworkspace',
            'moveworkspace',
          ].includes(event)
        )
          refreshWorkspaces();
        if (event === 'workspacev2' || event === 'focusedmon')
          refreshActiveWorkspace();
      }
      readLine();
    }
  );
}

readLine();
