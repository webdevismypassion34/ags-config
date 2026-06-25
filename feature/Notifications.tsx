import app from 'ags/gtk4/app';
import { For } from 'ags';
import { Gtk, Astal } from 'ags/gtk4';
const { TOP, RIGHT } = Astal.WindowAnchor;
import {
  deleteNotification,
  hideNotification,
  invokeAction,
  NotificationReceived,
  visibleNotifications,
} from '../utils/notifications';
import iconsData from '../icons.json';
import Gio from 'gi://Gio?version=2.0';
import Pango from 'gi://Pango?version=1.0';

const icons = iconsData as Record<string, any>;

const dummyNotification = {
  id: -1,
} as unknown as NotificationReceived;

const getIcon = (notification: NotificationReceived) => {
  const desktopEntry = notification.hints['desktop-entry'];

  if (desktopEntry === 'org.freedesktop.network-manager-applet')
    // Network manager icon
    return '/usr/share/icons/Tokyonight-Dark/status/48/nm-device-wireless.svg';
  if (notification.appName === 'blueman')
    // Bluetooth icon
    return '/usr/share/icons/Tokyonight-Dark/status/48/bluetooth.svg';

  return (
    Object.values(icons).find(i => i.desktopName === desktopEntry)
      ?.icon ?? null
  );
};

export function NotificationItem(notification: NotificationReceived) {
  const icon = getIcon(notification);
  return (
    <box
      class="notification"
      orientation={Gtk.Orientation.HORIZONTAL}
      marginTop={visibleNotifications(n =>
        Object.values(n).findIndex(v => v.id === notification.id) ===
        0
          ? 0
          : 5
      )}>
      <Gtk.GestureClick
        button={1}
        onPressed={() => {
          invokeAction(notification.id, 'default');
          hideNotification(notification.id);
          deleteNotification(notification.id);
        }}
      />
      <box valign={Gtk.Align.START} class="art">
        <overlay widthRequest={46} heightRequest={39} marginTop={2}>
          <box widthRequest={46} heightRequest={39} />
          <Gtk.Picture
            contentFit={Gtk.ContentFit.COVER}
            $type="overlay"
            class="icon"
            file={Gio.File.new_for_path(
              icon ||
                '/usr/share/icons/Tokyonight-Dark/status/32/image-missing.svg'
            )}
          />
        </overlay>
      </box>
      <box orientation={Gtk.Orientation.VERTICAL} widthRequest={300}>
        <label
          label={notification.summary}
          halign={Gtk.Align.START}
          class="summary"
        />
        <label
          label={notification.body}
          halign={Gtk.Align.START}
          class="body"
          wrap={true}
          maxWidthChars={35}
          wrapMode={Pango.WrapMode.WORD_CHAR}
        />
      </box>
    </box>
  );
}

export default function NotificationAlert() {
  return (
    <window
      class="notifications"
      anchor={TOP | RIGHT}
      marginTop={10}
      marginRight={10}
      application={app}
      visible={visibleNotifications(h => Object.keys(h).length > 0)}
      keymode={Astal.Keymode.NONE}>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For
          each={visibleNotifications(h => [
            dummyNotification,
            ...Object.values(h),
          ])}
          cleanup={_ => _}>
          {(notif: NotificationReceived) =>
            notif.id === -1 ? (
              <box class="hide" widthRequest={1} heightRequest={1} />
            ) : (
              NotificationItem(notif)
            )
          }
        </For>
      </box>
    </window>
  );
}
