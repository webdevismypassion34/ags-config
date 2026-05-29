import { execAsync } from 'ags/process';
import { createState } from 'ags';
import { home } from '../polls';
import { readFileAsync, writeFileAsync } from 'ags/file';

export type App = [
  file: string,
  name: string,
  comment: string | null,
  icon: string | null,
  exec: string,
  terminal: boolean,
];
const [appList, setAppList] = createState<App[]>([
  [
    "/home/alexmn/.local/share/applications/Tom Clancy's Rainbow Six Siege.desktop",
    "Tom Clancy's Rainbow Six Siege",
    'Play this game on Steam',
    '/home/alexmn/.local/share/icons/hicolor/256x256/apps/steam_icon_359550.png',
    'steam steam://rungameid/359550',
    false,
  ],
  [
    '/home/alexmn/.local/share/applications/Geometry Dash.desktop',
    'Geometry Dash',
    'Play this game on Steam',
    '/home/alexmn/.local/share/icons/hicolor/256x256/apps/steam_icon_322170.png',
    'steam steam://rungameid/322170',
    false,
  ],
  [
    '/home/alexmn/.local/share/applications/STRAFTAT.desktop',
    'STRAFTAT',
    'Play this game on Steam',
    '/home/alexmn/.local/share/icons/hicolor/48x48/apps/steam_icon_2386720.png',
    'steam steam://rungameid/2386720',
    false,
  ],
  [
    '/home/alexmn/.local/share/applications/Bloons TD 6.desktop',
    'Bloons TD 6',
    'Play this game on Steam',
    '/home/alexmn/.local/share/icons/hicolor/256x256/apps/steam_icon_960090.png',
    'steam steam://rungameid/960090',
    false,
  ],
  [
    '/usr/share/applications/firefox.desktop',
    'Firefox',
    'Fast and private browser',
    '/usr/share/icons/hicolor/scalable/apps/firefox.svg',
    '/usr/lib/firefox/firefox %u',
    false,
  ],
  [
    '/usr/share/applications/mpv.desktop',
    'mpv Media Player',
    'Play movies and songs',
    '/usr/share/icons/hicolor/scalable/apps/mpv.svg',
    'mpv --player-operation-mode',
    false,
  ],
  [
    '/usr/share/applications/xfce4-about.desktop',
    'About Xfce',
    'Information about the Xfce Desktop Environment',
    '/usr/share/icons/hicolor/scalable/apps/org.xfce.about.svg',
    'xfce4-about',
    false,
  ],
  [
    '/usr/share/applications/blueman-manager.desktop',
    'Bluetooth Manager',
    'Blueman Bluetooth Manager',
    '/usr/share/icons/hicolor/scalable/apps/blueman.svg',
    'blueman-manager',
    false,
  ],
  [
    '/usr/share/applications/yazi.desktop',
    'Yazi File Manager',
    'Blazing fast terminal file manager written in Rust, based on async I/O',
    '/usr/share/icons/hicolor/512x512/apps/yazi.png',
    'yazi %f',
    true,
  ],
  [
    '/usr/share/applications/org.pulseaudio.pavucontrol.desktop',
    'Volume Control',
    'Adjust the volume level',
    '/usr/share/icons/hicolor/scalable/apps/org.pulseaudio.pavucontrol.svg',
    'pavucontrol',
    false,
  ],
  [
    '/usr/share/applications/org.kde.kdeconnect.sms.desktop',
    'KDE Connect SMS',
    'Read and send SMS messages on connected devices',
    '/usr/share/icons/hicolor/scalable/apps/kdeconnect.svg',
    'kdeconnect-sms',
    false,
  ],
  [
    '/usr/share/applications/nm-connection-editor.desktop',
    'Advanced Network Configuration',
    'Manage and change your network connection settings',
    '/usr/share/icons/AdwaitaLegacy/16x16/legacy/preferences-system-network.png',
    'nm-connection-editor',
    false,
  ],
  [
    '/usr/share/applications/spotify.desktop',
    'Spotify',
    null,
    '/usr/share/pixmaps/spotify-client.png',
    'spotify --uri',
    false,
  ],
  [
    '/usr/share/applications/system-config-printer.desktop',
    'Print Settings',
    'Configure printers',
    '/usr/share/icons/Tokyonight-Dark/apps/64/printer.svg',
    'system-config-printer',
    false,
  ],
  [
    '/usr/share/applications/org.kde.kdeconnect.nonplasma.desktop',
    'KDE Connect Indicator',
    'Display information about your devices',
    '/usr/share/icons/hicolor/scalable/apps/kdeconnect.svg',
    'kdeconnect-indicator',
    false,
  ],
  [
    '/usr/share/applications/xgps.desktop',
    'xgps',
    'Display GPS information from a gpsd daemon',
    '/usr/share/gpsd/icons/gpsd-logo.png',
    'xgps',
    false,
  ],
  [
    '/usr/share/applications/cmake-gui.desktop',
    'CMake',
    'Cross-platform buildsystem',
    '/usr/share/icons/hicolor/128x128/apps/CMakeSetup.png',
    'cmake-gui %f',
    false,
  ],
  [
    '/usr/share/applications/org.kde.dolphin.desktop',
    'Dolphin',
    'Manage your files',
    '/usr/share/icons/hicolor/scalable/apps/org.kde.dolphin.svg',
    'dolphin %u',
    false,
  ],
  [
    '/usr/share/applications/rofi.desktop',
    'Rofi',
    null,
    '/usr/share/icons/hicolor/scalable/apps/rofi.svg',
    'rofi -show',
    false,
  ],
  [
    '/usr/share/applications/rofi-theme-selector.desktop',
    'Rofi Theme Selector',
    null,
    '/usr/share/icons/hicolor/scalable/apps/rofi.svg',
    'rofi-theme-selector',
    false,
  ],
  [
    '/usr/share/applications/librewolf.desktop',
    'LibreWolf',
    'Browse the World Wide Web',
    '/usr/share/icons/hicolor/192x192/apps/librewolf.png',
    '/usr/lib/librewolf/librewolf %u',
    false,
  ],
  [
    '/usr/share/applications/bvnc.desktop',
    'Avahi VNC Server Browser',
    'Browse for Zeroconf-enabled VNC Servers',
    '/usr/share/icons/breeze-dark/status/24/network-wired.svg',
    '/usr/bin/bvnc',
    false,
  ],
  [
    '/usr/share/applications/jshell-java-openjdk.desktop',
    'OpenJDK Java 26 Shell',
    'OpenJDK Java 26 Shell',
    '/usr/share/icons/hicolor/48x48/apps/java26-openjdk.png',
    '/usr/lib/jvm/java-26-openjdk/bin/jshell',
    true,
  ],
  [
    '/usr/share/applications/kbd-layout-viewer5.desktop',
    'Keyboard layout viewer',
    'View keyboard layout',
    '/usr/share/icons/Adwaita/scalable/devices/input-keyboard.svg',
    'kbd-layout-viewer5',
    false,
  ],
  [
    '/usr/share/applications/htop.desktop',
    'Htop',
    'Show System Processes',
    '/usr/share/icons/hicolor/scalable/apps/htop.svg',
    'htop',
    true,
  ],
  [
    '/usr/share/applications/code-oss.desktop',
    'Code - OSS',
    'Code Editing. Redefined.',
    '/usr/share/pixmaps/com.visualstudio.code.oss.png',
    'code-oss %F',
    false,
  ],
  [
    '/usr/share/applications/thunar-settings.desktop',
    'Thunar Preferences',
    'Configure the Thunar file manager',
    '/usr/share/icons/hicolor/scalable/apps/org.xfce.thunar.svg',
    'thunar-settings',
    false,
  ],
  [
    '/usr/share/applications/obsidian.desktop',
    'Obsidian',
    'Obsidian',
    '/usr/share/pixmaps/obsidian.png',
    '/usr/bin/obsidian %U',
    false,
  ],
  [
    '/usr/share/applications/uuctl.desktop',
    'uuctl',
    'Select and perform actions on user systemd units',
    '/usr/share/icons/AdwaitaLegacy/16x16/legacy/applications-system.png',
    'uuctl',
    false,
  ],
  [
    '/usr/share/applications/kitty.desktop',
    'kitty',
    'Fast, feature-rich, GPU based terminal',
    '/usr/share/icons/hicolor/scalable/apps/kitty.svg',
    'kitty',
    false,
  ],
  [
    '/usr/share/applications/nvim.desktop',
    'Neovim',
    'Edit text files',
    '/usr/share/icons/hicolor/128x128/apps/nvim.png',
    'nvim %F',
    true,
  ],
  [
    '/usr/share/applications/steam.desktop',
    'Steam',
    'Application for managing and playing games on Steam',
    '/usr/share/icons/hicolor/256x256/apps/steam.png',
    '/usr/bin/steam %U',
    false,
  ],
  [
    '/usr/share/applications/lunarclient.desktop',
    'Lunar Client',
    'Electron launcher for Lunar Client',
    '/usr/share/icons/hicolor/1024x1024/apps/lunarclient.png',
    'env DESKTOPINTEGRATION',
    false,
  ],
  [
    '/usr/share/applications/nwg-look.desktop',
    'GTK Settings',
    'Customizes GTK3 look and feel settings',
    '/usr/share/pixmaps/nwg-look.svg',
    'nwg-look',
    false,
  ],
  [
    '/usr/share/applications/avahi-discover.desktop',
    'Avahi Zeroconf Browser',
    'Browse for Zeroconf services available on your network',
    '/usr/share/icons/breeze-dark/status/24/network-wired.svg',
    '/usr/bin/avahi-discover',
    false,
  ],
  [
    '/usr/share/applications/xgpsspeed.desktop',
    'xgpsspeed',
    'Display GPS speed from a gpsd daemon',
    '/usr/share/gpsd/icons/gpsd-logo.png',
    'xgpsspeed',
    false,
  ],
  [
    '/usr/share/applications/org.fcitx.Fcitx5.desktop',
    'Fcitx 5',
    'Start Input Method',
    '/usr/share/icons/breeze-dark/status/24/fcitx.svg',
    '/usr/bin/fcitx5',
    false,
  ],
  [
    '/usr/share/applications/thunar.desktop',
    'Thunar File Manager',
    'Browse the filesystem with the file manager',
    '/usr/share/icons/hicolor/scalable/apps/org.xfce.thunar.svg',
    'thunar %U',
    false,
  ],
  [
    '/usr/share/applications/chromium.desktop',
    'Chromium',
    'Access the Internet',
    '/usr/share/icons/hicolor/256x256/apps/chromium.png',
    '/usr/bin/chromium %U',
    false,
  ],
  [
    '/usr/share/applications/vencordinstaller.desktop',
    'VencordInstaller',
    'A cross platform gui/cli app for installing Vencord',
    '/usr/share/icons/hicolor/96x96/apps/vencordinstaller.png',
    'vencordinstaller',
    false,
  ],
  [
    '/usr/share/applications/btop.desktop',
    'btop++',
    'Resource monitor that shows usage and stats for processor, memory, disks, network and processes',
    '/usr/share/icons/hicolor/scalable/apps/btop.svg',
    'btop',
    true,
  ],
  [
    '/usr/share/applications/fcitx5-configtool.desktop',
    'Fcitx 5 Configuration',
    'Change Fcitx 5 Configuration',
    '/usr/share/icons/breeze-dark/status/24/fcitx.svg',
    '/usr/bin/fcitx5-configtool',
    false,
  ],
  [
    '/usr/share/applications/org.qbittorrent.qBittorrent.desktop',
    'qBittorrent',
    'Download and share files over BitTorrent',
    '/usr/share/icons/hicolor/scalable/apps/qbittorrent.svg',
    'qbittorrent %U',
    false,
  ],
  [
    '/usr/share/applications/modrinth-app.desktop',
    'Modrinth App',
    null,
    '/usr/share/icons/hicolor/256x256@2/apps/modrinth-app.png',
    'modrinth-app %u',
    false,
  ],
  [
    '/usr/share/applications/com.github.hluk.copyq.desktop',
    'CopyQ',
    'A cut & paste history utility',
    '/usr/share/icons/hicolor/scalable/apps/copyq.svg',
    'copyq --start-server show',
    false,
  ],
  [
    '/usr/share/applications/com.obsproject.Studio.desktop',
    'OBS Studio',
    'Free and Open Source Streaming/Recording Software',
    '/usr/share/icons/hicolor/scalable/apps/com.obsproject.Studio.svg',
    'obs',
    false,
  ],
  [
    '/usr/share/applications/jconsole-java-openjdk.desktop',
    'OpenJDK Java 26 Console',
    'OpenJDK Java 26 Monitoring & Management Console',
    '/usr/share/icons/hicolor/48x48/apps/java26-openjdk.png',
    '/usr/lib/jvm/java-26-openjdk/bin/jconsole',
    false,
  ],
  [
    '/usr/share/applications/localsend.desktop',
    'LocalSend',
    'An open source cross-platform alternative to AirDrop',
    '/usr/share/pixmaps/localsend.png',
    'localsend',
    false,
  ],
  [
    '/usr/share/applications/kvantummanager.desktop',
    'Kvantum Manager',
    'A simple GUI for installing, selecting and manipulating Kvantum themes',
    '/usr/share/icons/hicolor/scalable/apps/kvantum.svg',
    'kvantummanager',
    false,
  ],
  [
    '/usr/share/applications/org.fcitx.fcitx5-migrator.desktop',
    'Fcitx 5 Migration Wizard',
    'Import data from other input method such as Fcitx 4',
    '/usr/share/icons/breeze-dark/status/24/fcitx.svg',
    'fcitx5-migrator',
    false,
  ],
  [
    '/usr/share/applications/qt6ct.desktop',
    'Qt6 Settings',
    'Qt6 Configuration Tool',
    '/usr/share/icons/Tokyonight-Dark/apps/64/preferences-desktop-theme.svg',
    'qt6ct',
    false,
  ],
  [
    '/usr/share/applications/qv4l2.desktop',
    'Qt V4L2 test Utility',
    'Allow testing Video4Linux devices',
    '/usr/share/icons/hicolor/scalable/apps/qv4l2.svg',
    'qv4l2',
    false,
  ],
  [
    '/usr/share/applications/vesktop.desktop',
    'Vesktop',
    'Vesktop is a custom Discord App aiming to give you better performance and improve linux support. Vencord comes pre-installed',
    '/usr/share/icons/hicolor/scalable/apps/vesktop.svg',
    '/usr/bin/vesktop %U',
    false,
  ],
  [
    '/usr/share/applications/ncspot.desktop',
    'ncspot',
    'Cross-platform ncurses Spotify client written in Rust',
    '/usr/share/icons/hicolor/scalable/apps/ncspot.svg',
    'ncspot',
    true,
  ],
  [
    '/usr/share/applications/bssh.desktop',
    'Avahi SSH Server Browser',
    'Browse for Zeroconf-enabled SSH Servers',
    '/usr/share/icons/breeze-dark/status/24/network-wired.svg',
    '/usr/bin/bssh',
    false,
  ],
  [
    '/usr/share/applications/thunar-volman-settings.desktop',
    'Removable Drives and Media',
    'Configure management of removable drives and media',
    '/usr/share/icons/hicolor/scalable/apps/org.xfce.volman.svg',
    'thunar-volman-settings',
    false,
  ],
  [
    '/usr/share/applications/qvidcap.desktop',
    'Qt V4L2 video capture utility',
    'Viewer for video capture',
    '/usr/share/icons/hicolor/scalable/apps/qvidcap.svg',
    'qvidcap',
    false,
  ],
  [
    '/usr/share/applications/org.kde.kdeconnect.app.desktop',
    'KDE Connect',
    'Make all your devices one',
    '/usr/share/icons/hicolor/scalable/apps/kdeconnect.svg',
    'kdeconnect-app',
    false,
  ],
  [
    '/usr/share/applications/cups.desktop',
    'Manage Printing',
    'CUPS Web Interface',
    '/usr/share/icons/hicolor/128x128/apps/cups.png',
    'xdg-open http://localhost:631/',
    false,
  ],
  [
    '/usr/share/applications/org.gnome.eog.desktop',
    'Eye of GNOME',
    'Browse and rotate images',
    '/usr/share/icons/hicolor/scalable/apps/org.gnome.eog.Devel.svg',
    'eog %U',
    false,
  ],
  [
    '/usr/share/applications/thunar-bulk-rename.desktop',
    'Bulk Rename',
    'Rename Multiple Files',
    '/usr/share/icons/hicolor/scalable/apps/org.xfce.thunar.svg',
    'thunar --bulk-rename %F',
    false,
  ],
]);
export default appList;

// readFileAsync(`${home}/.config/ags/icons.json`).then(console.log);
getApps()
  .then(a => {
    console.log(a);
    setAppList(a as App[]);
  })
  .catch(console.error);

async function getApps() {
  let existingAppIcons: Record<
    string,
    { class: string; icon: string | null }
  > = JSON.parse(
    await readFileAsync(`${home}/.config/ags/icons.json`).catch(
      () => '{}'
    )
  );
  const applicationDirectories = [
    '/home/alexmn/.local/share/applications',
    '/usr/share/applications',
  ];
  const desktopFiles = await execAsync([
    'find',
    ...applicationDirectories,
    '-name',
    '*.desktop',
    '-type',
    'f',
  ]).catch(e => {
    console.error('find failed:', e);
    return '';
  });
  const fileContents = await Promise.all(
    desktopFiles.split('\n').map(async file => {
      const contents = await readFileAsync(file);
      const lines = contents
        .split('\n[')[0]
        .split('\n')
        .filter(line => line.includes('='));

      const json: Record<string, string> = {};

      lines.forEach(line => {
        const split = line.split('=');
        json[split[0]] = split[1];
      });

      if (
        json.Exec?.startsWith('waydroid') ||
        !json.Name ||
        json.NoDisplay
      )
        return;

      json.file = file;
      return json;
    })
  );

  const filtered = fileContents.filter(
    (f): f is Record<string, string> => f !== undefined
  );

  const newIcons: Record<string, string | null> = {};

  const appIcons = await Promise.all(
    filtered.map(async json => {
      const name = json.Icon;
      if (!name) return null;
      if (name.startsWith('/')) return name;
      if (name in existingAppIcons)
        return existingAppIcons[name].icon;
      if (name in newIcons) return newIcons[name];
      // to prioritize higher sizes
      const shareIcons = [
        `${home}/.local/share/icons/hicolor/256x256/`,
        `${home}/.local/share/icons/hicolor/192x192/`,
        `${home}/.local/share/icons/hicolor/128x128/`,
        `${home}/.local/share/icons/hicolor/96x96/`,
        `${home}/.local/share/icons/hicolor/64x64/`,
        `${home}/.local/share/icons/hicolor/48x48/`,
        `${home}/.local/share/icons/hicolor/32x32/`,
        `${home}/.local/share/icons/hicolor/16x16/`,
      ];
      const hicolorIcons = [
        '/usr/share/icons/hicolor/scalable',
        '/usr/share/icons/hicolor/1024x1024',
        '/usr/share/icons/hicolor/512x512@2',
        '/usr/share/icons/hicolor/512x512',
        '/usr/share/icons/hicolor/384x384',
        '/usr/share/icons/hicolor/256x256@2',
        '/usr/share/icons/hicolor/256x256',
        '/usr/share/icons/hicolor/192x192@2',
        '/usr/share/icons/hicolor/192x192',
        '/usr/share/icons/hicolor/128x128@2',
        '/usr/share/icons/hicolor/128x128',
        '/usr/share/icons/hicolor/96x96@2',
        '/usr/share/icons/hicolor/96x96',
        '/usr/share/icons/hicolor/72x72@2',
        '/usr/share/icons/hicolor/72x72',
        '/usr/share/icons/hicolor/64x64@2',
        '/usr/share/icons/hicolor/64x64',
        '/usr/share/icons/hicolor/48x48@2',
        '/usr/share/icons/hicolor/48x48',
        '/usr/share/icons/hicolor/36x36',
        '/usr/share/icons/hicolor/32x32@2',
        '/usr/share/icons/hicolor/32x32',
        '/usr/share/icons/hicolor/24x24@2',
        '/usr/share/icons/hicolor/24x24',
        '/usr/share/icons/hicolor/22x22@2',
        '/usr/share/icons/hicolor/22x22',
        '/usr/share/icons/hicolor/16x16@2',
        '/usr/share/icons/hicolor/16x16',
      ];
      const tokyonightIcons = [
        '/usr/share/icons/Tokyonight-Dark/apps/64@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/64',
        '/usr/share/icons/Tokyonight-Dark/apps/48@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/48',
        '/usr/share/icons/Tokyonight-Dark/apps/32@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/32',
        '/usr/share/icons/Tokyonight-Dark/apps/24@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/24',
        '/usr/share/icons/Tokyonight-Dark/apps/22@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/22',
        '/usr/share/icons/Tokyonight-Dark/apps/16@2x',
        '/usr/share/icons/Tokyonight-Dark/apps/16',
      ];
      const breezeDarkIcons = [
        '/usr/share/icons/breeze-dark/status/64',
        '/usr/share/icons/breeze-dark/status/48',
        '/usr/share/icons/breeze-dark/status/32',
        '/usr/share/icons/breeze-dark/status/24@3x',
        '/usr/share/icons/breeze-dark/status/24@2x',
        '/usr/share/icons/breeze-dark/status/24',
        '/usr/share/icons/breeze-dark/status/22@3x',
        '/usr/share/icons/breeze-dark/status/22@2x',
        '/usr/share/icons/breeze-dark/status/22',
        '/usr/share/icons/breeze-dark/status/16@3x',
        '/usr/share/icons/breeze-dark/status/16@2x',
        '/usr/share/icons/breeze-dark/status/16',
      ];

      const iconDirs = [
        ...hicolorIcons,
        '/usr/share/pixmaps',
        ...shareIcons,
        ...tokyonightIcons,
        ...breezeDarkIcons,
        '/usr/share/icons',
      ];

      const results = await execAsync([
        'fd',
        '--type',
        'f',
        `^${name}\\.`,
        '/usr/share/icons',
        '/usr/share/pixmaps',
        `${home}/.local/share/icons/hicolor`,
      ]).catch(() => '');

      const lines = results.split('\n').filter(Boolean);

      const found =
        iconDirs.flatMap(dir =>
          lines.filter(l => l.startsWith(dir))
        )[0] ?? null;
      newIcons[name] = found;
      return found;
    })
  );

  const merged: Record<
    string,
    { class: string; icon: string | null }
  > = {
    ...existingAppIcons,
    ...Object.fromEntries(
      Object.entries(newIcons).map(([k, v]) => [
        k,
        { class: k, icon: v },
      ])
    ),
  };

  await writeFileAsync(
    `${home}/.config/ags/icons.json`,
    JSON.stringify(merged, null, 2)
  );

  return filtered.map((d, i: number) => [
    d.file,
    d.Name,
    d.Comment,
    appIcons[i],
    d.Exec,
    d.Terminal == 'true',
  ]);
}
