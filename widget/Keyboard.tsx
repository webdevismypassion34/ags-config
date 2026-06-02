import { Gtk } from 'ags/gtk4';
import { inputMethod } from '../polls';
import { lock } from '../polls';

export function Keyboard() {
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} class="keyboard">
      <label label={inputMethod} />
      <label class="icon" visible={lock(l => l.caps)} label="󰌎" />
      <label visible={lock(l => l.num)} label="󰎾" />
    </box>
  );
}
