import { createComputed } from 'ags';
import { notifCount } from '../polls';
import { Gdk } from 'ags/gtk4';
import { setActivePopup } from '../state';
import { execAsync } from 'ags/process';

export function NotificationButton({
  display = 'both',
}: {
  display?: 'both' | 'icon' | 'label';
}) {
  const notifIcon = createComputed(() => {
    if (parseInt(notifCount()) > 0) {
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
      onClicked={() => {
        setActivePopup(null);
        execAsync('swaync-client -op');
      }}>
      <box>
        <label
          class={'icon' + (display === 'icon' ? ' iconOnly' : '')}
          label={notifIcon}
          visible={display !== 'label'}
        />
        <label label={notifCount} visible={display !== 'icon'} />
      </box>
    </button>
  );
}
