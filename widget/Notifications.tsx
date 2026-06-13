import { createComputed, createState, For } from 'ags';
import {
  NotificationReceived,
  notifications,
} from '../utils/notifications';
import { Gdk, Gtk } from 'ags/gtk4';
import { activePopup, setActivePopup } from '../state';
import { execAsync } from 'ags/process';
import Popup from '../components/Popup.tsx';
import { NotificationItem } from '../feature/Notifications.tsx';

const [ncMargin] = createState(-15);

export function NotificationButton({
  display = 'both',
}: {
  display?: 'both' | 'icon' | 'label';
}) {
  function toggleNc() {
    if (activePopup() === 'nc') {
      setActivePopup(null);
    } else {
      setActivePopup('nc');
    }
  }

  const notifIcon = createComputed(() => {
    if (notifications().length > 0) {
      return '󱅫';
    } else {
      return '󰂚';
    }
  });

  return (
    <button
      $={self =>
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
      }
      class="swaync"
      onClicked={toggleNc}>
      <box>
        <label
          class={'icon' + (display === 'icon' ? ' iconOnly' : '')}
          label={notifIcon}
          visible={display !== 'label'}
        />
        <label
          label={notifications(v => v.length.toString())}
          visible={display !== 'icon'}
        />
      </box>
    </button>
  );
}

export function NotificationPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="ncPopup"
      visible={activePopup(a => a == 'nc')}
      margin={ncMargin}
      cssClass="ncOverlay"
      halign={Gtk.Align.END}
      fullscreen>
      <box
        class="notifications"
        orientation={Gtk.Orientation.VERTICAL}>
        <box class="title">
          <label label="Notifications" />
        </box>
        <scrolledwindow
          heightRequest={500}
          hexpand={false}
          overflow={Gtk.Overflow.HIDDEN}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              label="no notifications to show"
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
              visible={notifications(v => v.length === 0)}
            />
            <For each={notifications}>{NotificationItem}</For>
          </box>
        </scrolledwindow>
      </box>
    </Popup>
  );
}
