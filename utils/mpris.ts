import { createState } from 'ags';
import AstalMpris from 'gi://AstalMpris?version=0.1';
import { execAsync } from 'ags/process';
import { home } from '../polls';

const [title, setTitle] = createState('');
const [artist, setArtist] = createState('');
const [coverArt, setCoverArt] = createState('');
const [isPlaying, setIsPlaying] = createState(false);

export { title, artist, coverArt, isPlaying };

function syncFromPlayer(player: AstalMpris.Player) {
  setTitle(player.title ?? '');
  setArtist(player.artist ?? '');
  setIsPlaying(
    player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING
  );

  const artUrl = player.artUrl ?? '';
  const name = artUrl.split('/').pop();

  if (!name && player.title) {
    setCoverArt(`${home}/.config/ags/spotify/local.png`);
    return;
  }
  if (!name) {
    setCoverArt('');
    return;
  }

  execAsync(`test -f "${home}/.config/ags/spotify/${name}.jpg"`).catch(
    () =>
      execAsync(
        `wget -q "${artUrl}" -O "${home}/.config/ags/spotify/${name}.jpg"`
      ).catch(console.error)
  );
  setCoverArt(`${home}/.config/ags/spotify/${name}.jpg`);
}

function clear() {
  setTitle('');
  setArtist('');
  setCoverArt('');
  setIsPlaying(false);
}

function findSpotify(mpris: AstalMpris.Mpris) {
  return mpris.get_players().find(p => p.entry === 'spotify');
}

export function next() {
  findSpotify(AstalMpris.Mpris.get_default())?.next();
}

export function previous() {
  findSpotify(AstalMpris.Mpris.get_default())?.previous();
}

export function startMprisDaemon() {
  const mpris = AstalMpris.Mpris.get_default();

  function watch(player: AstalMpris.Player) {
    syncFromPlayer(player);
    player.connect('notify::title', () => syncFromPlayer(player));
    player.connect('notify::artist', () => syncFromPlayer(player));
    player.connect('notify::art-url', () => syncFromPlayer(player));
    player.connect('notify::playback-status', () =>
      syncFromPlayer(player)
    );
  }

  const existing = findSpotify(mpris);
  if (existing) watch(existing);

  mpris.connect('player-added', (_, player) => {
    if (player.entry === 'spotify') watch(player);
  });

  mpris.connect('player-closed', (_, player) => {
    if (player.entry === 'spotify') clear();
  });
}
