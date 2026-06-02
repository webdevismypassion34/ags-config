import { createState, createComputed } from 'ags';
import { execAsync } from 'ags/process';
import { Gtk, Gdk } from 'ags/gtk4';
import {
  volume,
  volumeMuted,
  input,
  inputMuted,
  appsUsingMic,
} from '../polls.ts';
import { centeredMargin } from '../utils/margin.ts';
import Popup from '../components/Popup.tsx';
import { activePopup, setActivePopup } from '../state.ts';

const [tempVolume, setTempVolume] = createState('');
export { setTempVolume };

volume.subscribe(() => {
  setTempVolume(volume());
});

const [volumeMargin, setVolumeMargin] = createState(0);

export function VolumeButton({
  gdkmonitor,
  display = 'both',
  percent = false,
}: {
  gdkmonitor: Gdk.Monitor;
  display?: 'both' | 'icon' | 'label';
  percent?: boolean;
}) {
  function toggleVolume() {
    if (activePopup() == 'volume') {
      setActivePopup(null);
    } else {
      setVolumeMargin(centeredMargin(volumeButtonRef, gdkmonitor));
      setActivePopup('volume');
    }
  }

  const volumeIcon = createComputed(() => {
    if (parseInt(tempVolume()) == 0) {
      return '󰝟';
    } else {
      return '󰕾';
    }
  });

  let volumeButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        volumeButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="volume"
      onClicked={toggleVolume}>
      <box>
        <label
          label={volumeIcon}
          class="icon"
          visible={display !== 'label'}
        />
        <label
          label={percent ? tempVolume(v => v + '%') : tempVolume}
          visible={display !== 'icon'}
        />
      </box>
    </button>
  );
}

export function VolumePopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="volumePopup"
      visible={activePopup(a => a == 'volume')}
      margin={volumeMargin}
      cssClass="volumeOverlay"
      widthRequest={175}>
      <box class="title" orientation={Gtk.Orientation.VERTICAL}>
        <label label="Sound" />
      </box>
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        halign={Gtk.Align.CENTER}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Gtk.Scale
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={200}
            sensitive={volumeMuted(v => !v)}
            $={self => {
              let settingFromCode = false;
              tempVolume.subscribe(() => {
                settingFromCode = true;
                self
                  .get_adjustment()
                  .set_value(parseInt(tempVolume()) || 0);
                settingFromCode = false;
              });
              self.connect('value-changed', () => {
                if (!settingFromCode) {
                  setTempVolume(self.get_value().toString());
                  execAsync(
                    `wpctl set-volume @DEFAULT_SINK@ ${self.get_value() / 100}`
                  );
                }
              });
            }}
            adjustment={
              new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                value: parseInt(tempVolume()) || 0,
                step_increment: 1,
              })
            }
          />
          <button
            class="muteToggle"
            $={self =>
              self.set_cursor(
                Gdk.Cursor.new_from_name('pointer', null)
              )
            }
            onClicked={() =>
              execAsync('wpctl set-mute @DEFAULT_SINK@ toggle')
            }>
            <label label="vol" />
          </button>
        </box>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Gtk.Scale
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={200}
            sensitive={inputMuted(v => !v)}
            $={self => {
              let settingFromCode = false;
              input.subscribe(() => {
                settingFromCode = true;
                self
                  .get_adjustment()
                  .set_value(parseInt(input()) || 0);
                settingFromCode = false;
              });
              self.connect('value-changed', () => {
                if (!settingFromCode)
                  execAsync(
                    `wpctl set-volume @DEFAULT_SOURCE@ ${self.get_value() / 100}`
                  );
              });
            }}
            adjustment={
              new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                value: parseInt(input()) || 0,
                step_increment: 1,
              })
            }
          />
          <button
            class="muteToggle"
            $={self =>
              self.set_cursor(
                Gdk.Cursor.new_from_name('pointer', null)
              )
            }
            onClicked={() =>
              execAsync('wpctl set-mute @DEFAULT_SOURCE@ toggle')
            }>
            <label label="mic" />
          </button>
        </box>
      </box>
      <label
        wrap={true}
        maxWidthChars={20}
        label={appsUsingMic(apps =>
          apps.length ? apps.join(', ') + ' is using mic' : ''
        )}
      />
    </Popup>
  );
}
