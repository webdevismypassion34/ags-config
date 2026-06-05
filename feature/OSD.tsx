import app from 'ags/gtk4/app';
import { createState } from 'ags';
import { Gdk, Gtk, Astal } from 'ags/gtk4';
const { TOP, LEFT, BOTTOM, RIGHT } = Astal.WindowAnchor;
import { cssColor } from '../utils/parseCss';

const [brightness, setBrightness] = createState<number>(0);
const [volume, setVolume] = createState<number>(0);
const [display, setDisplay] = createState<{
  type: 'brightness' | 'volume' | 'none';
  value: number;
}>({ type: 'none', value: 0 });

let hideTimer: ReturnType<typeof setTimeout>;

export { setBrightness, setVolume };

brightness.subscribe(() => {
  clearTimeout(hideTimer);
  setDisplay({ type: 'brightness', value: brightness() });
  hideTimer = setTimeout(
    () => setDisplay({ type: 'none', value: 0 }),
    2000
  );
});

volume.subscribe(() => {
  clearTimeout(hideTimer);
  setDisplay({ type: 'volume', value: volume() });
  hideTimer = setTimeout(
    () => setDisplay({ type: 'none', value: 0 }),
    2000
  );
});

export default function OSD() {
  return (
    <window
      class="osd"
      anchor={TOP}
      marginTop={10}
      application={app}
      visible={display(d => d.type != 'none')}
      keymode={Astal.Keymode.NONE}>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <label label={display(v => v.type)} />
        <label label={display(v => v.value.toString() + '%')} />
        <Gtk.DrawingArea
          class="bar"
          widthRequest={100}
          heightRequest={15}
          $={self => {
            self.set_draw_func((_, cr, w, h) => {
              function roundedRect(
                cr: any,
                x: number,
                y: number,
                w: number,
                h: number,
                r: number
              ) {
                cr.arc(x + r, y + r, r, Math.PI, (3 * Math.PI) / 2);
                cr.arc(x + w - r, y + r, r, (3 * Math.PI) / 2, 0);
                cr.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
                cr.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
                cr.closePath();
              }

              if (display().type == 'none') return;

              const percent = display().value / 100;
              cr.setLineWidth(2);

              roundedRect(cr, 0, 0, 100, 10, 5);
              cr.setSourceRGBA(...cssColor('bg'));
              cr.fill();

              roundedRect(
                cr,
                0,
                0,
                Math.max(10, 100 * percent),
                10,
                5
              );
              cr.setSourceRGBA(...cssColor('subtext1'));
              cr.fill();
            });

            display.subscribe(() => self.queue_draw());
          }}
        />
      </box>
    </window>
  );
}
