import { createState, createComputed } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import { brightness } from '../polls.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';

const [tempBrightness, setTempBrightness] = createState(0);
export { setTempBrightness };

brightness.subscribe(() => {
  setTempBrightness(brightness());
});

const [brightnessMargin, setBrightnessMargin] = createState(0);

export function BrightnessButton({
  gdkmonitor,
  display = 'both',
  percent = false,
}: {
  gdkmonitor: Gdk.Monitor;
  display?: 'both' | 'icon' | 'label';
  percent?: boolean;
}) {
  function toggleBrightness() {
    if (activePopup() == 'brightness') {
      setActivePopup(null);
    } else {
      setBrightnessMargin(
        centeredMargin(brightnessButtonRef, gdkmonitor)
      );
      setActivePopup('brightness');
    }
  }

  const brightnessIcon = createComputed(() => {
    if (tempBrightness() == 0) {
      return '󰃞';
    } else {
      return '󰃠';
    }
  });

  let brightnessButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        brightnessButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="brightness"
      onClicked={toggleBrightness}>
      <box>
        <label
          label={brightnessIcon}
          class={'icon' + (display === 'icon' ? ' iconOnly' : '')}
          visible={display !== 'label'}
        />
        <label
          label={
            percent
              ? tempBrightness(v => v + '%')
              : tempBrightness(String)
          }
          visible={display !== 'icon'}
        />
      </box>
    </button>
  );
}

export function BrightnessPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="brightnessPopup"
      visible={activePopup(a => a == 'brightness')}
      margin={brightnessMargin}
      cssClass="brightnessOverlay"
      widthRequest={100}>
      <box class="title" orientation={Gtk.Orientation.VERTICAL}>
        <label label="Brightness" />
      </box>
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        halign={Gtk.Align.CENTER}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Gtk.Scale
            orientation={Gtk.Orientation.VERTICAL}
            inverted={true}
            heightRequest={200}
            $={self => {
              let settingFromCode = false;
              tempBrightness.subscribe(() => {
                settingFromCode = true;
                self
                  .get_adjustment()
                  .set_value(tempBrightness() || 0);
                settingFromCode = false;
              });
              self.connect('value-changed', () => {
                if (!settingFromCode) {
                  setTempBrightness(Math.floor(self.get_value()));

                  execAsync(
                    `brightnessctl -n2 set ${Math.round(self.get_value())}%`
                  );
                }
              });
            }}
            adjustment={
              new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                value: tempBrightness() || 0,
                step_increment: 1,
              })
            }
          />
        </box>
      </box>
    </Popup>
  );
}
