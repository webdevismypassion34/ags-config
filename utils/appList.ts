import { execAsync } from 'ags/process';
import { readFileAsync } from 'ags/file';
import { createState } from 'ags';

export type App = [
  file: string,
  name: string,
  comment: string,
  icon: string | null,
  exec: string,
  terminal: boolean,
];
const [appList, setAppList] = createState<App[]>([]);
export default appList;

getApps().then(a => {
  console.log(a);
  setAppList(a as App[]);
});

async function getApps() {
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
  ]);
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

  const appIcons = await Promise.all(
    filtered.map(async json => {
      const name = json.Icon;
      if (name.startsWith('/')) return name;
      const iconDirs = [
        '/usr/share/icons/hicolor',
        '/home/alexmn/.local/share/icons',
        '/usr/share/pixmaps',
        '/usr/share/icons',
      ];

      const foundIcons = await execAsync([
        'find',
        ...iconDirs,
        '-name',
        `${name}.*`,
        '-type',
        'f',
      ]);
      return foundIcons.split('\n').filter(Boolean)[0] ?? null;
    })
  );

  return filtered.map((d, i: number) => [
    d.file,
    d.Name,
    d.Comment,
    appIcons[i],
    d.Exec,
    d.Terminal == 'True',
  ]);
}
