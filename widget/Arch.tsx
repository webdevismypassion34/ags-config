import { createState, createComputed } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import { startMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';
import { activeWindow } from '../polls.ts';
import { visualClassOverrides } from '../utils/appList.ts';

activeWindow.subscribe(() => {});

const [archMargin, setArchMargin] = createState(0);
const [selectedWindow, setSelectedWindow] = createState<
  Record<string, any>
>({});
const windowIsSelected = createComputed(
  () => !!selectedWindow().class
);

export function ArchButton() {
  let archButtonRef!: Gtk.Widget;

  function toggleArch() {
    if (activePopup() === 'arch') {
      setActivePopup(null);
    } else {
      setSelectedWindow(activeWindow());
      console.log(selectedWindow(), activeWindow());
      setArchMargin(startMargin(archButtonRef));
      setActivePopup('arch');
    }
  }

  return (
    <button
      $={self => {
        archButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="arch"
      onClicked={toggleArch}>
      <label class="icon arch" label="󰣇" />
    </button>
  );
}

export function ArchPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="archPopup"
      visible={activePopup(a => a === 'arch')}
      margin={archMargin}
      cssClass="archOverlay"
      halign={Gtk.Align.START}
      widthRequest={175}>
      <button
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync('kitty --hold fastfetch');
        }}>
        <label label="about this distro" />
      </button>
      <button
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync(
            'notify-send "System Settings" "this isn\'t completed yet"'
          );
        }}>
        <label label="system settings" />
      </button>
      <Gtk.Separator orientation={Gtk.Orientation.HORIZONTAL} />
      <button
        visible={windowIsSelected}
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync(`pkill -15 -p ${selectedWindow().pid}`);
        }}>
        <label
          label={selectedWindow(
            w =>
              `quit ${visualClassOverrides[w.initialClass] ? visualClassOverrides[w.initialClass] : w.initialClass}`
          )}
        />
      </button>
      <button
        visible={windowIsSelected}
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync(`pkill -9 -p ${selectedWindow().pid}`);
        }}>
        <label
          label={selectedWindow(
            w =>
              `force quit ${visualClassOverrides[w.initialClass] ? visualClassOverrides[w.initialClass] : w.initialClass}`
          )}
        />
      </button>
      <Gtk.Separator
        orientation={Gtk.Orientation.HORIZONTAL}
        visible={windowIsSelected}
      />
      <button
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync('hyprlock');
        }}>
        <label label="lock" />
      </button>
      <button
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync('reboot');
        }}>
        <label label="reboot" />
      </button>
      <button
        $={self =>
          self.set_cursor(Gdk.Cursor.new_from_name('pointer', null))
        }
        onClicked={() => {
          setActivePopup(null);
          execAsync('shutdown');
        }}>
        <label label="shutdown" />
      </button>
    </Popup>
  );
}
