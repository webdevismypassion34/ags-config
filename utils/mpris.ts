import { createState } from 'ags';
import { execAsync, subprocess } from 'ags/process';
import { home } from '../polls';

const [title, setTitle] = createState('');
const [artist, setArtist] = createState('');
const [coverArt, setCoverArt] = createState('');
const [isPlaying, setIsPlaying] = createState(false);

export { title, artist, coverArt, isPlaying };

const seperator = '\x1f';

function syncCoverArt(artUrl: string, hasTitle: boolean) {
  const name = artUrl.split('/').pop();

  if (!name && hasTitle) {
    setCoverArt(`${home}/.config/ags/spotify/local.png`);
    return;
  }
  if (!name) {
    setCoverArt('');
    return;
  }

  execAsync(
    `test -f "${home}/.config/ags/spotify/${name}.jpg"`
  ).catch(() =>
    execAsync(
      `wget -q "${artUrl}" -O "${home}/.config/ags/spotify/${name}.jpg"`
    ).catch(console.error)
  );
  setCoverArt(`${home}/.config/ags/spotify/${name}.jpg`);
}

export function startMprisDaemon() {
  subprocess(
    [
      'playerctl',
      '--follow',
      'metadata',
      '-p',
      'spotify',
      '--format',
      `{{title}}${seperator}{{artist}}${seperator}{{mpris:artUrl}}`,
    ],
    line => {
      const [t = '', a = '', artUrl = ''] = line.split(seperator);
      setTitle(t);
      setArtist(a);
      syncCoverArt(artUrl, !!t);
    },
    () => {}
  );

  subprocess(
    ['playerctl', '--follow', 'status', '-p', 'spotify'],
    line => setIsPlaying(line.trim() === 'Playing'),
    () => {}
  );
}
