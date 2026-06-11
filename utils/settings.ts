import { readFile } from 'ags/file';
import { createState } from 'ags';
import { home } from '../polls';

type Display = 'icon' | 'label' | 'both';

export type Layout = {
  left: string[];
  center: string[];
  right: string[];
};

type Panel = {
  enabled?: boolean;
  layout?: Layout;
};

export type Config = {
  visualClassOverrides?: Record<string, string>;
  panelStyle?: number;
  popupStyle?: number;
  bar?: Panel;
  dock?: Panel;
  widgets?: {
    apps?: { display?: Display };
    arch?: {
      actions?: {
        about?: string;
        system_settings?: string;
        quit?: string;
        forcequit?: string;
        lock?: string;
        reboot?: string;
        logout?: string;
        shutdown?: string;
      };
    };
    battery?: { display?: Display; percent?: boolean };
    bluetooth?: { display?: Display };
    brightness?: { display?: Display; percent?: boolean };
    clock?: {
      hour12?: boolean;
      showDate?: boolean;
      stacked?: boolean;
    };
    keyboard?: {
      fcitx5?: boolean;
      num_lock?: boolean;
      caps_lock?: boolean;
    };
    notifications?: { display?: Display };
    player?: { altLayout?: boolean };
    volume?: { display?: Display; percent?: boolean };
    weather?: { minimal?: boolean };
    wifi?: { display?: Display };
    workspaces?: {
      icons?: Record<string, string>;
      hideInactive?: boolean;
    };
  };
  appLauncher?: { enabled?: boolean; terminal?: string };
  wallpaper?: { enabled?: boolean; wallpaperDirectory?: string };
  osd?: { enabled?: boolean };
};

const presetLayouts: Record<
  number,
  { left: string[]; center: string[]; right: string[] }
> = {
  1: {
    left: ['arch', 'workspaces', 'player'],
    center: ['clock'],
    right: [
      'weather',
      'wifi',
      'bluetooth',
      'battery',
      'volume',
      'brightness',
      'notifications',
    ],
  },
  2: {
    left: ['arch', 'workspaces'],
    center: ['brightness', 'clock', 'volume'],
    right: ['wifi', 'bluetooth', 'battery', 'notifications'],
  },
  3: {
    left: ['weather', 'player'],
    center: ['workspaces'],
    right: ['clock', 'volume', 'wifi', 'battery'],
  },
  4: {
    left: ['weather'],
    center: ['workspaces'],
    right: ['bluetooth', 'wifi', 'volume', 'battery', 'clock'],
  },
};

const defaults: Config = {
  visualClassOverrides: {
    'com.obsproject.Studio': 'OBS',
    'code-oss': 'VS Code',
    'kbd-layout-viewer': 'Keyboard',
    'org.kde.kdeconnect.app': 'KDE Connect',
  },
  panelStyle: 1,
  popupStyle: 1,
  bar: { enabled: true, layout: presetLayouts[1] },
  dock: { enabled: false, layout: presetLayouts[1] },
  widgets: {
    apps: { display: 'both' },
    arch: {
      actions: {
        about: 'kitty --hold fastfetch',
        system_settings: "notify-send 'nothing here for now'",
        quit: 'pkill -15 -p %P',
        forcequit: 'pkill -9 -p %P',
        lock: '%H/.local/share/quickshell-lockscreen/lock.sh',
        reboot: 'reboot',
        logout: 'uwsm stop',
        shutdown: 'shutdown',
      },
    },
    battery: { display: 'both', percent: false },
    bluetooth: { display: 'both' },
    brightness: { display: 'both', percent: false },
    clock: { hour12: false, showDate: true, stacked: false },
    keyboard: { fcitx5: true, num_lock: false, caps_lock: false },
    notifications: { display: 'both' },
    player: { altLayout: true },
    volume: { display: 'both', percent: false },
    weather: { minimal: false },
    wifi: { display: 'both' },
    workspaces: {
      icons: {
        '1': '',
        '2': '',
        '3': '󰈹',
        '4': '',
        '6': '󰍳',
      },
      hideInactive: false,
    },
  },
  appLauncher: { enabled: true, terminal: 'kitty' },
  wallpaper: { enabled: true, wallpaperDirectory: '%H/wallpaper' },
  osd: { enabled: true },
};

const [settings, setSettings] = createState<Config>(defaults);
export default settings;

const b = (v: unknown, d: boolean) =>
  typeof v === 'boolean' ? v : d;
const s = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const n = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
const resolveLayout = (
  layoutNum: unknown,
  customLayout: unknown
): Layout => {
  const num = typeof layoutNum === 'number' ? layoutNum : 1;
  if (num === 0) {
    const cl = (customLayout ?? {}) as Record<string, unknown>;
    return {
      left: strArr(cl.left, []),
      center: strArr(cl.center, []),
      right: strArr(cl.right, []),
    };
  }
  return presetLayouts[num] ?? presetLayouts[1];
};
const disp = (v: unknown, d: Display): Display =>
  v === 'icon' || v === 'label' || v === 'both' ? v : d;
const strRecord = (v: unknown, d: Record<string, string>) => {
  if (typeof v !== 'object' || v === null || Array.isArray(v))
    return d;
  return Object.fromEntries(
    Object.entries(v).filter(
      (e): e is [string, string] => typeof e[1] === 'string'
    )
  );
};
const strArr = (v: unknown, d: string[]) =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string')
    : d;

function applySettings(raw: unknown) {
  const j = (raw ?? {}) as Record<string, unknown>;
  const dw = defaults.widgets!;
  const bar = (j.bar ?? {}) as Record<string, unknown>;
  const dock = (j.dock ?? {}) as Record<string, unknown>;
  const w = (j.widgets ?? {}) as Record<string, unknown>;
  const arch = (w.arch ?? {}) as Record<string, unknown>;
  const archAct = (arch.actions ?? {}) as Record<string, unknown>;
  const da = dw.arch!.actions!;
  const ws = (w.workspaces ?? {}) as Record<string, unknown>;
  const al = (j.appLauncher ?? {}) as Record<string, unknown>;
  const wp = (j.wallpaper ?? {}) as Record<string, unknown>;
  const osd = (j.osd ?? {}) as Record<string, unknown>;
  const clock = (w.clock ?? {}) as Record<string, unknown>;
  const kb = (w.keyboard ?? {}) as Record<string, unknown>;

  setSettings({
    visualClassOverrides: strRecord(
      j.visualClassOverrides,
      defaults.visualClassOverrides!
    ),
    panelStyle: n(j.panelStyle, defaults.panelStyle!),
    popupStyle: n(j.popupStyle, defaults.popupStyle!),
    bar: {
      enabled: b(bar.enabled, defaults.bar!.enabled!),
      layout: resolveLayout(bar.layout, bar.custom_layout),
    },
    dock: {
      enabled: b(dock.enabled, defaults.dock!.enabled!),
      layout: resolveLayout(dock.layout, dock.custom_layout),
    },
    widgets: {
      apps: {
        display: disp((w.apps as any)?.display, dw.apps!.display!),
      },
      arch: {
        actions: {
          about: s(archAct.about, da.about!),
          system_settings: s(
            archAct.system_settings,
            da.system_settings!
          ),
          quit: s(archAct.quit, da.quit!),
          forcequit: s(archAct.forcequit, da.forcequit!),
          lock: s(archAct.lock, da.lock!),
          reboot: s(archAct.reboot, da.reboot!),
          logout: s(archAct.logout, da.logout!),
          shutdown: s(archAct.shutdown, da.shutdown!),
        },
      },
      battery: {
        display: disp(
          (w.battery as any)?.display,
          dw.battery!.display!
        ),
        percent: b((w.battery as any)?.percent, dw.battery!.percent!),
      },
      bluetooth: {
        display: disp(
          (w.bluetooth as any)?.display,
          dw.bluetooth!.display!
        ),
      },
      brightness: {
        display: disp(
          (w.brightness as any)?.display,
          dw.brightness!.display!
        ),
        percent: b(
          (w.brightness as any)?.percent,
          dw.brightness!.percent!
        ),
      },
      clock: {
        hour12: b(clock.hour12, dw.clock!.hour12!),
        showDate: b(clock.showDate, dw.clock!.showDate!),
        stacked: b(clock.stacked, dw.clock!.stacked!),
      },
      keyboard: {
        fcitx5: b(kb.fcitx5, dw.keyboard!.fcitx5!),
        num_lock: b(kb.num_lock, dw.keyboard!.num_lock!),
        caps_lock: b(kb.caps_lock, dw.keyboard!.caps_lock!),
      },
      notifications: {
        display: disp(
          (w.notifications as any)?.display,
          dw.notifications!.display!
        ),
      },
      player: {
        altLayout: b(
          (w.player as any)?.altLayout,
          dw.player!.altLayout!
        ),
      },
      volume: {
        display: disp(
          (w.volume as any)?.display,
          dw.volume!.display!
        ),
        percent: b((w.volume as any)?.percent, dw.volume!.percent!),
      },
      weather: {
        minimal: b((w.weather as any)?.minimal, dw.weather!.minimal!),
      },
      wifi: {
        display: disp((w.wifi as any)?.display, dw.wifi!.display!),
      },
      workspaces: {
        icons: strRecord(ws.icons, dw.workspaces!.icons!),
        hideInactive: b(
          ws.hideInactive,
          dw.workspaces!.hideInactive!
        ),
      },
    },
    appLauncher: {
      enabled: b(al.enabled, defaults.appLauncher!.enabled!),
      terminal: s(al.terminal, defaults.appLauncher!.terminal!),
    },
    wallpaper: {
      enabled: b(wp.enabled, defaults.wallpaper!.enabled!),
      wallpaperDirectory: s(
        wp.wallpaperDirectory,
        defaults.wallpaper!.wallpaperDirectory!
      ),
    },
    osd: {
      enabled: b(osd.enabled, defaults.osd!.enabled!),
    },
  });
}

const configPath = `${home}/.config/ags/config.jsonc`;

try {
  applySettings(
    JSON.parse(readFile(configPath).replace(/\/\/[^\n]*/g, ''))
  );
} catch {
  console.log('no config file found, using defaults');
  applySettings(defaults);
}
