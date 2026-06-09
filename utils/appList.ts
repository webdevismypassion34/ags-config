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
const [appList, setAppList] = createState<App[]>([]);
export default appList;

// readFileAsync(`${home}/.config/ags/icons.json`).then(console.log);
getApps()
  .then(a => {
    // console.log(a);
    setAppList(a as App[]);
  })
  .catch(console.error);

async function getApps() {
  let existingAppIcons: Record<
    string,
    { icon: string | null; name?: string; desktopName?: string }
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

  const desktopNameMap: Record<string, string> = {};
  filtered.forEach(json => {
    if (json.Icon)
      desktopNameMap[json.Icon] = json.file.split('/').pop()!.replace('.desktop', '');
  });

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
    { icon: string | null; name: string; desktopName: string }
  > = {};

  Object.entries(existingAppIcons).forEach(([k, v]) => {
    merged[k] = {
      ...v,
      name: v.name ?? desktopNameMap[k] ?? k,
      desktopName: desktopNameMap[k] ?? k,
    };
  });

  Object.entries(newIcons).forEach(([k, v]) => {
    merged[k] = {
      icon: v,
      name: desktopNameMap[k] ?? k,
      desktopName: desktopNameMap[k] ?? k,
    };
  });

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
