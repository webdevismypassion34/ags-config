import { createPoll } from 'ags/time';
import { execAsync } from 'ags/process';
import GLib from 'gi://GLib?version=2.0';
export const home = GLib.get_home_dir();

let lastBatteryNotif = 0;

export const title = createPoll(
  '',
  1000,
  'playerctl metadata xesam:title -p spotify'
);

export const artist = createPoll(
  '',
  1000,
  'playerctl metadata xesam:artist -p spotify'
);

export const album = createPoll(
  '',
  1000,
  'playerctl metadata xesam:album -p spotify'
);

export const coverArt = createPoll(
  '',
  1000,
  'playerctl metadata mpris:artUrl -p spotify',
  out => {
    const name = out.split('/').pop();
    if (!name && title())
      return `${home}/.config/ags/spotify/local.png`;
    if (!out || !name) return '';

    execAsync(
      `test -f "${home}/.config/ags/spotify/${name}.jpg"`
    ).catch(() =>
      execAsync(
        `wget -q "${out}" -O "${home}/.config/ags/spotify/${name}.jpg"`
      ).catch(console.error)
    );

    return `${home}/.config/ags/spotify/${name}.jpg`;
  }
);

export const isPlaying = createPoll(false, 200, () =>
  execAsync('playerctl status -p spotify')
    .then(s => s.trim() === 'Playing')
    .catch(() => false)
);

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

export const volume = createPoll(
  '',
  200,
  'wpctl get-volume @DEFAULT_SINK@',
  out => {
    return Math.floor(
      parseFloat(out.replace('Volume: ', '')) * 100
    ).toString();
  }
);

export const volumeMuted = createPoll(
  false,
  200,
  'wpctl get-volume @DEFAULT_SINK@',
  out => out.includes('[MUTED]')
);

export const input = createPoll(
  '',
  200,
  'wpctl get-volume @DEFAULT_SOURCE@',
  out => {
    return Math.floor(
      parseFloat(out.replace('Volume: ', '')) * 100
    ).toString();
  }
);

export const inputMuted = createPoll(
  false,
  200,
  'wpctl get-volume @DEFAULT_SOURCE@',
  out => out.includes('[MUTED]')
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

export const batteryPercent = createPoll(
  '',
  10000,
  'cat /sys/class/power_supply/BAT0/capacity',
  out => {
    if (
      parseInt(out) == 20 &&
      Date.now() - lastBatteryNotif > 300000
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

export const notifCount = createPoll(
  '',
  5000,
  'swaync-client -c',
  out => out.replace('%', '')
);

export const activeWindow = createPoll({}, 500, () =>
  execAsync(['hyprctl', 'activewindow', '-j'])
    .then((out: string) => JSON.parse(out))
    .catch(console.error)
);

export const openWindows = createPoll(
  [],
  500,
  'hyprctl clients -j',
  c => {
    try {
      return JSON.parse(c);
    } catch {
      return [];
    }
  }
);
