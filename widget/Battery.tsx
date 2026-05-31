import { createState, createComputed } from 'ags';
import { Gtk, Gdk } from 'ags/gtk4';
import { batteryPercent, batteryStatus } from '../polls.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';
import PangoCairo from 'gi://PangoCairo?version=1.0';
import Pango from 'gi://Pango?version=1.0';

const [batteryMargin, setBatteryMargin] = createState(0);

const batteryCharging = createComputed(() => {
  if (!batteryStatus()) return '';
  const status = JSON.parse(batteryStatus());
  return status.state + ' at ' + status['energy-rate'];
});

const batteryLeft = createComputed(() => {
  if (!batteryStatus()) return '';
  const status = JSON.parse(batteryStatus());
  if (status.state == 'charging') {
    return status['time to full'] + ' until full';
  } else {
    return status['time to empty'] + ' until empty';
  }
});

const batteryIcon = createComputed(() => {
  // if (batteryStatus() == 'Charging') return ;
  const percent = parseInt(batteryPercent());
  if (percent < 13) {
    return ''; // empty1 - 5 of 5
  } else if (percent < 38) {
    return ''; // 25%
  } else if (percent < 63) {
    return ''; // 50%
  } else if (percent < 88) {
    return ''; // 75%
  } else {
    return ''; // full
  }
});

export function BatteryButton({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  function toggleBattery() {
    if (activePopup() == 'battery') {
      setActivePopup(null);
    } else {
      setBatteryMargin(centeredMargin(batteryButtonRef, gdkmonitor));
      setActivePopup('battery');
    }
  }

  let batteryButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        batteryButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="battery"
      onClicked={() => {
        toggleBattery();
      }}>
      <box>
        <label label={batteryIcon} class="icon" />
        <label label={batteryPercent} />
      </box>
    </button>
  );
}

export function BatteryPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="batteryPopup"
      visible={activePopup(a => a == 'battery')}
      margin={batteryMargin}
      cssClass="batteryOverlay">
      <box class="title">
        <label label="Battery" />
      </box>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <Gtk.DrawingArea
          widthRequest={150}
          heightRequest={150}
          $={self => {
            self.set_draw_func((_, cr, w, h) => {
              const percent = parseInt(batteryPercent()) / 100;
              const cx = w / 2,
                cy = h / 2,
                r = 60;
              const layout = PangoCairo.create_layout(cr);
              const desc = Pango.FontDescription.from_string(
                'JetBrainsMono Nerd Font Mono Bold 24'
              );
              layout.set_font_description(desc);
              layout.set_text(`${Math.round(percent * 100)}%`, -1);
              cr.setLineWidth(12);
              cr.setSourceRGBA(
                0.192156863,
                0.196078431,
                0.266666667,
                0.4
              );
              cr.arc(cx, cy, r, 0, 2 * Math.PI);
              cr.stroke();
              cr.setSourceRGBA(
                0.192156863,
                0.196078431,
                0.266666667,
                1
              );
              cr.arc(
                cx,
                cy,
                r,
                -Math.PI / 2,
                -Math.PI / 2 + 2 * Math.PI * percent
              );
              cr.stroke();
              const [textW, textH] = layout.get_pixel_size();
              cr.moveTo(cx - textW / 2, cy - textH / 2);
              PangoCairo.show_layout(cr, layout);
            });
            batteryPercent.subscribe(() => self.queue_draw());
          }}
        />
        <label
          label="calculating..."
          visible={batteryLeft((b: string) =>
            b.includes('undefined')
          )}
        />
        <label
          visible={batteryLeft(
            (b: string) => !b.includes('undefined')
          )}
          label={batteryCharging}
        />
        <label
          visible={batteryLeft(
            (b: string) => !b.includes('undefined')
          )}
          label={batteryLeft}
        />
      </box>
    </Popup>
  );
}
