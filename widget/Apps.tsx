import { For } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk } from 'ags/gtk4';
import { activeWindow } from '../polls.ts';
import { openWindows } from '../polls.ts';
import appList from '../utils/appList.ts';
import iconsData from '../icons.json';
import Gio from 'gi://Gio?version=2.0';

const icons = iconsData as Record<string, Record<string, string>>;

export function Apps() {
  return (
    <box>
      <For each={openWindows}>
        {(window: Record<string, string>) => {
          const appListEntry =
            appList().filter(
              app =>
                app[1].toLowerCase() ==
                window.initialTitle.toLowerCase()
            )[0] ??
            appList().filter(
              app =>
                app[1].toLowerCase() ==
                window.initialClass.toLowerCase()
            )[0];
          const icon =
            Object.values(icons)?.filter(
              icon =>
                icon.class.toLowerCase() ==
                  window.initialClass.toLowerCase() ||
                icon.class.toLowerCase() ==
                  window.initialTitle.toLowerCase()
            )?.[0]?.icon ?? null;
          return (
            <button class="apps">
              <box orientation={Gtk.Orientation.VERTICAL}>
                <overlay widthRequest={40} heightRequest={40}>
                  {icon ? (
                    <Gtk.Picture
                      file={Gio.File.new_for_path(
                        icon ||
                          '/usr/share/icons/Tokyonight-Dark/status/32/image-missing.svg'
                      )}
                      contentFit={Gtk.ContentFit.CONTAIN}
                      $type="overlay"
                    />
                  ) : (
                    <Gtk.Image
                      iconName={window.initialClass.toLowerCase()}
                      iconSize={Gtk.IconSize.LARGE}
                      $type="overlay"
                    />
                  )}
                </overlay>
                {/* <label label={window.initialTitle} /> */}
                <label label={window.initialClass} />
              </box>
            </button>
          );
        }}
      </For>
    </box>
  );
}
