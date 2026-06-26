import { For, createState } from 'ags';
import { execAsync } from 'ags/process';
import { Gdk, Gtk } from 'ags/gtk4';
import {
  title,
  artist,
  coverArt,
  isPlaying,
} from '../utils/mpris.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';
import { spotifyAccessToken } from '../utils/spotifyAuth.ts';
import Gio from 'gi://Gio';
import { home } from '../polls.ts';

type Song = [title: string, artist: string, art: string];

const [playerMargin, setPlayerMargin] = createState(0);
const [queue, setQueue] = createState<Song[]>([]);

let history: Song[] = [];

export function onSkip() {
  history = [queue()[0], ...history.slice(9)]; // Keep 10 history
  setQueue(queue().slice(1));
  setTimeout(getQueue, 100);
}

export function onPrevious() {
  if (history.length > 0) setQueue([history[0], ...queue()]);
  setTimeout(getQueue, 100);
}

let queueRequest = 0;

async function getQueue() {
  const thisRequest = ++queueRequest;

  let data;
  try {
    const res = await execAsync([
      'curl',
      '--request',
      'GET',
      '--url',
      'https://api.spotify.com/v1/me/player/queue',
      '--header',
      `Authorization: Bearer ${spotifyAccessToken()}`,
    ]);
    data = JSON.parse(res).queue;
    if (!data) throw new Error(`Unexpected Spotify response: ${res}`);
  } catch (err) {
    console.error(`Error with Spotify request: ${err}`);
    return;
  }

  if (thisRequest !== queueRequest) return;

  const images = data.map((song: Record<string, any>) => {
    const imageUrl = song.album.images[0]?.url; // 640x640, about 120kb

    if (!imageUrl && song.name)
      return `${home}/.config/ags/spotify/local.png`; // for local files
    if (!song.name) return `${home}/.config/ags/spotify/local.png`; // same image but for some weird stuff??

    const fileName = imageUrl.split('/').pop();

    execAsync(
      `test -f "${home}/.config/ags/spotify/${fileName}.jpg"`
    ).catch(() =>
      execAsync(
        `wget -q "${imageUrl}" -O "${home}/.config/ags/spotify/${fileName}.jpg"`
      ).catch(console.error)
    );

    return `${home}/.config/ags/spotify/${fileName}.jpg`;
  });

  setQueue(
    data.map((song: Record<string, any>, i: number) => [
      song.name || 'Song',
      song.artists[0].name || 'Artist',
      images[i],
    ])
  );
}

export function PlayerButton({
  altLayout = false,
  gdkmonitor,
}: {
  altLayout?: Boolean;
  gdkmonitor: Gdk.Monitor;
}) {
  function togglePlayer() {
    if (activePopup() == 'player') {
      setActivePopup(null);
    } else {
      setPlayerMargin(centeredMargin(playerButtonRef, gdkmonitor));
      getQueue();
      setActivePopup('player');
    }
  }

  let playerButtonRef!: Gtk.Widget;

  return (
    <button
      class="mpris"
      $={self => {
        playerButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}>
      {altLayout ? (
        <box>
          <overlay
            widthRequest={53}
            heightRequest={20}
            class="smallArt">
            <Gtk.Picture
              contentFit={Gtk.ContentFit.COVER}
              $type="overlay"
              $={self => {
                coverArt.subscribe(() => {
                  const path = coverArt();
                  if (path && path !== 'none') {
                    self.set_file(Gio.File.new_for_path(path));
                  }
                });
              }}
            />
            <Gtk.GestureClick
              button={1}
              onPressed={() => {
                execAsync('playerctl play-pause -p spotify');
              }}
            />
          </overlay>
          <box
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}>
            <label label={title} halign={Gtk.Align.START} />
            <label
              label={artist}
              halign={Gtk.Align.START}
              class="secondary"
            />
            <Gtk.GestureClick button={1} onPressed={togglePlayer} />
          </box>
        </box>
      ) : (
        <box>
          <box>
            <label
              class="icon"
              label={isPlaying(v => (v ? '' : ''))}
            />
            <Gtk.GestureClick
              button={1}
              onPressed={() => {
                execAsync('playerctl play-pause -p spotify');
              }}
            />
          </box>
          <box>
            <label label={title} /> - <label label={artist} />{' '}
            (spotify){' '}
            <Gtk.GestureClick button={1} onPressed={togglePlayer} />
          </box>
        </box>
      )}
    </button>
  );
}

export function PlayerPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="playerPopup"
      visible={activePopup(a => a == 'player')}
      margin={playerMargin}
      cssClass="playerOverlay"
      // halign={Gtk.Align.START}
      widthRequest={200}>
      <box
        class="title"
        orientation={Gtk.Orientation.VERTICAL}
        widthRequest={100}>
        <label label="Currently Playing" widthRequest={100} />
      </box>
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        heightRequest={80}
        halign={Gtk.Align.CENTER}
        class="song">
        {/* set widthRequest to 80 + margin */}
        <overlay
          heightRequest={80}
          widthRequest={95}
          class="coverArt">
          <Gtk.Picture
            contentFit={Gtk.ContentFit.COVER}
            $type="overlay"
            $={self => {
              coverArt.subscribe(() => {
                const path = coverArt();
                if (path && path !== 'none') {
                  self.set_file(Gio.File.new_for_path(path));
                }
              });
            }}
          />
        </overlay>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          class="songText">
          <label
            class="primary"
            label={title}
            halign={Gtk.Align.CENTER}
          />
          <label
            class="secondary"
            label={artist}
            halign={Gtk.Align.CENTER}
          />
          <box
            class="controls"
            orientation={Gtk.Orientation.HORIZONTAL}
            halign={Gtk.Align.CENTER}>
            <label
              class="control"
              label="󰙣"
              $={self => {
                self.set_cursor(
                  Gdk.Cursor.new_from_name('pointer', null)
                );
              }}>
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  onPrevious();
                  execAsync('playerctl previous -p spotify');
                }}
              />
            </label>
            <label
              class="control"
              label={isPlaying(v => (v ? '' : ''))}
              $={self => {
                self.set_cursor(
                  Gdk.Cursor.new_from_name('pointer', null)
                );
              }}>
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  execAsync('playerctl play-pause -p spotify');
                }}
              />
            </label>
            <label
              class="control"
              label="󰙡"
              $={self => {
                self.set_cursor(
                  Gdk.Cursor.new_from_name('pointer', null)
                );
              }}>
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  onSkip();
                  execAsync('playerctl next -p spotify');
                }}
              />
            </label>
          </box>
        </box>
      </box>
      <box orientation={Gtk.Orientation.VERTICAL} class="queue">
        <label label="Queue" class="qlabel" />

        <scrolledwindow heightRequest={300} widthRequest={300}>
          <box orientation={Gtk.Orientation.VERTICAL} class="songs">
            <For each={queue}>
              {song => (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  {/* make widthRequest width + margin */}
                  <overlay
                    heightRequest={40}
                    widthRequest={50}
                    class="queueTb">
                    <Gtk.Picture
                      contentFit={Gtk.ContentFit.COVER}
                      $type="overlay"
                      file={Gio.File.new_for_path(song[2])}
                    />
                  </overlay>

                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label
                      class="primary"
                      label={song[0]}
                      halign={Gtk.Align.START}
                    />
                    <label
                      class="secondary"
                      label={song[1]}
                      halign={Gtk.Align.START}
                    />
                  </box>
                </box>
              )}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </Popup>
  );
}
