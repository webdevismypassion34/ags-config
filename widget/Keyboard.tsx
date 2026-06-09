import { Gtk } from 'ags/gtk4';
import { inputMethod } from '../polls';
import { lock } from '../polls';

export function Keyboard({
  fcitx5 = true,
  caps_lock = false,
  num_lock = false,
}: {
  fcitx5?: boolean;
  caps_lock?: boolean;
  num_lock?: boolean;
} = {}) {
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} class="keyboard">
      <label visible={fcitx5} label={inputMethod} />
      <label class="icon" visible={caps_lock ? lock(l => l.caps) : false} label="󰌎" />
      <label visible={num_lock ? lock(l => l.num) : false} label="󰎾" />
    </box>
  );
}
