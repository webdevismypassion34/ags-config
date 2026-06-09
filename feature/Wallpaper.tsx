import app from 'ags/gtk4/app';
import { createState, createComputed, For, Accessor } from 'ags';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
import { activePopup, setActivePopup } from '../state';
import { execAsync } from 'ags/process';
import { home } from '../polls';
import Graphene from 'gi://Graphene?version=1.0';
import Gio from 'gi://Gio?version=2.0';
import settings from '../utils/settings';

// don't include $HOME, e.g. 'wallpaper' instead of '~/wallpaper'
const wallpaperDirectory =
  settings().wallpaper?.wallpaperDirectory?.replaceAll(
    '%H',
    home
  ) as string;
const thumbnailDirectory = `${home}/.config/ags/wpthumbnail`;

const needsThumbnail = (wp: string) =>
  wp.endsWith('.gif') || wp.endsWith('.mp4');
const thumbnailPath = (wp: string) =>
  `${thumbnailDirectory}/${wp}.png`;

const [wallpapers, setWallpapers] = createState<string[]>([]);
const [selected, select] = createState<number>(0);
const [using, setUsing] = createState<string>('');

execAsync(`mkdir -p ${thumbnailDirectory}`).then(() =>
  execAsync(`ls ${wallpaperDirectory}`).then((out: string) => {
    const wps = out
      .split('\n')
      .filter(
        wp =>
          wp.endsWith('.jpeg') ||
          wp.endsWith('.jpg') ||
          wp.endsWith('.png') ||
          wp.endsWith('.gif') ||
          wp.endsWith('.mp4')
      );
    setWallpapers(wps);
    for (const wp of wps) {
      if (needsThumbnail(wp)) {
        const thumb = Gio.File.new_for_path(thumbnailPath(wp));
        if (!thumb.query_exists(null))
          execAsync(
            `ffmpeg -i "${wallpaperDirectory}/${wp}" -vframes 1 "${thumbnailPath(wp)}"`
          ).catch(console.error);
      }
    }
  })
);

execAsync('awww query -j').then((out: string) => {
  setUsing(JSON.parse(out)[''][0].displaying.image ?? '');
});

function WallpaperOption({
  wallpaper,
  visible,
  active,
  caption,
}: {
  wallpaper: any;
  visible: any;
  active: any;
  caption: Accessor<boolean>;
}) {
  return (
    <box
      halign={Gtk.Align.CENTER}
      visible={visible}
      class="preview"
      orientation={Gtk.Orientation.VERTICAL}>
      <overlay
        widthRequest={active() ? 960 : 240}
        heightRequest={active() ? 540 : 135}>
        <Gtk.Picture
          contentFit={Gtk.ContentFit.COVER}
          $type="overlay"
          class="icon"
          file={Gio.File.new_for_path(
            needsThumbnail(wallpaper)
              ? thumbnailPath(wallpaper)
              : `${wallpaperDirectory}/${wallpaper}`
          )}
        />
      </overlay>
      <label label={wallpaper} visible={caption} />
    </box>
  );
}

export default function WallpaperPicker(gdkmonitor: Gdk.Monitor) {
  let ref!: Gtk.Widget;

  const visibleWallpapers = createComputed(() => {
    const wps = wallpapers();
    const len = wps.length;
    if (len === 0) return [];
    const prev = (selected() - 1 + len) % len;
    const curr = selected();
    const next = (selected() + 1) % len;
    return [
      { wallpaper: wps[prev], active: false },
      { wallpaper: wps[curr], active: true },
      { wallpaper: wps[next], active: false },
    ];
  });

  return (
    <window
      visible={activePopup(v => v == 'wallpaper')}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      gdkmonitor={gdkmonitor}
      name="wallpaper"
      keymode={Astal.Keymode.ON_DEMAND}
      focusable={true}
      $={self => {
        ref = self;
        activePopup.subscribe(() => {
          if (activePopup() === 'wallpaper') {
            select(
              wallpapers()?.indexOf(
                using()?.split('/')?.pop() ?? ''
              ) ?? 0
            );
          }
        });
        const ctrl = new Gtk.EventControllerKey();

        ctrl.connect('key-pressed', async (_, keyval) => {
          if (keyval === Gdk.KEY_Up) {
            if (selected() == 0) {
              select(wallpapers().length - 1);
            } else {
              select(selected() - 1);
            }
          }
          if (keyval === Gdk.KEY_Down) {
            if (selected() == wallpapers().length - 1) {
              select(0);
            } else {
              select(selected() + 1);
            }
          }
          if (keyval === Gdk.KEY_Return) {
            await execAsync('pkill mpvpaper').catch(() => {});
            const wp = wallpapers()[selected()];
            const matugenSrc = needsThumbnail(wp)
              ? thumbnailPath(wp)
              : `${wallpaperDirectory}/${wp}`;
            if (wp.endsWith('.mp4')) {
              await execAsync(
                `setsid mpvpaper -o "no-audio loop" '*' "${wallpaperDirectory}/${wp}"`
              );
              execAsync(
                `matugen -m dark --source-color-index 0 image ${matugenSrc}`
              ).catch(console.error);
            } else {
              execAsync(
                `awww img --transition-type grow --transition-pos 0.857,0.977 --transition-step 90 ${wallpaperDirectory}/${wp}`
              );
              execAsync(
                `setsid matugen -m dark --source-color-index 0 image ${matugenSrc}`
              ).catch(console.error);
            }
          }
          if (keyval === Gdk.KEY_Escape) {
            setActivePopup(null);
          }
        });
        self.add_controller(ctrl);
      }}>
      <Gtk.GestureClick
        onPressed={(ctrl, _, x, y) => {
          const [ok, rect] = ref.compute_bounds(ctrl.get_widget()!);
          if (
            ok &&
            !rect.contains_point(new Graphene.Point({ x, y }))
          ) {
            setActivePopup(null);
          }
        }}
      />
      <box
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}>
        {/* <box
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          marginBottom={30}>
          <label label="search" />
        </box> */}
        <box
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          orientation={Gtk.Orientation.VERTICAL}
          class="wallpaper">
          <For each={visibleWallpapers}>
            {item => {
              return (
                <WallpaperOption
                  wallpaper={item.wallpaper}
                  visible={() => true}
                  active={() => item.active}
                  caption={visibleWallpapers(
                    i => i.indexOf(item) == 1
                  )}
                />
              );
            }}
          </For>
        </box>
      </box>
    </window>
  );
}
